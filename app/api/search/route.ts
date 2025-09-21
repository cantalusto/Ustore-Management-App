// app/api/search/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  if (!query.trim()) {
    return NextResponse.json({ results: [] });
  }

  const results = [];

  // Buscar tarefas
  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
        { project: { contains: query } },
        { tags: { contains: query } },
      ],
    },
    include: { assignee: true }, // Incluir dados do usuário responsável
    take: 5,
  });

  for (const task of tasks) {
    results.push({
      id: `task-${task.id}`,
      type: "task",
      title: task.title,
      subtitle: `Atribuído a ${task.assignee.name}`,
      description: task.description,
      metadata: task.project,
    });
  }

  // Buscar membros (se tiver permissão)
  if (user.role === "admin" || user.role === "manager") {
    const members = await prisma.user.findMany({
        where: {
            OR: [
                { name: { contains: query } },
                { email: { contains: query } },
                { department: { contains: query } },
            ]
        },
        take: 5,
    });

    for (const member of members) {
      results.push({
        id: `member-${member.id}`,
        type: "member",
        title: member.name,
        subtitle: member.email,
        description: member.department,
      });
    }
  }

  // A busca por projetos pode ser feita agregando as tarefas
  const projectTasks = await prisma.task.findMany({
      where: { project: { contains: query, not: null } },
      select: { project: true },
      distinct: ['project']
  });

  for (const task of projectTasks) {
      if (task.project) {
        results.push({
            id: `project-${task.project.replace(/\s+/g, '-')}`,
            type: "project",
            title: task.project,
            subtitle: `Todas as tarefas do projeto ${task.project}`,
        });
      }
  }


  return NextResponse.json({ results: results.slice(0, 10) });
}