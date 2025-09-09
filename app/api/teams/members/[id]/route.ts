import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

// This would be imported from the main route file in a real app
const teamMembers = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@company.com",
    role: "admin" as const,
    department: "Management",
    phone: "+1 (555) 123-4567",
    joinDate: "2023-01-15",
    status: "active" as const,
  },
  {
    id: 2,
    name: "Manager User",
    email: "manager@company.com",
    role: "manager" as const,
    department: "Development",
    phone: "+1 (555) 234-5678",
    joinDate: "2023-02-20",
    status: "active" as const,
  },
  {
    id: 3,
    name: "Team Member",
    email: "member@company.com",
    role: "member" as const,
    department: "Development",
    phone: "+1 (555) 345-6789",
    joinDate: "2023-03-10",
    status: "active" as const,
  },
  {
    id: 4,
    name: "John Doe",
    email: "john.doe@company.com",
    role: "member" as const,
    department: "Design",
    phone: "+1 (555) 456-7890",
    joinDate: "2023-04-05",
    status: "active" as const,
  },
  {
    id: 5,
    name: "Sarah Smith",
    email: "sarah.smith@company.com",
    role: "member" as const,
    department: "Marketing",
    phone: "+1 (555) 567-8901",
    joinDate: "2023-05-12",
    status: "active" as const,
  },
]

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  const { id } = await params

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const memberId = Number.parseInt(id)
  const memberIndex = teamMembers.findIndex((member) => member.id === memberId)

  if (memberIndex === -1) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 })
  }

  const member = teamMembers[memberIndex]

  // Check permissions
  if (user.role !== "admin" && !(user.role === "manager" && member.role === "member")) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
  }

  try {
    const { name, email, role, department, phone, status } = await request.json()

    // Check if email already exists (excluding current member)
    if (teamMembers.find((m) => m.email === email && m.id !== memberId)) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    // Only admins can change roles to admin
    if (role === "admin" && user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can assign admin role" }, { status: 403 })
    }

    // Update member
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
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  const { id } = await params

  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Only admins can delete members" }, { status: 403 })
  }

  const memberId = Number.parseInt(id)
  const memberIndex = teamMembers.findIndex((member) => member.id === memberId)

  if (memberIndex === -1) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 })
  }

  const member = teamMembers[memberIndex]

  // Prevent deleting admin users
  if (member.role === "admin") {
    return NextResponse.json({ error: "Cannot delete admin users" }, { status: 403 })
  }

  // Remove member
  teamMembers.splice(memberIndex, 1)

  return NextResponse.json({ success: true })
}
