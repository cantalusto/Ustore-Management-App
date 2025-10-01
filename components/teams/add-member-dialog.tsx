// components/teams/add-member-dialog.tsx

"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface AddMemberDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddMemberDialog({ open, onClose, onSuccess }: AddMemberDialogProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "", // Campo de senha incluído
    role: "member",
    department: "",
    phone: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/teams/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
      } else {
        setError(data.error || t('teams.add_member_error'))
      }
    } catch (err) {
      setError(t('common.network_error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[95vw] mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{t('teams.add_member_title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">{t('common.name')}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('common.email')}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">{t('common.role')}</Label>
            <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">{t('teams.role_member')}</SelectItem>
                <SelectItem value="manager">{t('teams.role_manager')}</SelectItem>
                <SelectItem value="admin">{t('teams.role_admin')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">{t('common.department')}</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => handleChange("department", e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('teams.phone_optional')}</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('teams.password')}</Label>
            <Input
              id="password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto">
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('teams.add_member_btn')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
