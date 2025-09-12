"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateTaskDialog } from "./create-task-dialog"

interface CreateTaskButtonProps {
  userRole: string
}

export function CreateTaskButton({ userRole }: CreateTaskButtonProps) {
  const [showDialog, setShowDialog] = useState(false)

  return (
    <>
      <Button onClick={() => setShowDialog(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Criar Tarefa
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