// app/api/tasks/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Busca as tarefas do banco de dados, incluindo os dados do responsável e do criador
    const dbTasks = await prisma.task.findMany({
      include: {
        assignee: true, // Inclui o objeto User relacionado via assigneeId
        createdBy: true,  // Inclui o objeto User relacionado via createdById
      },
      orderBy: {
        createdAt: 'desc' // Ordena as tarefas mais recentes primeiro
      }
    });

    // Formata os dados para corresponder à interface `Task` que o frontend espera
    let tasks = dbTasks.map(task => ({
      ...task,
      dueDate: task.dueDate.toISOString().split('T')[0], // Formata a data
      assigneeName: task.assignee.name, // Adiciona o nome do responsável
      createdByName: task.createdBy.name, // Adiciona o nome do criador
      tags: task.tags ? task.tags.split(',') : [], // Converte a string de tags em um array
    }));

    // Aplica o filtro de permissão como antes
    if (user.role === "member") {
      tasks = tasks.filter((task) => task.assigneeId === user.id || task.createdById === user.id);
    }

    return NextResponse.json({ tasks });

  } catch (error) {
    console.error("Falha ao buscar tarefas:", error);
    return NextResponse.json({ error: "Não foi possível buscar as tarefas." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Converte o array de tags em uma string CSV para salvar no banco
    const tagsCSV = Array.isArray(body.tags) ? body.tags.join(',') : null;

    const newTask = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description || "",
        status: "a-fazer",
        priority: body.priority,
        assigneeId: body.assigneeId,
        createdById: user.id, // Usa o ID do usuário logado
        dueDate: new Date(body.dueDate),
        project: body.project || "",
        tags: tagsCSV,
      },
    });

    return NextResponse.json({ task: newTask }, { status: 201 });
  } catch (error) {
    console.error("Falha ao criar tarefa:", error);
    return NextResponse.json({ error: "Dados inválidos para criar a tarefa." }, { status: 400 });
  }
}