// components/tasks/ai-create-task-dialog.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Sparkles } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface AiCreateTaskDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AiCreateTaskDialog({ open, onClose, onSuccess }: AiCreateTaskDialogProps) {
  const { t, language } = useLanguage()
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/tasks/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, language }),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
      } else {
        setError(data.error || t('tasks.ai_create_error_generate'))
      }
    } catch (err) {
      setError(t('tasks.ai_create_error_network'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-yellow-500" />
            {t('tasks.ai_create_title')}
          </DialogTitle>
          <DialogDescription>
            {t('tasks.ai_create_description')}
            <br />
            {t('tasks.ai_create_example')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Textarea
            id="ai-prompt"
            placeholder={t('tasks.ai_create_placeholder')}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            disabled={isLoading}
            className="min-h-[100px]"
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || !prompt.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('tasks.ai_create_generate')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}