// app/api/analytics/overview/route.ts

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { subDays } from "date-fns";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role === "member") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const range = parseInt(searchParams.get("range")?.replace('d', '') || "30", 10);
    const department = searchParams.get('department');
    const memberId = searchParams.get('memberId');
    const startDate = subDays(new Date(), range);

    // Filtro base para usuário (departamento/membro)
    const userFilter: any = {};
    if (department) userFilter.department = department;
    if (memberId) userFilter.id = parseInt(memberId);

    // Filtro para tarefas criadas no período
    const taskWhere: any = {
      createdAt: { gte: startDate }
    };
    if (Object.keys(userFilter).length > 0) {
      taskWhere.assignee = userFilter;
    }

    const tasks = await prisma.task.findMany({
      where: taskWhere
    });
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'concluido').length;

    // Filtro para tarefas atrasadas (não depende do período de criação)
    const overdueTaskFilter: any = {
      dueDate: { lt: new Date() },
      status: { not: 'concluido' }
    };
    if (Object.keys(userFilter).length > 0) {
        overdueTaskFilter.assignee = userFilter;
    }
    const overdueTasks = await prisma.task.count({
      where: overdueTaskFilter
    });

    // Filtro para membros ativos
    const activeMembersWhere: any = { status: 'active' };
    if (Object.keys(userFilter).length > 0) {
      Object.assign(activeMembersWhere, userFilter);
    }
    const activeMembers = await prisma.user.count({
      where: activeMembersWhere
    });

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const stats = {
      totalTasks,
      completedTasks,
      overdueTasks,
      activeMembers,
      completionRate,
      avgCompletionTime: 3.2, // Placeholder
      trends: {
        tasks: totalTasks > 10 ? 8 : -2,
        completion: completionRate > 50 ? 12 : -5,
        members: activeMembers > 5 ? 2 : 0,
      },
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("[ANALYTICS_OVERVIEW_ERROR]", error);
    return NextResponse.json({ error: "Falha ao buscar dados de visão geral." }, { status: 500 });
  }
}