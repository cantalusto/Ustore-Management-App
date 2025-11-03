"use client"

import { useLanguage } from "@/contexts/language-context"

export function ReportsPageContent() {
  const { t } = useLanguage()
  
  return (
    <div className="space-y-2 animate-slide-in-down">
      <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent animate-fade-in">
        {t('reports.title')}
      </h1>
      <p className="text-muted-foreground text-sm sm:text-base flex items-center gap-2 animate-slide-in-left" style={{ animationDelay: '100ms' }}>
        <span className="inline-block w-1 h-4 bg-gradient-to-b from-primary to-blue-600 rounded-full"></span>
        {t('reports.subtitle')}
      </p>
    </div>
  )
}