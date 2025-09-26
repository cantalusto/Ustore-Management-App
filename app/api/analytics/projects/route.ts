// app/api/analytics/projects/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient, Task } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role === "member") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const memberId = searchParams.get('memberId');

    const userFilter: any = {};
    if (department) userFilter.department = department;
    if (memberId) userFilter.id = parseInt(memberId);

    const taskWhere: any = {
      project: { not: null }
    };

    if (Object.keys(userFilter).length > 0) {
      taskWhere.assignee = userFilter;
    }

    const tasks = await prisma.task.findMany({
      where: taskWhere
    });

    const projectsMap = new Map<string, { totalTasks: number; completedTasks: number; tasks: Task[] }>();

    tasks.forEach(task => {
      if (task.project) {
        if (!projectsMap.has(task.project)) {
          projectsMap.set(task.project, { totalTasks: 0, completedTasks: 0, tasks: [] });
        }
        const projectData = projectsMap.get(task.project)!;
        projectData.totalTasks++;
        if (task.status === 'concluido') {
          projectData.completedTasks++;
        }
        projectData.tasks.push(task);
      }
    });

    let idCounter = 1;
    const projects = Array.from(projectsMap.entries()).map(([name, data]) => {
      const progress = data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0;
      const dueDate = data.tasks.reduce((latest, task) => new Date(task.dueDate) > latest ? new Date(task.dueDate) : latest, new Date(0));
      
      let status: "on-track" | "at-risk" | "delayed" = "on-track";
      if (progress < 50 && new Date() > new Date(dueDate.getTime() - 15 * 24 * 60 * 60 * 1000)) status = "at-risk";
      if (progress < 80 && new Date() > dueDate) status = "delayed";

      return {
        id: idCounter++,
        name,
        description: `Projeto ${name}`,
        progress,
        totalTasks: data.totalTasks,
        completedTasks: data.completedTasks,
        teamMembers: new Set(data.tasks.map(t => t.assigneeId)).size,
        dueDate: dueDate.toISOString(),
        status,
        priority: "medium" as const,
      };
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("[PROJECT_PROGRESS_ERROR]", error);
    return NextResponse.json({ error: "Falha ao buscar dados de progresso dos projetos." }, { status: 500 });
  }
}