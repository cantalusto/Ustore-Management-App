import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

// Mock tasks database - replace with real database
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

let nextId = 5

export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Filter tasks based on user role
  let filteredTasks = tasks
  if (user.role === "member") {
    // Members can only see tasks assigned to them or created by them
    filteredTasks = tasks.filter((task) => task.assigneeId === user.id || task.createdBy === user.id)
  }

  return NextResponse.json({ tasks: filteredTasks })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { title, description, priority, assigneeId, dueDate, project, tags } = await request.json()

    // Find assignee name
    const teamMembers = [
        { id: 1, name: "Dante Alighieri" },
        { id: 2, name: "Gerente de Projeto" },
        { id: 3, name: "Membro da Equipe" },
        { id: 4, name: "Kanye West" },
        { id: 5, name: "Franz Kafka" },
    ]

    const assignee = teamMembers.find((member) => member.id === assigneeId)
    if (!assignee) {
      return NextResponse.json({ error: "Invalid assignee" }, { status: 400 })
    }

    const newTask = {
      id: nextId++,
      title,
      description: description || "",
      status: "a-fazer" as const,
      priority,
      assigneeId,
      assigneeName: assignee.name,
      createdBy: user.id,
      createdByName: user.name,
      dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      project: project || "",
      tags: tags || [],
    }

    tasks.push(newTask)

    return NextResponse.json({ task: newTask })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
  }
}