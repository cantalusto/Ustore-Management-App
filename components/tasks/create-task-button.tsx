"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateTaskDialog } from "./create-task-dialog"
import { useLanguage } from "@/contexts/language-context"

interface CreateTaskButtonProps {
  userRole: string
}

export function CreateTaskButton({ userRole }: CreateTaskButtonProps) {
  const [showDialog, setShowDialog] = useState(false)
  const { t } = useLanguage()

  return (
    <>
      <Button onClick={() => setShowDialog(true)}>
        <Plus className="mr-2 h-4 w-4" />
        {t('tasks.create')}
      </Button>

      <CreateTaskDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onSuccess={() => {
          setShowDialog(false)
          window.location.reload() // Simple refresh - could be optimized
        }}
        userRole={userRole}
      />
    </>
  )
}