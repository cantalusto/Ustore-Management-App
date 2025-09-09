"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, User, Clock, Tag, Edit, MessageSquare } from "lucide-react"

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

interface TaskDetailDialogProps {
  task: Task
  open: boolean
  onClose: () => void
  onUpdate: (task: Task) => void
  userRole: string
  userId: number
}

export function TaskDetailDialog({ task, open, onClose, onUpdate, userRole, userId }: TaskDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [comment, setComment] = useState("")

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "review":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const handleStatusChange = async (newStatus: Task["status"]) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const data = await response.json()
        onUpdate(data.task)
      }
    } catch (error) {
      console.error("Failed to update task status:", error)
    }
  }

  const canEditTask = () => {
    return userRole === "admin" || userRole === "manager" || task.createdBy === userId || task.assigneeId === userId
  }

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "completed"

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-xl">{task.title}</DialogTitle>
            {canEditTask() && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center space-x-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              {canEditTask() ? (
                <Select value={task.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={getStatusColor(task.status)}>{task.status.replace("-", " ")}</Badge>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{task.description}</p>
            </div>
          )}

          {/* Task Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Assigned to:</span>
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {task.assigneeName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span>{task.assigneeName}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Created by:</span>
                <span>{task.createdByName}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className={`flex items-center space-x-2 text-sm ${isOverdue ? "text-red-600" : ""}`}>
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Due date:</span>
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs">
                    Overdue
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Created:</span>
                <span>{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Project and Tags */}
          <div className="space-y-3">
            {task.project && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Project:</span>
                <Badge variant="outline">{task.project}</Badge>
              </div>
            )}

            {task.tags.length > 0 && (
              <div className="flex items-start space-x-2">
                <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Add Comment</span>
            </div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
            />
            <Button size="sm" disabled={!comment.trim()}>
              Add Comment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
