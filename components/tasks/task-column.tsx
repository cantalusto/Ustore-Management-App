"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskCard } from "./task-card"

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

interface TaskColumnProps {
  title: string
  status: Task["status"]
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onStatusChange: (taskId: number, newStatus: Task["status"]) => void
  userRole: string
  userId: number
}

export function TaskColumn({ title, status, tasks, onTaskClick, onStatusChange, userRole, userId }: TaskColumnProps) {
  const getColumnColor = () => {
    switch (status) {
      case "a-fazer":
        return "border-l-4 border-l-gray-400"
      case "em-progresso":
        return "border-l-4 border-l-blue-500"
      case "revisao":
        return "border-l-4 border-l-yellow-500"
      case "concluido":
        return "border-l-4 border-l-green-500"
      default:
        return ""
    }
  }

  return (
    <Card className={`h-fit ${getColumnColor()}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          {title}
          <span className="text-sm font-normal bg-muted text-muted-foreground px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma tarefa</p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
              onStatusChange={onStatusChange}
              userRole={userRole}
              userId={userId}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}