// components/tasks/task-detail-dialog.tsx
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, User, Clock, Tag, Edit, MessageSquare, Trash2, Send } from "lucide-react"
import { EditTaskDialog } from "./edit-task-dialog"
import { DeleteTaskDialog } from "./delete-task-dialog"
import type { Task, User as UserType } from "@/lib/auth"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Comment {
  id: number;
  text: string;
  createdAt: string;
  author: {
    name: string;
    image?: string | null;
  };
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
  const [isDeleting, setIsDeleting] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState<Comment[]>([])
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgente": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "alta": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "media": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "baixa": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "a-fazer": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "em-progresso": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "revisao": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "concluido": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  }

  useEffect(() => {
    if (open && task) {
      fetchComments();
    }
  }, [open, task]);

  const fetchComments = async () => {
    if (!task) return;
    try {
      const response = await fetch(`/api/tasks/${task.id}/comments`);
      const data = await response.json();
      if (response.ok) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error("Falha ao buscar comentários:", error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !task) return;
    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment }),
      });
      const data = await response.json();
      if (response.ok) {
        setComments(prev => [...prev, data.comment]);
        setNewComment("");
      } else {
        alert(data.error || "Falha ao adicionar comentário");
      }
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleStatusChange = async (newStatus: Task["status"]) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        const data = await response.json();
        onUpdate(data.task);
      }
    } catch (error) {
      console.error("Falha ao atualizar o status da tarefa:", error)
    }
  }
  
  const handleUpdateSuccess = (updatedTask: Task) => {
    onUpdate(updatedTask);
    setIsEditing(false);
  };

  const handleDeleteSuccess = () => {
    setIsDeleting(false);
    onClose();
    window.location.reload();
  };

  const canEditTask = () => {
    return userRole === "admin" || userRole === "manager" || task.createdBy === userId || task.assigneeId === userId
  }

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "concluido"

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <DialogTitle className="text-xl">{task.title}</DialogTitle>
              <div className="flex items-center">
                {canEditTask() && (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {userRole === 'admin' && (
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setIsDeleting(true)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto pr-6">
            <div className="flex items-center space-x-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    {canEditTask() ? (
                    <Select value={task.status} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-32">
                        <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="a-fazer">A Fazer</SelectItem>
                        <SelectItem value="em-progresso">Em Progresso</SelectItem>
                        <SelectItem value="revisao">Revisão</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        </SelectContent>
                    </Select>
                    ) : (
                    <Badge className={getStatusColor(task.status)}>{task.status.replace("-", " ")}</Badge>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Prioridade</label>
                    <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                </div>
            </div>

            {task.description && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{task.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Atribuído a:</span>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {task.assigneeName.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span>{task.assigneeName}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Criado por:</span>
                  <span>{task.createdByName}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className={`flex items-center space-x-2 text-sm ${isOverdue ? "text-red-600" : ""}`}>
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Data de vencimento:</span>
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  {isOverdue && (
                    <Badge variant="destructive" className="text-xs">
                      Atrasado
                    </Badge>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Criado em:</span>
                  <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {task.project && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Projeto:</span>
                <Badge variant="outline">{task.project}</Badge>
              </div>
            )}

            {task.tags && task.tags.length > 0 && (
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
            
            {/* Seção de Comentários */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                Comentários ({comments.length})
              </h3>
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{comment.author.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{comment.author.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ptBR })}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Formulário para novo comentário */}
          <div className="mt-auto pt-4 border-t">
            <div className="relative">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicionar um comentário..."
                rows={2}
                className="pr-12"
              />
              <Button size="sm" onClick={handleCommentSubmit} disabled={!newComment.trim() || isSubmittingComment} className="absolute right-2 bottom-2">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {isEditing && (
        <EditTaskDialog
          task={task}
          open={isEditing}
          onClose={() => setIsEditing(false)}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {isDeleting && (
        <DeleteTaskDialog
          task={task}
          open={isDeleting}
          onClose={() => setIsDeleting(false)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  )
}