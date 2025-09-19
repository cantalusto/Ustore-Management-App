// components/tasks/ai-create-task-button.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { AiCreateTaskDialog } from "./ai-create-task-dialog"

export function AiCreateTaskButton() {
  const [showDialog, setShowDialog] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setShowDialog(true)}>
        <Sparkles className="mr-2 h-4 w-4" />
        Criar com IA
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