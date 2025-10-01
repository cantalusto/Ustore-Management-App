"use client"

import { useLanguage } from "@/contexts/language-context"

export function AnalyticsHeader() {
  const { t } = useLanguage()
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">{t('analytics.title')}</h1>
      <p className="text-muted-foreground mt-2">
        {t('analytics.subtitle')}
      </p>
    </div>
  )
}

export function AnalyticsTabLabel({ tabKey }: { tabKey: string }) {
  const { t } = useLanguage()
  
  return t(`analytics.tabs.${tabKey}`)
}