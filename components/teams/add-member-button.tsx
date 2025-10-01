"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddMemberDialog } from "./add-member-dialog"
import { useLanguage } from "@/contexts/language-context"

export function AddMemberButton() {
  const [showDialog, setShowDialog] = useState(false)
  const { t } = useLanguage()

  return (
    <>
      <Button onClick={() => setShowDialog(true)}>
        <Plus className="mr-2 h-4 w-4" />
        {t('teams.add_member')}
      </Button>

      <AddMemberDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onSuccess={() => {
          setShowDialog(false)
          window.location.reload() // Recarregamento simples - pode ser otimizado
        }}
      />
    </>
  )
}