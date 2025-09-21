// components/tasks/ai-create-task-dialog.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Sparkles } from "lucide-react"

interface AiCreateTaskDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AiCreateTaskDialog({ open, onClose, onSuccess }: AiCreateTaskDialogProps) {
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
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
      } else {
        setError(data.error || "Falha ao gerar a tarefa.")
      }
    } catch (err) {
      setError("Erro de rede. Verifique sua conexão e tente novamente.")
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
            Criar Tarefa com Inteligência Artificial
          </DialogTitle>
          <DialogDescription>
            Descreva a tarefa que você quer criar em linguagem natural. A IA irá extrair os detalhes para você.
            <br />
            Ex: "Criar tarefa para Johan Liebert sobre o novo logo para 10/10/2010, prioridade alta."
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
            placeholder="Digite os detalhes da sua tarefa aqui..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            disabled={isLoading}
            className="min-h-[100px]"
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !prompt.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gerar Tarefa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}