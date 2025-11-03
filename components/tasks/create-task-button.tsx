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
      <Button 
        onClick={() => setShowDialog(true)}
        className="group relative overflow-hidden bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
        <span className="relative z-10">{t('tasks.create')}</span>
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