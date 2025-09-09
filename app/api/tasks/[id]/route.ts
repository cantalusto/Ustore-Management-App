import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

// Mock tasks database - same as in main route
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
    task.createdBy === user.userId ||
    task.assigneeId === user.userId

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
  const canDelete = user.role === "admin" || user.role === "manager" || task.createdBy === user.userId

  if (!canDelete) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
  }

  // Remove task
  tasks.splice(taskIndex, 1)

  return NextResponse.json({ success: true })
}
