import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

// Em um app real, isso seria importado do arquivo de rota principal
const teamMembers = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@company.com",
    role: "admin" as const,
    department: "Management",
    phone: "+1 (555) 123-4567",
    joinDate: "2025-01-15",
    status: "active" as const,
  },
  {
    id: 2,
    name: "Manager User",
    email: "manager@company.com",
    role: "manager" as const,
    department: "Development",
    phone: "+1 (555) 234-5678",
    joinDate: "2025-02-20",
    status: "active" as const,
  },
  {
    id: 3,
    name: "Team Member",
    email: "member@company.com",
    role: "member" as const,
    department: "Development",
    phone: "+1 (555) 345-6789",
    joinDate: "2025-03-10",
    status: "active" as const,
  },
  {
    id: 4,
    name: "John Doe",
    email: "john.doe@company.com",
    role: "member" as const,
    department: "Design",
    phone: "+1 (555) 456-7890",
    joinDate: "2025-04-05",
    status: "active" as const,
  },
  {
    id: 5,
    name: "Sarah Smith",
    email: "sarah.smith@company.com",
    role: "member" as const,
    department: "Marketing",
    phone: "+1 (555) 567-8901",
    joinDate: "2025-05-12",
    status: "active" as const,
  },
]

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  const { id } = await params

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const memberId = Number.parseInt(id)
  const memberIndex = teamMembers.findIndex((member) => member.id === memberId)

  if (memberIndex === -1) {
    return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 })
  }

  const member = teamMembers[memberIndex]

  // Verifica permissões
  if (user.role !== "admin" && !(user.role === "manager" && member.role === "member")) {
    return NextResponse.json({ error: "Permissões insuficientes" }, { status: 403 })
  }

  try {
    const { name, email, role, department, phone, status } = await request.json()

    // Verifica se o email já existe (excluindo o membro atual)
    if (teamMembers.find((m) => m.email === email && m.id !== memberId)) {
      return NextResponse.json({ error: "Email já existe" }, { status: 400 })
    }

    // Apenas administradores podem alterar cargos para administrador
    if (role === "admin" && user.role !== "admin") {
      return NextResponse.json({ error: "Apenas administradores podem atribuir o cargo de administrador" }, { status: 403 })
    }

    // Atualiza o membro
    teamMembers[memberIndex] = {
      ...member,
      name,
      email,
      role,
      department,
      phone: phone || undefined,
      status,
    }

    return NextResponse.json({ member: teamMembers[memberIndex] })
  } catch (error) {
    return NextResponse.json({ error: "Dados da requisição inválidos" }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  const { id } = await params

  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Apenas administradores podem excluir membros" }, { status: 403 })
  }

  const memberId = Number.parseInt(id)
  const memberIndex = teamMembers.findIndex((member) => member.id === memberId)

  if (memberIndex === -1) {
    return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 })
  }

  const member = teamMembers[memberIndex]

  // Impede a exclusão de usuários administradores
  if (member.role === "admin") {
    return NextResponse.json({ error: "Não é possível excluir usuários administradores" }, { status: 403 })
  }

  // Remove o membro
  teamMembers.splice(memberIndex, 1)

  return NextResponse.json({ success: true })
}