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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('teams.title')}</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">{t('teams.description')}</p>
      </div>
      {(user.role === "admin" || user.role === "manager") && <AddMemberButton />}
    </div>
  )
}