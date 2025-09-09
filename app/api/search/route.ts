import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.toLowerCase() || ""

  if (!query.trim()) {
    return NextResponse.json({ results: [] })
  }

  // Mock data - replace with real database searches
  const tasks = [
    {
      id: 1,
      title: "Update user interface",
      description: "Redesign the main dashboard to improve user experience",
      assigneeName: "Team Member",
      project: "Website Redesign",
      tags: ["frontend", "ui", "design"],
    },
    {
      id: 2,
      title: "Fix login bug",
      description: "Users are unable to login with special characters in password",
      assigneeName: "John Doe",
      project: "Bug Fixes",
      tags: ["backend", "authentication", "bug"],
    },
  ]

  const members = [
    { id: 1, name: "Admin User", email: "admin@company.com", department: "Management" },
    { id: 2, name: "Manager User", email: "manager@company.com", department: "Development" },
    { id: 3, name: "Team Member", email: "member@company.com", department: "Development" },
    { id: 4, name: "John Doe", email: "john.doe@company.com", department: "Design" },
    { id: 5, name: "Sarah Smith", email: "sarah.smith@company.com", department: "Marketing" },
  ]

  const projects = [
    { id: 1, name: "Website Redesign", description: "Complete overhaul of company website" },
    { id: 2, name: "Mobile App Development", description: "Native mobile application" },
    { id: 3, name: "Marketing Campaign", description: "Q1 digital marketing campaign" },
  ]

  const results = []

  // Search tasks
  for (const task of tasks) {
    if (
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      task.assigneeName.toLowerCase().includes(query) ||
      task.project.toLowerCase().includes(query) ||
      task.tags.some((tag) => tag.toLowerCase().includes(query))
    ) {
      results.push({
        id: `task-${task.id}`,
        type: "task",
        title: task.title,
        subtitle: `Assigned to ${task.assigneeName}`,
        description: task.description,
        metadata: task.project,
      })
    }
  }

  // Search members (only if user has permission)
  if (user.role === "admin" || user.role === "manager") {
    for (const member of members) {
      if (
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.department.toLowerCase().includes(query)
      ) {
        results.push({
          id: `member-${member.id}`,
          type: "member",
          title: member.name,
          subtitle: member.email,
          description: member.department,
          metadata: "",
        })
      }
    }
  }

  // Search projects
  for (const project of projects) {
    if (project.name.toLowerCase().includes(query) || project.description.toLowerCase().includes(query)) {
      results.push({
        id: `project-${project.id}`,
        type: "project",
        title: project.name,
        subtitle: project.description,
        description: "",
        metadata: "",
      })
    }
  }

  return NextResponse.json({ results: results.slice(0, 10) }) // Limit to 10 results
}
