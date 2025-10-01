"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Languages } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function LanguageSwitcher() {
  const { language, toggleLanguage, t } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-white hover:bg-white/20"
          title={t('language.switch')}
        >
          <Languages className="h-4 w-4" />
          <span className="sr-only">{t('language.switch')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem 
          onClick={toggleLanguage}
          className="flex items-center justify-between cursor-pointer group"
        >
          <span>{language === 'pt' ? t('language.english') : t('language.portuguese')}</span>
          <span className="text-xs text-muted-foreground group-hover:text-white transition-colors duration-200">
            {language === 'pt' ? 'EN' : 'PT'}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}