import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user || user.role === "member") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  // Mock project data - replace with real database queries
  const projects = [
    {
      id: 1,
      name: "Website Redesign",
      description: "Complete overhaul of company website with modern design",
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
      name: "Mobile App Development",
      description: "Native mobile application for iOS and Android",
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
      name: "Marketing Campaign",
      description: "Q1 digital marketing campaign across all channels",
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
      name: "DevOps Infrastructure",
      description: "Setup CI/CD pipeline and monitoring systems",
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
