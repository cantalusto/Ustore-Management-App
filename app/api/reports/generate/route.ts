import { type NextRequest, NextResponse } from "next/server"
import ExcelJS from "exceljs"

// Mock de dados - em um app real, isso viria do seu banco de dados
const mockData = {
  teamMembers: [
    { id: 1, name: "Dante Alighieri", role: "Administrador", tasksCompleted: 45, tasksInProgress: 3, efficiency: 92 },
    { id: 2, name: "Gerente de Projeto", role: "Gerente", tasksCompleted: 38, tasksInProgress: 5, efficiency: 88 },
    { id: 3, name: "Membro da Equipe", role: "Membro", tasksCompleted: 32, tasksInProgress: 4, efficiency: 85 },
    { id: 4, name: "Kanye West", role: "Membro", tasksCompleted: 28, tasksInProgress: 2, efficiency: 90 },
    { id: 5, name: "Franz Kafka", role: "Membro", tasksCompleted: 35, tasksInProgress: 1, efficiency: 95 },
  ],
  tasks: [
    {
      id: 1,
      title: "Redesenho do Site",
      status: "Concluído",
      priority: "Alta",
      assignee: "Kanye West",
      project: "Marketing",
    },
    {
      id: 2,
      title: "Integração de API",
      status: "Em Progresso",
      priority: "Média",
      assignee: "Membro da Equipe",
      project: "Desenvolvimento",
    },
    { id: 3, title: "Teste de Usuário", status: "A Fazer", priority: "Baixa", assignee: "Franz Kafka", project: "Pesquisa" },
    {
      id: 4,
      title: "Migração de Banco de Dados",
      status: "Concluído",
      priority: "Urgente",
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
    const body = await request.json()
    const { type, format, dateRange, memberId } = body

    if (format === "excel") {
      return generateExcelReport(type, dateRange, memberId)
    }

    return NextResponse.json({ error: "Formato inválido" }, { status: 400 })
  } catch (error) {
    console.error("Erro ao gerar relatório:", error)
    return NextResponse.json({ error: "Falha ao gerar relatório" }, { status: 500 })
  }
}

async function generateExcelReport(type: string, dateRange: any, memberId: string | null) {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("Relatório")

  // Cabeçalho do Excel
  worksheet.addRow(["Relatório do Sistema de Gestão de Equipes"])
  worksheet.addRow([`Tipo de Relatório: ${type.replace("-", " ").toUpperCase()}`])
  worksheet.addRow([`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`])
  worksheet.addRow([
    `Período: ${new Date(dateRange.from).toLocaleDateString("pt-BR")} - ${new Date(dateRange.to).toLocaleDateString("pt-BR")}`,
  ])
  worksheet.addRow([]) // Linha vazia

  // Conteúdo do relatório baseado no tipo
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

  // Estiliza o cabeçalho
  worksheet.getRow(1).font = { bold: true, size: 16 }
  worksheet.getRow(2).font = { bold: true }

  const buffer = await workbook.xlsx.writeBuffer()
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="relatorio-${type}.xlsx"`,
    },
  })
}

function generateTeamPerformanceExcel(worksheet: ExcelJS.Worksheet) {
  worksheet.addRow(["Visão Geral do Desempenho da Equipe"])
  worksheet.addRow(["Nome", "Cargo", "Tarefas Concluídas", "Tarefas em Progresso", "Eficiência (%)"])

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
  worksheet.addRow(["Nome", "Cargo", "Tarefas Concluídas", "Tarefas em Progresso", "Eficiência (%)"])

  const members = memberId ? mockData.teamMembers.filter((m) => m.id.toString() === memberId) : mockData.teamMembers

  members.forEach((member) => {
    worksheet.addRow([member.name, member.role, member.tasksCompleted, member.tasksInProgress, member.efficiency])
  })
}

function generateProjectStatusExcel(worksheet: ExcelJS.Worksheet) {
  worksheet.addRow(["Visão Geral do Status dos Projetos"])
  worksheet.addRow(["Nome do Projeto", "Progresso (%)", "Tarefas Concluídas", "Total de Tarefas"])

  mockData.projects.forEach((project) => {
    worksheet.addRow([project.name, project.progress, project.tasksCompleted, project.tasksTotal])
  })
}