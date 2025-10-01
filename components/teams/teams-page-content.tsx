"use client"

import { useLanguage } from "@/contexts/language-context"
import { AddMemberButton } from "./add-member-button"
import type { User } from "@/lib/auth"

interface TeamsPageContentProps {
  user: User
}

export function TeamsPageContent({ user }: TeamsPageContentProps) {
  const { t } = useLanguage()

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('teams.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('teams.description')}</p>
      </div>
      {(user.role === "admin" || user.role === "manager") && <AddMemberButton />}
    </div>
  )
}