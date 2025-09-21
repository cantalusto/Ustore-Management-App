// app/api/analytics/tasks/route.ts

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role === "member") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  try {
    // Distribuição por Status
    const statusDistributionRaw = await prisma.task.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    const statusDistribution = statusDistributionRaw.map(item => ({
        name: item.status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: item._count.status,
        color: { 'a-fazer': '#6b7280', 'em-progresso': '#3b82f6', 'revisao': '#f59e0b', 'concluido': '#10b981' }[item.status] || '#ccc'
    }));

    // Distribuição por Prioridade
    const priorityDistributionRaw = await prisma.task.groupBy({
        by: ['priority'],
        _count: { priority: true }
    });
    const priorityDistribution = priorityDistributionRaw.map(item => ({
        name: item.priority.charAt(0).toUpperCase() + item.priority.slice(1),
        value: item._count.priority
    }));
    
    // Desempenho por Departamento
    const departmentStatsRaw = await prisma.user.findMany({
        where: { department: { not: null } },
        select: {
            department: true,
            assignedTasks: {
                select: { status: true }
            }
        }
    });

    const departmentStatsMap = new Map<string, { completed: number, pending: number }>();
    departmentStatsRaw.forEach(user => {
        if (user.department) {
            if (!departmentStatsMap.has(user.department)) {
                departmentStatsMap.set(user.department, { completed: 0, pending: 0 });
            }
            const stats = departmentStatsMap.get(user.department)!;
            user.assignedTasks.forEach(task => {
                if (task.status === 'concluido') stats.completed++;
                else stats.pending++;
            });
        }
    });

    const departmentStats = Array.from(departmentStatsMap.entries()).map(([department, stats]) => ({
        department,
        ...stats
    }));

    const data = {
      statusDistribution,
      priorityDistribution,
      completionTrend: [], // O cálculo de tendência requer mais lógica, deixado como exemplo
      departmentStats,
    };

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[ANALYTICS_TASKS_ERROR]", error);
    return NextResponse.json({ error: "Falha ao buscar dados de análise de tarefas." }, { status: 500 });
  }
}