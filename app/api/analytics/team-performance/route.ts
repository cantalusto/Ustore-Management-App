import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user || user.role === "member") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  // Mock team performance data - replace with real database queries
  const members = [
    {
      id: 1,
      name: "Dante Alighieri",
      role: "admin",
      department: "Gestão",
      tasksCompleted: 15,
      tasksAssigned: 18,
      completionRate: 83,
      avgCompletionTime: 2.5,
      trend: 5,
    },
    {
      id: 2,
      name: "Gerente de Projeto",
      role: "manager",
      department: "Desenvolvimento",
      tasksCompleted: 22,
      tasksAssigned: 25,
      completionRate: 88,
      avgCompletionTime: 3.1,
      trend: 8,
    },
    {
      id: 3,
      name: "Membro da Equipe",
      role: "member",
      department: "Desenvolvimento",
      tasksCompleted: 18,
      tasksAssigned: 20,
      completionRate: 90,
      avgCompletionTime: 2.8,
      trend: 12,
    },
    {
      id: 4,
      name: "Kanye West",
      role: "member",
      department: "Design",
      tasksCompleted: 12,
      tasksAssigned: 16,
      completionRate: 75,
      avgCompletionTime: 4.2,
      trend: -3,
    },
    {
      id: 5,
      name: "Franz Kafka",
      role: "member",
      department: "Marketing",
      tasksCompleted: 14,
      tasksAssigned: 17,
      completionRate: 82,
      avgCompletionTime: 3.5,
      trend: 6,
    },
  ]

  return NextResponse.json({ members })
}
