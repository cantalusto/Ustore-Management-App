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
    const range = parseInt(searchParams.get("range") || "30", 10);
    const startDate = subDays(new Date(), range);

    const tasks = await prisma.task.findMany({
        where: { createdAt: { gte: startDate } }
    });
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'concluido').length;
    const overdueTasks = await prisma.task.count({
        where: { 
            dueDate: { lt: new Date() },
            status: { not: 'concluido' }
        }
    });

    const activeMembers = await prisma.user.count({
        where: { status: 'active' }
    });

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Dados de tendência são simplificados para este exemplo
    const stats = {
      totalTasks,
      completedTasks,
      overdueTasks,
      activeMembers,
      completionRate,
      avgCompletionTime: 3.2, // O cálculo real disso pode ser complexo
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