import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user || user.role === "member") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  // Mock de dados de projetos - substitua por consultas reais ao banco de dados
  const projects = [
    {
      id: 1,
      name: "Redesenho do Site",
      description: "Revisão completa do site da empresa com design moderno",
      progress: 75,
      totalTasks: 24,
      completedTasks: 18,
      teamMembers: 6,
      dueDate: "2024-02-15",
      status: "on-track" as const,
      priority: "high" as const,
    },
    {
      id: 2,
      name: "Desenvolvimento de App Mobile",
      description: "Aplicativo móvel nativo para iOS e Android",
      progress: 45,
      totalTasks: 32,
      completedTasks: 14,
      teamMembers: 4,
      dueDate: "2024-03-30",
      status: "at-risk" as const,
      priority: "high" as const,
    },
    {
      id: 3,
      name: "Campanha de Marketing",
      description: "Campanha de marketing digital do primeiro trimestre em todos os canais",
      progress: 90,
      totalTasks: 15,
      completedTasks: 13,
      teamMembers: 3,
      dueDate: "2024-01-31",
      status: "on-track" as const,
      priority: "medium" as const,
    },
    {
      id: 4,
      name: "Infraestrutura DevOps",
      description: "Configuração de pipeline de CI/CD e sistemas de monitoramento",
      progress: 30,
      totalTasks: 18,
      completedTasks: 5,
      teamMembers: 2,
      dueDate: "2024-02-28",
      status: "delayed" as const,
      priority: "medium" as const,
    },
  ]

  return NextResponse.json({ projects })
}