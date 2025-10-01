"use client"

import { useLanguage } from "@/contexts/language-context"
import type { User as UserType } from "@/lib/auth"

interface DashboardContentProps {
  user: UserType
}

export function DashboardContent({ user }: DashboardContentProps) {
  const { t } = useLanguage()

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">
        {t('dashboard.welcome_back')}, {user.name}
      </h1>
      <p className="text-muted-foreground mt-2">
        {t('dashboard.team_overview')}
      </p>
    </div>
  )
}