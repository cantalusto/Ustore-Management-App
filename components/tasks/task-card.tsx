"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User } from "lucide-react"

interface Task {
  id: number
  title: string
  description: string
  status: "todo" | "in-progress" | "review" | "completed"
  priority: "low" | "medium" | "high" | "urgent"
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

interface TaskCardProps {
  task: Task
  onClick: () => void
  onStatusChange: (taskId: number, newStatus: Task["status"]) => void
  userRole: string
  userId: number
}

export function TaskCard({ task, onClick, userRole, userId }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "completed"

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
            <Badge className={getPriorityColor(task.priority)} variant="secondary">
              {task.priority}
            </Badge>
          </div>
          {task.description && <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>}
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3" />
            <span>{task.assigneeName}</span>
          </div>
          <div className={`flex items-center space-x-1 ${isOverdue ? "text-red-600" : "text-muted-foreground"}`}>
            <Calendar className="h-3 w-3" />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        </div>

        {task.project && (
          <Badge variant="outline" className="text-xs">
            {task.project}
          </Badge>
        )}

        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{task.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
