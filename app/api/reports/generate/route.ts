// app/api/reports/generate/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import ExcelJS from "exceljs";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Adiciona 'department' à desestruturação
    const { type, format, dateRange, memberId, department } = body;

    if (format === "excel") {
      // Passa 'department' para a função de geração
      return generateExcelReport(type, dateRange, memberId, department);
    }

    return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return NextResponse.json({ error: "Falha ao gerar relatório" }, { status: 500 });
  }
}

async function generateExcelReport(type: string, dateRange: { from: string; to: string }, memberId: string | null, department: string | null) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Relatório");
  const startDate = new Date(dateRange.from);
  const endDate = new Date(dateRange.to);

  worksheet.addRow(["Relatório do Sistema de Gestão de Equipes"]);
  worksheet.addRow([`Tipo: ${type.replace(/-/g, " ").toUpperCase()}`]);
  worksheet.addRow([`Período: ${startDate.toLocaleDateString("pt-BR")} - ${endDate.toLocaleDateString("pt-BR")}`]);
  worksheet.addRow([]);

  // Cria um filtro de usuário genérico
  const userFilter: any = {};
  if (department) userFilter.department = department;
  if (memberId) userFilter.id = parseInt(memberId, 10);

  switch (type) {
    case "team-performance":
      await generateTeamPerformanceExcel(worksheet, startDate, endDate, userFilter);
      break;
    case "task-summary":
      await generateTaskSummaryExcel(worksheet, startDate, endDate, userFilter);
      break;
    case "individual-performance":
      // Este relatório específico ainda usa memberId diretamente
      await generateIndividualPerformanceExcel(worksheet, startDate, endDate, memberId);
      break;
    case "project-status":
      await generateProjectStatusExcel(worksheet, startDate, endDate, userFilter);
      break;
  }

  worksheet.getRow(1).font = { bold: true, size: 16 };
  worksheet.columns.forEach(column => { column.width = 25; });
  
  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="relatorio-${type}.xlsx"`,
    },
  });
}

async function generateTeamPerformanceExcel(worksheet: ExcelJS.Worksheet, from: Date, to: Date, userFilter: any) {
  const users = await prisma.user.findMany({
    where: userFilter, // Aplica o filtro
    include: { assignedTasks: { where: { createdAt: { gte: from, lte: to } } } },
  });
  worksheet.addRow(["Nome", "Cargo", "Departamento", "Tarefas Atribuídas", "Tarefas Concluídas", "Taxa de Conclusão (%)"]);
  users.forEach(user => {
    const tasksAssigned = user.assignedTasks.length;
    const tasksCompleted = user.assignedTasks.filter(t => t.status === 'concluido').length;
    const completionRate = tasksAssigned > 0 ? Math.round((tasksCompleted / tasksAssigned) * 100) : 0;
    worksheet.addRow([user.name, user.role, user.department, tasksAssigned, tasksCompleted, completionRate]);
  });
}

async function generateTaskSummaryExcel(worksheet: ExcelJS.Worksheet, from: Date, to: Date, userFilter: any) {
  const taskWhere: any = { createdAt: { gte: from, lte: to } };
  if (Object.keys(userFilter).length > 0) {
    taskWhere.assignee = userFilter; // Filtra tarefas pelo responsável
  }

  const tasks = await prisma.task.findMany({
    where: taskWhere,
    include: { assignee: true },
  });
  worksheet.addRow(["Título", "Status", "Prioridade", "Responsável", "Projeto", "Data de Vencimento"]);
  tasks.forEach(task => {
    worksheet.addRow([task.title, task.status, task.priority, task.assignee?.name || 'N/A', task.project, task.dueDate.toLocaleDateString('pt-BR')]);
  });
}

async function generateIndividualPerformanceExcel(worksheet: ExcelJS.Worksheet, from: Date, to: Date, memberId: string | null) {
  const memberIdInt = memberId ? parseInt(memberId, 10) : null;
  if (!memberIdInt) {
      worksheet.addRow(["Por favor, selecione um membro para gerar este relatório."]);
      return;
  }
  
  const tasks = await prisma.task.findMany({ 
      where: { 
          assigneeId: memberIdInt,
          createdAt: { gte: from, lte: to }
      }, 
      include: { assignee: true } 
  });
  
  const member = await prisma.user.findUnique({ where: { id: memberIdInt } });
  
  worksheet.addRow([`Relatório de Desempenho Individual: ${member?.name || 'Membro não encontrado'}`]);
  worksheet.mergeCells('A5', 'E5'); // Ajuste da linha para não sobrepor o cabeçalho
  worksheet.getCell('A5').font = { bold: true, size: 14 };
  worksheet.addRow([]);
  worksheet.addRow(["Título", "Status", "Prioridade", "Projeto", "Data de Vencimento"]);
  
  tasks.forEach(task => {
    worksheet.addRow([task.title, task.status, task.priority, task.project, task.dueDate.toLocaleDateString('pt-BR')]);
  });
}

async function generateProjectStatusExcel(worksheet: ExcelJS.Worksheet, from: Date, to: Date, userFilter: any) {
    const taskWhere: any = { project: { not: null }, createdAt: { gte: from, lte: to } };
    if (Object.keys(userFilter).length > 0) {
      taskWhere.assignee = userFilter; // Filtra tarefas pelo responsável
    }

    const tasks = await prisma.task.findMany({ where: taskWhere });
    
    const projectsMap = new Map<string, { total: number; completed: number }>();
    tasks.forEach(task => {
        if (task.project) {
            if (!projectsMap.has(task.project)) {
                projectsMap.set(task.project, { total: 0, completed: 0 });
            }
            const project = projectsMap.get(task.project)!;
            project.total++;
            if (task.status === 'concluido') project.completed++;
        }
    });

    worksheet.addRow(["Projeto", "Total de Tarefas", "Tarefas Concluídas", "Progresso (%)"]);
    projectsMap.forEach((data, name) => {
        const progress = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
        worksheet.addRow([name, data.total, data.completed, progress]);
    });
}