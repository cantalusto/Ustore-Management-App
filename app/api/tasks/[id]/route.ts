import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

// Mock tasks database - same as in main route
const tasks = [
  {
    id: 1,
    title: "Atualizar interface do usuário",
    description: "Redesenhar o painel principal para melhorar a experiência do usuário",
    status: "em-progresso" as const,
    priority: "alta" as const,
    assigneeId: 3,
    assigneeName: "Membro da Equipe",
    createdBy: 2,
    createdByName: "Gerente de Projeto",
    dueDate: "2024-01-15",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-05T14:30:00Z",
    project: "Redesenho do Site",
    tags: ["frontend", "ui", "design"],
  },
  {
    id: 2,
    title: "Corrigir bug de login",
    description: "Usuários não conseguem fazer login com caracteres especiais na senha",
    status: "a-fazer" as const,
    priority: "urgente" as const,
    assigneeId: 4,
    assigneeName: "Kanye West",
    createdBy: 1,
    createdByName: "Dante Alighieri",
    dueDate: "2024-01-10",
    createdAt: "2024-01-02T09:15:00Z",
    updatedAt: "2024-01-02T09:15:00Z",
    project: "Correção de Bugs",
    tags: ["backend", "autenticação", "bug"],
  },
  {
    id: 3,
    title: "Relatório de desempenho semanal",
    description: "Compilar e analisar as métricas de desempenho da equipe para a semana",
    status: "revisao" as const,
    priority: "media" as const,
    assigneeId: 5,
    assigneeName: "Franz Kafka",
    createdBy: 2,
    createdByName: "Gerente de Projeto",
    dueDate: "2024-01-12",
    createdAt: "2024-01-03T11:00:00Z",
    updatedAt: "2024-01-08T16:45:00Z",
    project: "Análises",
    tags: ["relatórios", "análises"],
  },
  {
    id: 4,
    title: "Configurar pipeline de CI/CD",
    description: "Configurar pipeline automatizado de testes e implantação",
    status: "concluido" as const,
    priority: "alta" as const,
    assigneeId: 3,
    assigneeName: "Membro da Equipe",
    createdBy: 1,
    createdByName: "Dante Alighieri",
    dueDate: "2024-01-08",
    createdAt: "2023-12-28T14:20:00Z",
    updatedAt: "2024-01-07T10:30:00Z",
    project: "DevOps",
    tags: ["devops", "automação", "testes"],
  },
]

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  const { id } = await params

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const taskId = Number.parseInt(id)
  const taskIndex = tasks.findIndex((task) => task.id === taskId)

  if (taskIndex === -1) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  const task = tasks[taskIndex]

  // Check permissions
  const canEdit =
    user.role === "admin" ||
    user.role === "manager" ||
    task.createdBy === user.id ||
    task.assigneeId === user.id

  if (!canEdit) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
  }

  try {
    const updates = await request.json()

    // Update task
    tasks[taskIndex] = {
      ...task,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({ task: tasks[taskIndex] })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  const { id } = await params

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const taskId = Number.parseInt(id)
  const taskIndex = tasks.findIndex((task) => task.id === taskId)

  if (taskIndex === -1) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  const task = tasks[taskIndex]

  // Only admins, managers, or task creators can delete tasks
  const canDelete = user.role === "admin" || user.role === "manager" || task.createdBy === user.id

  if (!canDelete) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
  }

  // Remove task
  tasks.splice(taskIndex, 1)

  return NextResponse.json({ success: true })
}