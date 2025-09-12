import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

// Mock team members database - replace with real database
const teamMembers = [
  {
    id: 1,
    name: "Dante Alighieri",
    email: "admin@company.com",
    role: "admin" as const,
    department: "Management",
    phone: "+1 (555) 123-4567",
    joinDate: "2023-01-15",
    status: "active" as const,
  },
  {
    id: 2,
    name: "Gerente de Projeto",
    email: "manager@company.com",
    role: "manager" as const,
    department: "Development",
    phone: "+1 (555) 234-5678",
    joinDate: "2023-02-20",
    status: "active" as const,
  },
  {
    id: 3,
    name: "Membro da Equipe",
    email: "member@company.com",
    role: "member" as const,
    department: "Development",
    phone: "+1 (555) 345-6789",
    joinDate: "2023-03-10",
    status: "active" as const,
  },
  {
    id: 4,
    name: "Kanye West",
    email: "kan.ye@company.com",
    role: "member" as const,
    department: "Design",
    phone: "+1 (555) 456-7890",
    joinDate: "2023-04-05",
    status: "active" as const,
  },
  {
    id: 5,
    name: "Franz Kafka",
    email: "franz@company.com",
    role: "member" as const,
    department: "Marketing",
    phone: "+1 (555) 567-8901",
    joinDate: "2023-05-12",
    status: "active" as const,
  },
]

let nextId = 6

export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({ members: teamMembers })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user || (user.role !== "admin" && user.role !== "manager")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const { name, email, role, department, phone } = await request.json()

    // Check if email already exists
    if (teamMembers.find((member) => member.email === email)) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    // Only admins can create admin users
    if (role === "admin" && user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can create admin users" }, { status: 403 })
    }

    const newMember = {
      id: nextId++,
      name,
      email,
      role,
      department,
      phone: phone || undefined,
      joinDate: new Date().toISOString().split("T")[0],
      status: "active" as const,
    }

    teamMembers.push(newMember)

    return NextResponse.json({ member: newMember })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
  }
}