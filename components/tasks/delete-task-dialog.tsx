// components/tasks/delete-task-dialog.tsx
"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertTriangle } from "lucide-react"
import type { Task } from "@/lib/types"

interface DeleteTaskDialogProps {
  task: Task
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeleteTaskDialog({ task, open, onClose, onSuccess }: DeleteTaskDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
      } else {
        setError(data.error || "Falha ao excluir a tarefa.")
      }
    } catch (err) {
      setError("Erro de rede. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="text-destructive" />
            Excluir Tarefa
          </DialogTitle>
          <DialogDescription>
            Você tem certeza que deseja excluir a tarefa "{task.title}"? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        <DialogFooter className="sm:justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Excluir Tarefa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}