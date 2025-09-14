"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertTriangle } from "lucide-react"

interface TeamMember {
  id: number
  name: string
  email: string
  role: "admin" | "manager" | "member"
  department: string
  phone?: string
  joinDate: string
  status: "active" | "inactive"
}

interface DeleteMemberDialogProps {
  member: TeamMember
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeleteMemberDialog({ member, open, onClose, onSuccess }: DeleteMemberDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/teams/members/${member.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
      } else {
        setError(data.error || "Falha ao excluir membro")
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
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>Excluir Membro da Equipe</DialogTitle>
          </div>
          <DialogDescription>
            Você tem certeza que deseja excluir <strong>{member.name}</strong>? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir Membro
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}