// components/tasks/edit-task-dialog.tsx

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import type { Task, TeamMember } from "@/lib/auth"
import { useLanguage } from "@/contexts/language-context"

interface EditTaskDialogProps {
  task: Task | null
  open: boolean
  onClose: () => void
  onSuccess: (updatedTask: Task) => void
}

export function EditTaskDialog({ task, open, onClose, onSuccess }: EditTaskDialogProps) {
  const { t } = useLanguage()
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "media" as Task["priority"],
    assigneeId: "",
    dueDate: "",
    project: "",
    tags: "",
  })

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        assigneeId: task.assigneeId.toString(),
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
        project: task.project || "",
        tags: task.tags ? task.tags.join(", ") : "",
      })
    }
    if (open) fetchTeamMembers()
  }, [task, open])

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("/api/teams/members")
      const data = await response.json()
      setTeamMembers(data.members || [])
    } catch (err) {
      console.error("Falha ao buscar membros da equipe:", err)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          assigneeId: Number(formData.assigneeId),
          dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
          project: formData.project || null,
          tags: formData.tags
            .split(",")
            .map(tag => tag.trim())
            .filter(Boolean),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess(data.task)
        onClose()
      } else {
        setError(data.error || "Falha ao atualizar a tarefa")
      }
    } catch (err) {
      console.error("Erro de rede:", err)
      setError("Erro de rede. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('tasks.edit_title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">{t('tasks.title_label')}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={e => handleChange("title", e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('tasks.description_label')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => handleChange("description", e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">{t('tasks.priority_label')}</Label>
              <Select value={formData.priority} onValueChange={v => handleChange("priority", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t('tasks.priority.low')}</SelectItem>
                        <SelectItem value="medium">{t('tasks.priority.medium')}</SelectItem>
                        <SelectItem value="high">{t('tasks.priority.high')}</SelectItem>
                        <SelectItem value="urgent">{t('tasks.priority.urgent')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">{t('tasks.assignee_label')}</Label>
              <Select value={formData.assigneeId} onValueChange={v => handleChange("assigneeId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('tasks.assignee_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">{t('tasks.due_date_label')}</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={e => handleChange("dueDate", e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">{t('tasks.project_label')}</Label>
            <Input
              id="project"
              value={formData.project}
              onChange={e => handleChange("project", e.target.value)}
              placeholder={t('tasks.project_placeholder')}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">{t('tasks.tags_label')}</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={e => handleChange("tags", e.target.value)}
              placeholder={t('tasks.tags_placeholder')}
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t('tasks.cancel_button')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('tasks.save_changes_button')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
