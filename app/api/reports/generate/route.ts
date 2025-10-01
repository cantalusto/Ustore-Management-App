// app/api/reports/generate/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import ExcelJS from "exceljs";

const prisma = new PrismaClient();

// Translations for report generation
const translations = {
  pt: {
    'reports.excel.main_title': 'Relatório do Sistema de Gestão de Equipes',
    'reports.excel.type': 'Tipo',
    'reports.excel.period': 'Período',
    'reports.excel.name': 'Nome',
    'reports.excel.role': 'Cargo',
    'reports.excel.department': 'Departamento',
    'reports.excel.tasks_assigned': 'Tarefas Atribuídas',
    'reports.excel.tasks_completed': 'Tarefas Concluídas',
    'reports.excel.completion_rate': 'Taxa de Conclusão (%)',
    'reports.excel.title': 'Título',
    'reports.excel.status': 'Status',
    'reports.excel.priority': 'Prioridade',
    'reports.excel.assignee': 'Responsável',
    'reports.excel.project': 'Projeto',
    'reports.excel.due_date': 'Data de Vencimento',
    'reports.excel.individual_report': 'Relatório de Desempenho Individual',
    'reports.excel.total_tasks': 'Total de Tarefas',
    'reports.excel.progress': 'Progresso (%)',
    'reports.excel.select_member': 'Por favor, selecione um membro para gerar este relatório.',
    'reports.excel.member_not_found': 'Membro não encontrado',
    'reports.team_performance': 'DESEMPENHO DO DEPARTAMENTO',
    'reports.task_summary': 'RESUMO DE TAREFAS',
    'reports.individual_performance': 'DESEMPENHO INDIVIDUAL',
    'reports.project_status': 'STATUS DOS PROJETOS'
  },
  en: {
    'reports.excel.main_title': 'Team Management System Report',
    'reports.excel.type': 'Type',
    'reports.excel.period': 'Period',
    'reports.excel.name': 'Name',
    'reports.excel.role': 'Role',
    'reports.excel.department': 'Department',
    'reports.excel.tasks_assigned': 'Tasks Assigned',
    'reports.excel.tasks_completed': 'Tasks Completed',
    'reports.excel.completion_rate': 'Completion Rate (%)',
    'reports.excel.title': 'Title',
    'reports.excel.status': 'Status',
    'reports.excel.priority': 'Priority',
    'reports.excel.assignee': 'Assignee',
    'reports.excel.project': 'Project',
    'reports.excel.due_date': 'Due Date',
    'reports.excel.individual_report': 'Individual Performance Report',
    'reports.excel.total_tasks': 'Total Tasks',
    'reports.excel.progress': 'Progress (%)',
    'reports.excel.select_member': 'Please select a member to generate this report.',
    'reports.excel.member_not_found': 'Member not found',
    'reports.team_performance': 'TEAM PERFORMANCE',
    'reports.task_summary': 'TASK SUMMARY',
    'reports.individual_performance': 'INDIVIDUAL PERFORMANCE',
    'reports.project_status': 'PROJECT STATUS'
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Adiciona 'department' e 'language' à desestruturação
    const { type, format, dateRange, memberId, department, language = 'pt' } = body;

    if (format === "excel") {
      // Passa 'department' e 'language' para a função de geração
      return generateExcelReport(type, dateRange, memberId, department, language);
    }

    return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return NextResponse.json({ error: "Falha ao gerar relatório" }, { status: 500 });
  }
}

