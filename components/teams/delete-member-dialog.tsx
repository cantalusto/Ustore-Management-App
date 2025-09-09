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
        setError(data.error || "Failed to delete member")
      }
    } catch (err) {
      setError("Network error. Please try again.")
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
            <DialogTitle>Delete Team Member</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete <strong>{member.name}</strong>? This action cannot be undone.
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
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Member
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
