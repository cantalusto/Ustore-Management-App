import { type NextRequest, NextResponse } from "next/server"
import PDFDocument from "pdfkit"
import ExcelJS from "exceljs"
import type PDFKit from "pdfkit" // Added import for PDFKit

// Mock data - in real app, this would come from your database
const mockData = {
  teamMembers: [
    { id: 1, name: "John Smith", role: "admin", tasksCompleted: 45, tasksInProgress: 3, efficiency: 92 },
    { id: 2, name: "Sarah Johnson", role: "manager", tasksCompleted: 38, tasksInProgress: 5, efficiency: 88 },
    { id: 3, name: "Mike Davis", role: "member", tasksCompleted: 32, tasksInProgress: 4, efficiency: 85 },
    { id: 4, name: "Emily Brown", role: "member", tasksCompleted: 28, tasksInProgress: 2, efficiency: 90 },
  ],
  tasks: [
    {
      id: 1,
      title: "Website Redesign",
      status: "completed",
      priority: "high",
      assignee: "John Smith",
      project: "Marketing",
    },
    {
      id: 2,
      title: "API Integration",
      status: "in-progress",
      priority: "medium",
      assignee: "Sarah Johnson",
      project: "Development",
    },
    { id: 3, title: "User Testing", status: "todo", priority: "low", assignee: "Mike Davis", project: "Research" },
    {
      id: 4,
      title: "Database Migration",
      status: "completed",
      priority: "urgent",
      assignee: "Emily Brown",
      project: "Infrastructure",
    },
  ],
  projects: [
    { name: "Marketing", progress: 75, tasksTotal: 12, tasksCompleted: 9 },
    { name: "Development", progress: 60, tasksTotal: 15, tasksCompleted: 9 },
    { name: "Research", progress: 40, tasksTotal: 8, tasksCompleted: 3 },
    { name: "Infrastructure", progress: 90, tasksTotal: 6, tasksCompleted: 5 },
  ],
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] PDF generation API called")
    const body = await request.json()
    console.log("[v0] Request body:", body)

    const { type, format, dateRange, memberId } = body

    if (format === "pdf") {
      console.log("[v0] Generating PDF report")
      return generatePDFReport(type, dateRange, memberId)
    } else if (format === "excel") {
      console.log("[v0] Generating Excel report")
      return generateExcelReport(type, dateRange, memberId)
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}

async function generatePDFReport(type: string, dateRange: any, memberId: string | null) {
  console.log("[v0] Starting PDF generation for type:", type)

  const doc = new PDFDocument({ margin: 50 })
  const chunks: Buffer[] = []

  doc.on("data", (chunk) => {
    chunks.push(chunk)
    console.log("[v0] PDF chunk received, size:", chunk.length)
  })

  return new Promise<NextResponse>((resolve, reject) => {
    doc.on("end", () => {
      console.log("[v0] PDF generation completed, total chunks:", chunks.length)
      const pdfBuffer = Buffer.concat(chunks)
      console.log("[v0] Final PDF buffer size:", pdfBuffer.length)

      resolve(
        new NextResponse(pdfBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${type}-report.pdf"`,
            "Content-Length": pdfBuffer.length.toString(),
          },
        }),
      )
    })

    doc.on("error", (error) => {
      console.error("[v0] PDF generation error:", error)
      reject(error)
    })

    try {
      // PDF Header
      doc.fontSize(20).text("Team Management System Report", { align: "center" })
      doc.moveDown()
      doc.fontSize(14).text(`Report Type: ${type.replace("-", " ").toUpperCase()}`, { align: "left" })
      doc.text(`Generated: ${new Date().toLocaleDateString()}`)

      if (dateRange && dateRange.from && dateRange.to) {
        doc.text(
          `Date Range: ${new Date(dateRange.from).toLocaleDateString()} - ${new Date(dateRange.to).toLocaleDateString()}`,
        )
      }
      doc.moveDown(2)

      // Report Content based on type
      switch (type) {
        case "team-performance":
          generateTeamPerformancePDF(doc)
          break
        case "task-summary":
          generateTaskSummaryPDF(doc)
          break
        case "individual-performance":
          generateIndividualPerformancePDF(doc, memberId)
          break
        case "project-status":
          generateProjectStatusPDF(doc)
          break
        default:
          doc.text("Unknown report type")
      }

      console.log("[v0] PDF content written, ending document")
      doc.end()
    } catch (error) {
      console.error("[v0] Error writing PDF content:", error)
      reject(error)
    }
  })
}