async function generateExcelReport(type: string, dateRange: { from: string; to: string }, memberId: string | null, department: string | null, language: string = 'pt') {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Relatório");
  const startDate = new Date(dateRange.from);
  const endDate = new Date(dateRange.to);
  
  // Get translations for the selected language
  const t = translations[language as keyof typeof translations] || translations.pt;
  
  // Format dates according to language
  const dateFormat = language === 'pt' ? 'pt-BR' : 'en-US';

  worksheet.addRow([t['reports.excel.main_title']]);
  worksheet.addRow([`${t['reports.excel.type']}: ${t[`reports.${type.replace(/-/g, '_')}` as keyof typeof t] || type.replace(/-/g, " ").toUpperCase()}`]);
  worksheet.addRow([`${t['reports.excel.period']}: ${startDate.toLocaleDateString(dateFormat)} - ${endDate.toLocaleDateString(dateFormat)}`]);
  worksheet.addRow([]);

  // Cria um filtro de usuário genérico
  const userFilter: any = {};
  if (department) userFilter.department = department;
  if (memberId) userFilter.id = parseInt(memberId, 10);

  switch (type) {
    case "team-performance":
      await generateTeamPerformanceExcel(worksheet, startDate, endDate, userFilter, t, dateFormat);
      break;
    case "task-summary":
      await generateTaskSummaryExcel(worksheet, startDate, endDate, userFilter, t, dateFormat);
      break;
    case "individual-performance":
      // Este relatório específico ainda usa memberId diretamente
      await generateIndividualPerformanceExcel(worksheet, startDate, endDate, memberId, t, dateFormat);
      break;
    case "project-status":
      await generateProjectStatusExcel(worksheet, startDate, endDate, userFilter, t, dateFormat);
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

async function generateTeamPerformanceExcel(worksheet: ExcelJS.Worksheet, from: Date, to: Date, userFilter: any, t: any, dateFormat: string) {
  const users = await prisma.user.findMany({
    where: userFilter, // Aplica o filtro
    include: { assignedTasks: { where: { createdAt: { gte: from, lte: to } } } },
  });
  worksheet.addRow([t['reports.excel.name'], t['reports.excel.role'], t['reports.excel.department'], t['reports.excel.tasks_assigned'], t['reports.excel.tasks_completed'], t['reports.excel.completion_rate']]);
  users.forEach(user => {
    const tasksAssigned = user.assignedTasks.length;
    const tasksCompleted = user.assignedTasks.filter(t => t.status === 'concluido').length;
    const completionRate = tasksAssigned > 0 ? Math.round((tasksCompleted / tasksAssigned) * 100) : 0;
    worksheet.addRow([user.name, user.role, user.department, tasksAssigned, tasksCompleted, completionRate]);
  });
}

async function generateTaskSummaryExcel(worksheet: ExcelJS.Worksheet, from: Date, to: Date, userFilter: any, t: any, dateFormat: string) {
  const taskWhere: any = { createdAt: { gte: from, lte: to } };
  if (Object.keys(userFilter).length > 0) {
    taskWhere.assignee = userFilter; // Filtra tarefas pelo responsável
  }

  const tasks = await prisma.task.findMany({
    where: taskWhere,
    include: { assignee: true },
  });
  worksheet.addRow([t['reports.excel.title'], t['reports.excel.status'], t['reports.excel.priority'], t['reports.excel.assignee'], t['reports.excel.project'], t['reports.excel.due_date']]);
  tasks.forEach(task => {
    worksheet.addRow([task.title, task.status, task.priority, task.assignee?.name || 'N/A', task.project, task.dueDate.toLocaleDateString(dateFormat)]);
  });
}

async function generateIndividualPerformanceExcel(worksheet: ExcelJS.Worksheet, from: Date, to: Date, memberId: string | null, t: any, dateFormat: string) {
  const memberIdInt = memberId ? parseInt(memberId, 10) : null;
  if (!memberIdInt) {
      worksheet.addRow([t['reports.excel.select_member']]);
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
  
  worksheet.addRow([`${t['reports.excel.individual_report']}: ${member?.name || t['reports.excel.member_not_found']}`]);
  worksheet.mergeCells('A5', 'E5'); // Ajuste da linha para não sobrepor o cabeçalho
  worksheet.getCell('A5').font = { bold: true, size: 14 };
  worksheet.addRow([]);
  worksheet.addRow([t['reports.excel.title'], t['reports.excel.status'], t['reports.excel.priority'], t['reports.excel.project'], t['reports.excel.due_date']]);
  
  tasks.forEach(task => {
    worksheet.addRow([task.title, task.status, task.priority, task.project, task.dueDate.toLocaleDateString(dateFormat)]);
  });
}

async function generateProjectStatusExcel(worksheet: ExcelJS.Worksheet, from: Date, to: Date, userFilter: any, t: any, dateFormat: string) {
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

    worksheet.addRow([t['reports.excel.project'], t['reports.excel.total_tasks'], t['reports.excel.tasks_completed'], t['reports.excel.progress']]);
    projectsMap.forEach((data, name) => {
        const progress = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
        worksheet.addRow([name, data.total, data.completed, progress]);
    });
}