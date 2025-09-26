// Mentoria/app/api/analytics/team-performance/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role === "member") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const memberId = searchParams.get('memberId');

    const where: any = {};
    if (department) where.department = department;
    if (memberId) where.id = parseInt(memberId);

    const usersWithTasks = await prisma.user.findMany({
      where,
      include: {
        assignedTasks: true,
      },
    });

    const members = usersWithTasks.map(user => {
      const tasksAssigned = user.assignedTasks.length;
      const tasksCompleted = user.assignedTasks.filter(t => t.status === 'concluido').length;
      const completionRate = tasksAssigned > 0 ? Math.round((tasksCompleted / tasksAssigned) * 100) : 0;

      return {
        id: user.id,
        name: user.name,
        role: user.role,
        department: user.department || 'N/A',
        tasksCompleted,
        tasksAssigned,
        completionRate,
        avgCompletionTime: 0, // Cálculo complexo, deixado como placeholder
        trend: completionRate > 80 ? 5 : -2, // Lógica de tendência simplificada
      };
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("[TEAM_PERFORMANCE_ERROR]", error);
    return NextResponse.json({ error: "Falha ao buscar dados de desempenho da equipe." }, { status: 500 });
  }
}