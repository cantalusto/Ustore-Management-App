import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

// Mock tasks database - replace with real database
const tasks = [
  {
    id: 1,
    title: "Update user interface",
    description: "Redesign the main dashboard to improve user experience",
    status: "in-progress" as const,
    priority: "high" as const,
    assigneeId: 3,
    assigneeName: "Team Member",
    createdBy: 2,
    createdByName: "Manager User",
    dueDate: "2024-01-15",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-05T14:30:00Z",
    project: "Website Redesign",
    tags: ["frontend", "ui", "design"],
  },
  {
    id: 2,
    title: "Fix login bug",
    description: "Users are unable to login with special characters in password",
    status: "todo" as const,
    priority: "urgent" as const,
    assigneeId: 4,
    assigneeName: "John Doe",
    createdBy: 1,
    createdByName: "Admin User",
    dueDate: "2024-01-10",
    createdAt: "2024-01-02T09:15:00Z",
    updatedAt: "2024-01-02T09:15:00Z",
    project: "Bug Fixes",
    tags: ["backend", "authentication", "bug"],
  },
  {
    id: 3,
    title: "Weekly performance report",
    description: "Compile and analyze team performance metrics for the week",
    status: "review" as const,
    priority: "medium" as const,
    assigneeId: 5,
    assigneeName: "Sarah Smith",
    createdBy: 2,
    createdByName: "Manager User",
    dueDate: "2024-01-12",
    createdAt: "2024-01-03T11:00:00Z",
    updatedAt: "2024-01-08T16:45:00Z",
    project: "Analytics",
    tags: ["reporting", "analytics"],
  },
  {
    id: 4,
    title: "Setup CI/CD pipeline",
    description: "Configure automated testing and deployment pipeline",
    status: "completed" as const,
    priority: "high" as const,
    assigneeId: 3,
    assigneeName: "Team Member",
    createdBy: 1,
    createdByName: "Admin User",
    dueDate: "2024-01-08",
    createdAt: "2023-12-28T14:20:00Z",
    updatedAt: "2024-01-07T10:30:00Z",
    project: "DevOps",
    tags: ["devops", "automation", "testing"],
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
    filteredTasks = tasks.filter((task) => task.assigneeId === user.userId || task.createdBy === user.userId)
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
      { id: 1, name: "Admin User" },
      { id: 2, name: "Manager User" },
      { id: 3, name: "Team Member" },
      { id: 4, name: "John Doe" },
      { id: 5, name: "Sarah Smith" },
    ]

    const assignee = teamMembers.find((member) => member.id === assigneeId)
    if (!assignee) {
      return NextResponse.json({ error: "Invalid assignee" }, { status: 400 })
    }

    const newTask = {
      id: nextId++,
      title,
      description: description || "",
      status: "todo" as const,
      priority,
      assigneeId,
      assigneeName: assignee.name,
      createdBy: user.userId,
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
