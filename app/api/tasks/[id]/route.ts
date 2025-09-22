// app/api/tasks/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Esta função ATUALIZA uma tarefa. É usada pelo Drag & Drop e pelo formulário de edição.
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const taskId = parseInt(params.id, 10);
  if (isNaN(taskId)) {
    return NextResponse.json({ error: "ID da tarefa inválido" }, { status: 400 });
  }

  try {
    const currentTask = await prisma.task.findUnique({ where: { id: taskId } });
    if (!currentTask) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });
    }

    // Lógica de permissão para edição
    const canEdit =
      user.role === "admin" ||
      user.role === "manager" ||
      currentTask.createdById === user.id ||
      currentTask.assigneeId === user.id;

    if (!canEdit) {
      return NextResponse.json({ error: "Permissões insuficientes" }, { status: 403 });
    }

    const updates = await request.json();

    // **CORREÇÃO AQUI:** Converte a string de data para um objeto Date
    if (updates.dueDate) {
      updates.dueDate = new Date(updates.dueDate);
    }

    // Se as tags forem um array (vindo do formulário de edição), converta para CSV
    if (Array.isArray(updates.tags)) {
      updates.tags = updates.tags.join(',');
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...updates,
        updatedAt: new Date(), // Garante que a data de atualização seja sempre nova
      },
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error("Falha ao atualizar a tarefa:", error);
    return NextResponse.json({ error: "Dados da requisição inválidos ou falha no servidor." }, { status: 400 });
  }
}

// Esta função EXCLUI uma tarefa.
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const user = await getCurrentUser()
  
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
  
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Permissões insuficientes" }, { status: 403 })
    }
  
    const taskId = parseInt(params.id, 10)
  
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "ID da tarefa inválido" }, { status: 400 })
    }
  
    try {
      await prisma.task.delete({
        where: { id: taskId },
      })
  
      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("Falha ao excluir a tarefa:", error)
      return NextResponse.json({ error: "Tarefa não encontrada ou falha ao excluir." }, { status: 404 })
    }
}