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
import type { Task, TeamMember } from "@/lib/types"

interface EditTaskDialogProps {
  task: Task | null; // <-- Alterado para aceitar null
  open: boolean
  onClose: () => void
  onSuccess: (updatedTask: Task) => void
}

export function EditTaskDialog({ task, open, onClose, onSuccess }: EditTaskDialogProps) {
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
    // Preenche o formulário apenas se a tarefa existir
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        assigneeId: task.assigneeId.toString(),
        dueDate: new Date(task.dueDate).toISOString().split("T")[0],
        project: task.project || "",
        tags: task.tags ? task.tags.join(", ") : "",
      })
    }
    if (open) {
      fetchTeamMembers()
    }
  }, [task, open])

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("/api/teams/members")
      const data = await response.json()
      setTeamMembers(data.members || [])
    } catch (error) {
      console.error("Falha ao buscar membros da equipe:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task) return; // Garante que não há envio sem tarefa

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          assigneeId: Number.parseInt(formData.assigneeId),
          tags: formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess(data.task)
      } else {
        setError(data.error || "Falha ao atualizar a tarefa")
      }
    } catch (err) {
      setError("Erro de rede. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Não renderiza nada se a tarefa ainda não foi carregada
  if (!task) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Título da Tarefa</Label>
            <Input id="title" value={formData.title} onChange={(e) => handleChange("title", e.target.value)} required disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => handleChange("description", e.target.value)} rows={3} disabled={isLoading} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignee">Atribuir a</Label>
              <Select value={formData.assigneeId} onValueChange={(value) => handleChange("assigneeId", value)}>
                <SelectTrigger><SelectValue placeholder="Selecione um membro" /></SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Data de Vencimento</Label>
            <Input id="dueDate" type="date" value={formData.dueDate} onChange={(e) => handleChange("dueDate", e.target.value)} required disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Projeto</Label>
            <Input id="project" value={formData.project} onChange={(e) => handleChange("project", e.target.value)} placeholder="ex: Redesenho do site" disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
            <Input id="tags" value={formData.tags} onChange={(e) => handleChange("tags", e.target.value)} placeholder="ex: frontend, urgente, bug" disabled={isLoading} />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}