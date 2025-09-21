// app/api/dashboard/stats/route.ts

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    // 1. Total de Membros
    const totalMembers = await prisma.user.count();

    // 2. Tarefas Ativas (não concluídas)
    const activeTasks = await prisma.task.count({
      where: {
        status: {
          not: "concluido",
        },
      },
    });

    // 3. Tarefas em Revisão
    const pendingReviews = await prisma.task.count({
      where: {
        status: "revisao",
      },
    });

    // 4. Taxa de Conclusão (Performance da Equipe)
    const totalTasks = await prisma.task.count();
    const completedTasks = await prisma.task.count({
      where: {
        status: "concluido",
      },
    });
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const stats = {
      totalMembers,
      activeTasks,
      pendingReviews,
      completionRate,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[DASHBOARD_STATS_ERROR]", error);
    return NextResponse.json({ error: "Falha ao buscar estatísticas do dashboard." }, { status: 500 });
  }
}