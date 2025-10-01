// components/teams/delete-member-dialog.tsx
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertTriangle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

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
  onSuccess: () => void // Esta prop já existe, vamos usá-la
}

export function DeleteMemberDialog({ member, open, onClose, onSuccess }: DeleteMemberDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { t } = useLanguage()

  const handleDelete = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/teams/members/${member.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        // A função onSuccess será chamada aqui,
        // e ela é responsável por recarregar a página
        onSuccess() 
      } else {
        setError(data.error || t('teams.delete_member_error'))
      }
    } catch (err) {
      setError(t('common.network_error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[95vw] mx-auto">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle className="text-lg sm:text-xl">{t('teams.delete_member_title')}</DialogTitle>
          </div>
          <DialogDescription className="text-sm sm:text-base">
            {t('teams.delete_member_description', { name: member.name })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2 sm:space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto">
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('teams.delete_member_btn')}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}