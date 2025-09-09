"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Monitor } from "lucide-react"

export function ThemeSettings() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")

  useEffect(() => {
    // Get current theme from localStorage or default to system
    const savedTheme = (localStorage.getItem("theme") as "light" | "dark" | "system") || "system"
    setTheme(savedTheme)
    applyTheme(savedTheme)
  }, [])

  const applyTheme = (newTheme: "light" | "dark" | "system") => {
    const root = document.documentElement

    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.toggle("dark", systemTheme === "dark")
    } else {
      root.classList.toggle("dark", newTheme === "dark")
    }

    localStorage.setItem("theme", newTheme)
  }

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aparência</CardTitle>
        <CardDescription>Escolha a aparência do aplicativo.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Tema</h3>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => handleThemeChange("light")}
              className="flex flex-col items-center space-y-2 h-auto py-4"
            >
              <Sun className="h-5 w-5" />
              <span className="text-sm">Claro</span>
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => handleThemeChange("dark")}
              className="flex flex-col items-center space-y-2 h-auto py-4"
            >
              <Moon className="h-5 w-5" />
              <span className="text-sm">Escuro</span>
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              onClick={() => handleThemeChange("system")}
              className="flex flex-col items-center space-y-2 h-auto py-4"
            >
              <Monitor className="h-5 w-5" />
              <span className="text-sm">Sistema</span>
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            O tema do sistema alternará automaticamente entre os modos claro e escuro com base nas configurações do seu dispositivo.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}