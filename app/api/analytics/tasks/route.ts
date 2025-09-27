// app/api/analytics/tasks/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { subDays, format } from "date-fns";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role === "member") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const range = parseInt(searchParams.get("range")?.replace('d', '') || "30", 10);
    const department = searchParams.get('department');
    const memberId = searchParams.get('memberId');
    const startDate = subDays(new Date(), range);

    // Objeto base para o filtro de tarefas
    const taskWhere: any = {
      createdAt: { gte: startDate },
    };

    // Objeto para o filtro de usuário
    const userFilter: any = {};
    if (department) userFilter.department = department;
    if (memberId) userFilter.id = parseInt(memberId);

    // ✅ CORREÇÃO: Lógica para evitar a junção ambígua
    if (Object.keys(userFilter).length > 0) {
      // 1. Primeiro, buscamos os IDs dos usuários que correspondem ao filtro
      const users = await prisma.user.findMany({
        where: userFilter,
        select: { id: true },
      });
      const userIds = users.map(u => u.id);

      // Se nenhum usuário for encontrado, não haverá tarefas para retornar
      if (userIds.length === 0) {
        // Retorna dados vazios para evitar erros
        return NextResponse.json({ data: { statusDistribution: [], priorityDistribution: [], completionTrend: [], departmentStats: [] } });
      }

      // 2. Em seguida, filtramos as tarefas usando 'assigneeId' com a lista de IDs
      taskWhere.assigneeId = { in: userIds };
    }

    // --- DISTRIBUIÇÃO POR STATUS ---
    // Agora esta consulta não é mais ambígua
    const statusDistributionRaw = await prisma.task.groupBy({
      by: ['status'],
      _count: { status: true },
      where: taskWhere,
    });
    const statusDistribution = statusDistributionRaw.map(item => ({
      name: item.status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: item._count.status,
      color: { 'a-fazer': '#6b7280', 'em-progresso': '#3b82f6', 'revisao': '#f59e0b', 'concluido': '#10b981' }[item.status] || '#ccc'
    }));

    // --- DISTRIBUIÇÃO POR PRIORIDADE ---
    const priorityDistributionRaw = await prisma.task.groupBy({
      by: ['priority'],
      _count: { priority: true },
      where: taskWhere,
    });
    const priorityDistribution = priorityDistributionRaw.map(item => ({
      name: item.priority.charAt(0).toUpperCase() + item.priority.slice(1),
      value: item._count.priority,
    }));
    
    // --- DESEMPENHO POR DEPARTAMENTO ---
    const departmentUserWhere: any = { department: { not: null } };
    if (department) departmentUserWhere.department = department;
    if (memberId) departmentUserWhere.id = parseInt(memberId);
    
    const departmentStatsRaw = await prisma.user.findMany({
      where: departmentUserWhere,
      select: {
        department: true,
        assignedTasks: {
          where: { createdAt: { gte: startDate } },
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

    // --- CÁLCULO DA TENDÊNCIA DE CONCLUSÃO ---
    const tasksForTrend = await prisma.task.findMany({
      where: taskWhere,
      select: { createdAt: true, status: true, updatedAt: true },
    });

    const trendData = new Map<string, { created: number, completed: number }>();
    for (let i = 0; i < range; i++) {
        const date = format(subDays(new Date(), i), 'dd/MM');
        trendData.set(date, { created: 0, completed: 0 });
    }

    tasksForTrend.forEach(task => {
        const createdDate = format(new Date(task.createdAt), 'dd/MM');
        if (trendData.has(createdDate)) {
            trendData.get(createdDate)!.created++;
        }
        if (task.status === 'concluido') {
            const completedDate = format(new Date(task.updatedAt), 'dd/MM');
            if (trendData.has(completedDate)) {
                trendData.get(completedDate)!.completed++;
            }
        }
    });
    
    const completionTrend = Array.from(trendData.entries())
        .map(([date, data]) => ({ date, ...data }))
        .reverse();

    const data = {
      statusDistribution,
      priorityDistribution,
      completionTrend,
      departmentStats,
    };

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[ANALYTICS_TASKS_ERROR]", error);
    return NextResponse.json({ error: "Falha ao buscar dados de análise de tarefas." }, { status: 500 });
  }
}