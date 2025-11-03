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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-in-down">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent animate-fade-in">
          {t('teams.title')}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base flex items-center gap-2 animate-slide-in-left" style={{ animationDelay: '100ms' }}>
          <span className="inline-block w-1 h-4 bg-gradient-to-b from-primary to-blue-600 rounded-full"></span>
          {t('teams.description')}
        </p>
      </div>
      {(user.role === "admin" || user.role === "manager") && (
        <div className="animate-scale-in" style={{ animationDelay: '200ms' }}>
          <AddMemberButton />
        </div>
      )}
    </div>
  )
}