import { type NextRequest, NextResponse } from "next/server"
import ExcelJS from "exceljs"

// Mock data - in real app, this would come from your database
const mockData = {
  teamMembers: [
    { id: 1, name: "Dante Alighieri", role: "admin", tasksCompleted: 45, tasksInProgress: 3, efficiency: 92 },
    { id: 2, name: "Gerente de Projeto", role: "manager", tasksCompleted: 38, tasksInProgress: 5, efficiency: 88 },
    { id: 3, name: "Membro da Equipe", role: "member", tasksCompleted: 32, tasksInProgress: 4, efficiency: 85 },
    { id: 4, name: "Kanye West", role: "member", tasksCompleted: 28, tasksInProgress: 2, efficiency: 90 },
    { id: 5, name: "Franz Kafka", role: "member", tasksCompleted: 35, tasksInProgress: 1, efficiency: 95 },
  ],
  tasks: [
    {
      id: 1,
      title: "Redesenho do Site",
      status: "concluido",
      priority: "alta",
      assignee: "Kanye West",
      project: "Marketing",
    },
    {
      id: 2,
      title: "Integração de API",
      status: "em-progresso",
      priority: "media",
      assignee: "Membro da Equipe",
      project: "Desenvolvimento",
    },
    { id: 3, title: "Teste de Usuário", status: "a-fazer", priority: "baixa", assignee: "Franz Kafka", project: "Pesquisa" },
    {
      id: 4,
      title: "Migração de Banco de Dados",
      status: "concluido",
      priority: "urgente",
      assignee: "Dante Alighieri",
      project: "Infraestrutura",
    },
  ],
  projects: [
    { name: "Marketing", progress: 75, tasksTotal: 12, tasksCompleted: 9 },
    { name: "Desenvolvimento", progress: 60, tasksTotal: 15, tasksCompleted: 9 },
    { name: "Pesquisa", progress: 40, tasksTotal: 8, tasksCompleted: 3 },
    { name: "Infraestrutura", progress: 90, tasksTotal: 6, tasksCompleted: 5 },
  ],
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Report generation API called")
    const body = await request.json()
    console.log("[v0] Request body:", body)

    const { type, format, dateRange, memberId } = body

    if (format === "excel") {
      console.log("[v0] Generating Excel report")
      return generateExcelReport(type, dateRange, memberId)
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}

async function generateExcelReport(type: string, dateRange: any, memberId: string | null) {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("Relatório")

  // Excel Header
  worksheet.addRow(["Relatório do Sistema de Gestão de Equipes"])
  worksheet.addRow([`Tipo de Relatório: ${type.replace("-", " ").toUpperCase()}`])
  worksheet.addRow([`Gerado em: ${new Date().toLocaleDateString()}`])
  worksheet.addRow([
    `Intervalo de Datas: ${new Date(dateRange.from).toLocaleDateString()} - ${new Date(dateRange.to).toLocaleDateString()}`,
  ])
  worksheet.addRow([]) // Empty row

  // Report Content based on type
  switch (type) {
    case "team-performance":
      generateTeamPerformanceExcel(worksheet)
      break
    case "task-summary":
      generateTaskSummaryExcel(worksheet)
      break
    case "individual-performance":
      generateIndividualPerformanceExcel(worksheet, memberId)
      break
    case "project-status":
      generateProjectStatusExcel(worksheet)
      break
  }

  // Style the header
  worksheet.getRow(1).font = { bold: true, size: 16 }
  worksheet.getRow(2).font = { bold: true }

  const buffer = await workbook.xlsx.writeBuffer()
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${type}-report.xlsx"`,
    },
  })
}

function generateTeamPerformanceExcel(worksheet: ExcelJS.Worksheet) {
  worksheet.addRow(["Visão Geral do Desempenho da Equipe"])
  worksheet.addRow(["Nome", "Cargo", "Tarefas Concluídas", "Tarefas em Progresso", "Eficiência %"])

  mockData.teamMembers.forEach((member) => {
    worksheet.addRow([member.name, member.role, member.tasksCompleted, member.tasksInProgress, member.efficiency])
  })
}

function generateTaskSummaryExcel(worksheet: ExcelJS.Worksheet) {
  worksheet.addRow(["Resumo de Tarefas"])
  worksheet.addRow(["Título", "Status", "Prioridade", "Responsável", "Projeto"])

  mockData.tasks.forEach((task) => {
    worksheet.addRow([task.title, task.status, task.priority, task.assignee, task.project])
  })
}

function generateIndividualPerformanceExcel(worksheet: ExcelJS.Worksheet, memberId: string | null) {
  worksheet.addRow(["Desempenho Individual"])
  worksheet.addRow(["Nome", "Cargo", "Tarefas Concluídas", "Tarefas em Progresso", "Eficiência %"])

  const members = memberId ? mockData.teamMembers.filter((m) => m.id.toString() === memberId) : mockData.teamMembers

  members.forEach((member) => {
    worksheet.addRow([member.name, member.role, member.tasksCompleted, member.tasksInProgress, member.efficiency])
  })
}

function generateProjectStatusExcel(worksheet: ExcelJS.Worksheet) {
  worksheet.addRow(["Visão Geral do Status dos Projetos"])
  worksheet.addRow(["Nome do Projeto", "Progresso %", "Tarefas Concluídas", "Total de Tarefas"])

  mockData.projects.forEach((project) => {
    worksheet.addRow([project.name, project.progress, project.tasksCompleted, project.tasksTotal])
  })
}