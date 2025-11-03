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
      <Button 
        onClick={() => setShowDialog(true)}
        className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 animate-shimmer"></span>
        <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
        <span className="relative">{t('teams.add_member')}</span>
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