// components/teams/edit-member-dialog.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

// A interface TeamMember pode ser importada ou definida aqui
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

interface EditMemberDialogProps {
  member: TeamMember
  open: boolean
  onClose: () => void
  onSuccess: () => void
  userRole: string
}

export function EditMemberDialog({ member, open, onClose, onSuccess, userRole }: EditMemberDialogProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "", // 1. Adicionar o campo de senha ao estado
    role: "member" as "admin" | "manager" | "member",
    department: "",
    phone: "",
    status: "active" as "active" | "inactive",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        email: member.email,
        password: "", // Inicia vazio por segurança
        role: member.role,
        department: member.department,
        phone: member.phone || "",
        status: member.status,
      })
    }
  }, [member])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/teams/members/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
      } else {
        setError(data.error || t('teams.update_member_error'))
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

  const canEditRole = userRole === "admin" || (userRole === "manager" && member.role === "member")

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('teams.edit_member_title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">{t('profile.full_name')}</Label>
            <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('common.email')}</Label>
            <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required disabled={isLoading} />
          </div>

          {/* 2. Adicionar o campo de senha no formulário */}
          <div className="space-y-2">
            <Label htmlFor="password">{t('common.new_password')}</Label>
            <Input id="password" type="password" value={formData.password} onChange={(e) => handleChange("password", e.target.value)} placeholder={t('teams.password_placeholder')} disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">{t('common.role')}</Label>
            <Select value={formData.role} onValueChange={(value) => handleChange("role", value)} disabled={!canEditRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="member">{t('teams.role_member')}</SelectItem>
                <SelectItem value="manager">{t('teams.role_manager')}</SelectItem>
                {userRole === "admin" && <SelectItem value="admin">{t('teams.role_admin')}</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">{t('common.department')}</Label>
            <Input id="department" value={formData.department} onChange={(e) => handleChange("department", e.target.value)} required disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('teams.phone')}</Label>
            <Input id="phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">{t('teams.status')}</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t('teams.status_active')}</SelectItem>
                <SelectItem value="inactive">{t('teams.status_inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('teams.update_member_btn')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}