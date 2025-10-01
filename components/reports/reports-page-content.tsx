"use client"

import { useLanguage } from "@/contexts/language-context"

export function ReportsPageContent() {
  const { t } = useLanguage()
  
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('reports.title')}</h1>
      <p className="text-muted-foreground mt-2 text-sm sm:text-base">
        {t('reports.subtitle')}
      </p>
    </div>
  )
}