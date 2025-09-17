import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user || user.role === "member") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const range = searchParams.get("range") || "30d"

  // Mock de dados de análise de tarefas - substitua por consultas reais ao banco de dados
  const data = {
    statusDistribution: [
      { name: "A Fazer", value: 12, color: "#6b7280" },
      { name: "Em Progresso", value: 8, color: "#3b82f6" },
      { name: "Revisão", value: 5, color: "#f59e0b" },
      { name: "Concluído", value: 22, color: "#10b981" },
    ],
    priorityDistribution: [
      { name: "Baixa", value: 15 },
      { name: "Média", value: 20 },
      { name: "Alta", value: 10 },
      { name: "Urgente", value: 2 },
    ],
    completionTrend: [
      { date: "2024-01-01", completed: 3, created: 5 },
      { date: "2024-01-02", completed: 2, created: 3 },
      { date: "2024-01-03", completed: 4, created: 2 },
      { date: "2024-01-04", completed: 1, created: 4 },
      { date: "2024-01-05", completed: 5, created: 3 },
      { date: "2024-01-06", completed: 3, created: 1 },
      { date: "2024-01-07", completed: 2, created: 6 },
    ],
    departmentStats: [
      { department: "Desenvolvimento", completed: 18, pending: 7 },
      { department: "Design", completed: 12, pending: 4 },
      { department: "Marketing", completed: 8, pending: 3 },
      { department: "Gestão", completed: 6, pending: 2 },
    ],
  }

  return NextResponse.json({ data })
}