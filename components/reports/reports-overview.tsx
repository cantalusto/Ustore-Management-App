"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Download, FileText, Table } from "lucide-react"
import { format } from "date-fns"

const reportTypes = [
  {
    id: "team-performance",
    title: "Relatório de Desempenho da Equipe",
    description: "Visão geral abrangente da produtividade da equipe e taxas de conclusão de tarefas",
    icon: <FileText className="h-5 w-5" />,
    badge: "Popular",
  },
  {
    id: "task-summary",
    title: "Relatório de Resumo de Tarefas",
    description: "Detalhamento de tarefas por status, prioridade e responsável",
    icon: <Table className="h-5 w-5" />,
    badge: "Detalhado",
  },
  {
    id: "individual-performance",
    title: "Relatório de Desempenho Individual",
    description: "Métricas de produtividade pessoal para membros da equipe",
    icon: <FileText className="h-5 w-5" />,
    badge: "Pessoal",
  },
  {
    id: "project-status",
    title: "Relatório de Status do Projeto",
    description: "Acompanhamento do progresso e conclusão de marcos em todos os projetos",
    icon: <Table className="h-5 w-5" />,
    badge: "Visão Geral",
  },
]

export function ReportsOverview() {
  console.log("[v0] ReportsOverview component rendering")

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })
  const [selectedMember, setSelectedMember] = useState<string>("all")
  const [isGenerating, setIsGenerating] = useState<string | null>(null)

  const handleGenerateReport = async (reportType: string, format: "excel") => {
    setIsGenerating(`${reportType}-${format}`)

    console.log("[v0] Starting report generation:", { reportType, format, dateRange, selectedMember })

    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: reportType,
          format,
          dateRange,
          memberId: selectedMember === "all" ? null : selectedMember,
        }),
      })

      console.log("[v0] API response status:", response.status)
      console.log("[v0] API response headers:", Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const blob = await response.blob()
        console.log("[v0] Blob created, size:", blob.size, "type:", blob.type)

        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${reportType}-report.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        console.log("[v0] Download triggered successfully")
      } else {
        const errorText = await response.text()
        console.error("[v0] API error response:", errorText)
        alert(`Failed to generate report: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error("[v0] Error generating report:", error)
      alert("Failed to generate report. Please try again.")
    } finally {
      setIsGenerating(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Relatórios</CardTitle>
          <CardDescription>Configure o intervalo de datas e filtros para seus relatórios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Intervalo de Datas</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from && dateRange.to
                      ? `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`
                      : "Selecione o intervalo de datas"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => range && setDateRange(range as { from: Date; to: Date })}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Membro da Equipe</label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um membro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Membros</SelectItem>
                  <SelectItem value="1">Dante Alighieri</SelectItem>
                  <SelectItem value="2">Gerente de Projeto</SelectItem>
                  <SelectItem value="3">Membro da Equipe</SelectItem>
                  <SelectItem value="4">Kanye West</SelectItem>
                  <SelectItem value="5">Franz Kafka</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Types */}
      <div className="grid gap-6 md:grid-cols-2">
        {reportTypes.map((report) => (
          <Card key={report.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">{report.icon}</div>
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription className="mt-1">{report.description}</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">{report.badge}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleGenerateReport(report.id, "excel")}
                  disabled={isGenerating === `${report.id}-excel`}
                  className="flex-1"
                >
                  <Table className="mr-2 h-4 w-4" />
                  {isGenerating === `${report.id}-excel` ? "Gerando..." : "Exportar Excel"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}