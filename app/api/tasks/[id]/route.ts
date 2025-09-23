// app/api/tasks/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";

const prisma = new PrismaClient();

// GET tarefa por ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const taskId = parseInt(params.id, 10);
  if (isNaN(taskId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignee: true, createdBy: true }, // inclua relações
    });

    if (!task) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      task: {
        ...task,
        dueDate: task.dueDate?.toISOString().split("T")[0] || null,
        tags: task.tags ? task.tags.split(",") : [],
        assigneeName: task.assignee?.name || null,
        createdByName: task.createdBy?.name || null,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar tarefa:", error);
    return NextResponse.json({ error: "Erro ao buscar tarefa" }, { status: 500 });
  }
}

// PATCH (editar tarefa)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const taskId = parseInt(params.id, 10);
  if (isNaN(taskId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const updates = await req.json();

    if (updates.tags) {
      if (Array.isArray(updates.tags)) {
        updates.tags = updates.tags.join(",");
      } else if (typeof updates.tags === "string") {
        updates.tags = updates.tags
          .split(",")
          .map((tag: string) => tag.trim())
          .filter(Boolean)
          .join(",");
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId }, // ✅ number
      data: {
        ...updates,
        updatedAt: new Date(),
      },
      include: { assignee: true, createdBy: true },
    });

    return NextResponse.json({
      task: {
        ...updatedTask,
        dueDate: updatedTask.dueDate?.toISOString().split("T")[0] || null,
        tags: updatedTask.tags ? updatedTask.tags.split(",") : [],
        assigneeName: updatedTask.assignee?.name || null,
        createdByName: updatedTask.createdBy?.name || null,
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    return NextResponse.json({ error: "Erro ao atualizar tarefa" }, { status: 500 });
  }
}

// DELETE (excluir tarefa)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "manager")) {
    return NextResponse.json({ error: "Permissões insuficientes" }, { status: 403 });
  }

  const taskId = parseInt(params.id, 10);
  if (isNaN(taskId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    await prisma.task.delete({
      where: { id: taskId },
    });
    return NextResponse.json({ success: true, message: "Tarefa excluída com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir tarefa:", error);
    return NextResponse.json({ error: "Falha ao excluir a tarefa." }, { status: 500 });
  }
}