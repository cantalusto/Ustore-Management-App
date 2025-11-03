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
      case "urgent": return "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md shadow-red-500/30 font-semibold";
      case "high": return "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md shadow-orange-500/30 font-semibold";
      case "medium": return "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-md shadow-yellow-500/30 font-semibold";
      case "low": return "bg-gradient-to-br from-green-400 to-green-600 text-white shadow-md shadow-green-500/30 font-semibold";
      default: return "bg-gradient-to-br from-gray-400 to-gray-600 text-white shadow-md shadow-gray-500/30 font-semibold";
    }
  }

  const getPriorityLabel = (priority: string) => {
    return t(`tasks.priority.${priority}`)
  }

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case "urgent": return "border-l-4 border-l-red-500";
      case "high": return "border-l-4 border-l-orange-500";
      case "medium": return "border-l-4 border-l-yellow-500";
      case "low": return "border-l-4 border-l-green-500";
      default: return "border-l-4 border-l-gray-400";
    }
  }

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "concluido"

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab shadow-lg hover:shadow-2xl transition-all duration-200 hover:scale-[1.02] active:cursor-grabbing ${getPriorityBorder(task.priority)} border-2 hover:border-primary/50`}
    >
      <div onClick={onClick} className="cursor-pointer">
        <CardContent className="p-3 sm:p-4 space-y-3">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-sm leading-tight flex-1 min-w-0">{task.title}</h4>
              <Badge className={`${getPriorityColor(task.priority)} text-xs flex-shrink-0 px-2.5 py-0.5`} variant="secondary">
                {getPriorityLabel(task.priority)}
              </Badge>
            </div>
            {task.description && <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>}
          </div>

          <div className="flex items-center justify-between text-xs gap-2">
            <div className="flex items-center space-x-1 min-w-0 flex-1 bg-muted/50 px-2 py-1.5 rounded-md">
              <User className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
              <span className="truncate font-medium">{task.assigneeName}</span>
            </div>
            <div className={`flex items-center space-x-1 flex-shrink-0 px-2 py-1.5 rounded-md font-medium ${isOverdue ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" : "bg-muted/50"}`}>
              <Calendar className="h-3.5 w-3.5" />
              <span className="whitespace-nowrap">{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          </div>

          {task.project && (
            <Badge variant="outline" className="text-xs truncate max-w-full border-2 font-medium">
              {task.project}
            </Badge>
          )}

          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {task.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 font-medium">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 font-medium">
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