async function generateExcelReport(type: string, dateRange: any, memberId: string | null) {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("Report")

  // Excel Header
  worksheet.addRow(["Team Management System Report"])
  worksheet.addRow([`Report Type: ${type.replace("-", " ").toUpperCase()}`])
  worksheet.addRow([`Generated: ${new Date().toLocaleDateString()}`])
  worksheet.addRow([
    `Date Range: ${new Date(dateRange.from).toLocaleDateString()} - ${new Date(dateRange.to).toLocaleDateString()}`,
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

function generateTeamPerformancePDF(doc: PDFKit.PDFDocument) {
  doc.fontSize(16).text("Team Performance Overview", { underline: true })
  doc.moveDown()

  mockData.teamMembers.forEach((member) => {
    doc.fontSize(12)
    doc.text(`${member.name} (${member.role})`)
    doc.text(`  Tasks Completed: ${member.tasksCompleted}`)
    doc.text(`  Tasks In Progress: ${member.tasksInProgress}`)
    doc.text(`  Efficiency: ${member.efficiency}%`)
    doc.moveDown()
  })
}

function generateTaskSummaryPDF(doc: PDFKit.PDFDocument) {
  doc.fontSize(16).text("Task Summary", { underline: true })
  doc.moveDown()

  mockData.tasks.forEach((task) => {
    doc.fontSize(12)
    doc.text(`${task.title}`)
    doc.text(`  Status: ${task.status}`)
    doc.text(`  Priority: ${task.priority}`)
    doc.text(`  Assignee: ${task.assignee}`)
    doc.text(`  Project: ${task.project}`)
    doc.moveDown()
  })
}

function generateIndividualPerformancePDF(doc: PDFKit.PDFDocument, memberId: string | null) {
  doc.fontSize(16).text("Individual Performance", { underline: true })
  doc.moveDown()

  const members = memberId ? mockData.teamMembers.filter((m) => m.id.toString() === memberId) : mockData.teamMembers

  members.forEach((member) => {
    doc.fontSize(14).text(`${member.name}`, { underline: true })
    doc.fontSize(12)
    doc.text(`Role: ${member.role}`)
    doc.text(`Tasks Completed: ${member.tasksCompleted}`)
    doc.text(`Tasks In Progress: ${member.tasksInProgress}`)
    doc.text(`Efficiency Rating: ${member.efficiency}%`)
    doc.moveDown(2)
  })
}

function generateProjectStatusPDF(doc: PDFKit.PDFDocument) {
  doc.fontSize(16).text("Project Status Overview", { underline: true })
  doc.moveDown()

  mockData.projects.forEach((project) => {
    doc.fontSize(12)
    doc.text(`${project.name}`)
    doc.text(`  Progress: ${project.progress}%`)
    doc.text(`  Tasks: ${project.tasksCompleted}/${project.tasksTotal} completed`)
    doc.moveDown()
  })
}

function generateTeamPerformanceExcel(worksheet: ExcelJS.Worksheet) {
  worksheet.addRow(["Team Performance Overview"])
  worksheet.addRow(["Name", "Role", "Tasks Completed", "Tasks In Progress", "Efficiency %"])

  mockData.teamMembers.forEach((member) => {
    worksheet.addRow([member.name, member.role, member.tasksCompleted, member.tasksInProgress, member.efficiency])
  })
}

function generateTaskSummaryExcel(worksheet: ExcelJS.Worksheet) {
  worksheet.addRow(["Task Summary"])
  worksheet.addRow(["Title", "Status", "Priority", "Assignee", "Project"])

  mockData.tasks.forEach((task) => {
    worksheet.addRow([task.title, task.status, task.priority, task.assignee, task.project])
  })
}

function generateIndividualPerformanceExcel(worksheet: ExcelJS.Worksheet, memberId: string | null) {
  worksheet.addRow(["Individual Performance"])
  worksheet.addRow(["Name", "Role", "Tasks Completed", "Tasks In Progress", "Efficiency %"])

  const members = memberId ? mockData.teamMembers.filter((m) => m.id.toString() === memberId) : mockData.teamMembers

  members.forEach((member) => {
    worksheet.addRow([member.name, member.role, member.tasksCompleted, member.tasksInProgress, member.efficiency])
  })
}

function generateProjectStatusExcel(worksheet: ExcelJS.Worksheet) {
  worksheet.addRow(["Project Status Overview"])
  worksheet.addRow(["Project Name", "Progress %", "Tasks Completed", "Total Tasks"])

  mockData.projects.forEach((project) => {
    worksheet.addRow([project.name, project.progress, project.tasksCompleted, project.tasksTotal])
  })
}
