"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User } from "lucide-react"
import type { Task } from "@/lib/auth"
import { useLanguage } from "@/contexts/language-context"

interface TaskCardProps {
  task: Task
  onClick: () => void
  userRole: string
  userId: number
  isDragging?: boolean
}

export function TaskCard({ task, onClick, userRole, userId, isDragging }: TaskCardProps) {
  const { t } = useLanguage()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({
    id: task.id,
    data: { type: 'Task', task },
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging || isSortableDragging ? 0.8 : 1,
    boxShadow: isDragging || isSortableDragging ? "0 10px 25px rgba(0,0,0,0.2)" : undefined,
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  }

  const getPriorityLabel = (priority: string) => {
    return t(`tasks.priority.${priority}`)
  }

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "concluido"

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab hover:shadow-md transition-shadow active:cursor-grabbing`}
    >
      <div onClick={onClick} className="cursor-pointer">
        <CardContent className="p-4 space-y-3">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
              <Badge className={getPriorityColor(task.priority)} variant="secondary">
                {getPriorityLabel(task.priority)}
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
      </div>
    </Card>
  )
}
