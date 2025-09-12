"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TaskColumn } from "./task-column"
import { TaskDetailDialog } from "./task-detail-dialog"
import { TaskFilters, type TaskFilters as TaskFiltersType } from "@/components/filters/task-filters"

interface Task {
  id: number
  title: string
  description: string
  status: "a-fazer" | "em-progresso" | "revisao" | "concluido"
  priority: "baixa" | "media" | "alta" | "urgente"
  assigneeId: number
  assigneeName: string
  createdBy: number
  createdByName: string
  dueDate: string
  createdAt: string
  updatedAt: string
  project: string
  tags: string[]
}

interface TaskBoardProps {
  userRole: string
  userId: number
}

export function TaskBoard({ userRole, userId }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [teamMembers, setTeamMembers] = useState<Array<{ id: number; name: string }>>([])
  const [projects, setProjects] = useState<string[]>([])

  const [filters, setFilters] = useState<TaskFiltersType>({
    search: "",
    status: "",
    priority: "",
    assignee: "",
    project: "",
    dueDateFrom: undefined,
    dueDateTo: undefined,
    overdue: false,
  })

  useEffect(() => {
    fetchTasks()
    fetchTeamMembers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [tasks, filters])

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks")
      const data = await response.json()
      setTasks(data.tasks || [])

      // Extract unique projects
      const uniqueProjects = [...new Set(data.tasks?.map((task: Task) => task.project).filter(Boolean) || [])] as string[]
      setProjects(uniqueProjects)
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("/api/teams/members")
      const data = await response.json()
      setTeamMembers(data.members?.map((member: any) => ({ id: member.id, name: member.name })) || [])
    } catch (error) {
      console.error("Failed to fetch team members:", error)
    }
  }

  const applyFilters = () => {
    let filtered = [...tasks]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower) ||
          task.assigneeName.toLowerCase().includes(searchLower) ||
          task.project.toLowerCase().includes(searchLower) ||
          task.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      )
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((task) => task.status === filters.status)
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter((task) => task.priority === filters.priority)
    }

    // Assignee filter
    if (filters.assignee) {
      filtered = filtered.filter((task) => task.assigneeId.toString() === filters.assignee)
    }

    // Project filter
    if (filters.project) {
      filtered = filtered.filter((task) => task.project === filters.project)
    }

    // Date range filter
    if (filters.dueDateFrom) {
      filtered = filtered.filter((task) => new Date(task.dueDate) >= filters.dueDateFrom!)
    }
    if (filters.dueDateTo) {
      filtered = filtered.filter((task) => new Date(task.dueDate) <= filters.dueDateTo!)
    }

    // Overdue filter
    if (filters.overdue) {
      const now = new Date()
      filtered = filtered.filter((task) => new Date(task.dueDate) < now && task.status !== "concluido")
    }

    setFilteredTasks(filtered)
  }

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
  }

  const handleStatusChange = async (taskId: number, newStatus: Task["status"]) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updatedTask = await response.json()
        handleTaskUpdate(updatedTask.task)
      }
    } catch (error) {
      console.error("Failed to update task status:", error)
    }
  }

  const columns = [
    { id: "a-fazer", title: "A Fazer", status: "a-fazer" as const },
    { id: "em-progresso", title: "Em Progresso", status: "em-progresso" as const },
    { id: "revisao", title: "Revisão", status: "revisao" as const },
    { id: "concluido", title: "Concluído", status: "concluido" as const },
  ]

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando tarefas...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="mb-6">
        <TaskFilters filters={filters} onFiltersChange={setFilters} teamMembers={teamMembers} projects={projects} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <TaskColumn
            key={column.id}
            title={column.title}
            status={column.status}
            tasks={filteredTasks.filter((task) => task.status === column.status)}
            onTaskClick={setSelectedTask}
            onStatusChange={handleStatusChange}
            userRole={userRole}
            userId={userId}
          />
        ))}
      </div>

      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
          userRole={userRole}
          userId={userId}
        />
      )}
    </>
  )
}