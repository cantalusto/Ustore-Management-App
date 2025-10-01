// components/tasks/ai-create-task-button.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { AiCreateTaskDialog } from "./ai-create-task-dialog"
import { useLanguage } from "@/contexts/language-context"

export function AiCreateTaskButton() {
  const { t } = useLanguage()
  const [showDialog, setShowDialog] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setShowDialog(true)}>
        <Sparkles className="mr-2 h-4 w-4" />
        {t('tasks.ai_create_button')}
      </Button>

      <AiCreateTaskDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onSuccess={() => {
          setShowDialog(false)
          window.location.reload() // Recarregamento simples para atualizar a lista
        }}
      />
    </>
  )
}