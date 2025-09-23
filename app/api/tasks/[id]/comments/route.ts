// app/api/tasks/[id]/comments/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Busca todos os comentários de uma tarefa
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const taskId = parseInt(params.id, 10);
  if (isNaN(taskId)) {
    return NextResponse.json({ error: "ID da tarefa inválido" }, { status: 400 });
  }

  try {
    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        author: {
          select: {
            id: true, // Adicionado para obter o authorId
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Falha ao buscar comentários:", error);
    return NextResponse.json({ error: "Falha ao buscar comentários." }, { status: 500 });
  }
}

// POST: Cria um novo comentário em uma tarefa
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const taskId = parseInt(params.id, 10);
  if (isNaN(taskId)) {
    return NextResponse.json({ error: "ID da tarefa inválido" }, { status: 400 });
  }

  try {
    const { text } = await request.json();
    if (!text || typeof text !== 'string' || text.trim() === '') {
        return NextResponse.json({ error: "O texto do comentário é obrigatório." }, { status: 400 });
    }

    const newComment = await prisma.comment.create({
      data: {
        text,
        taskId,
        authorId: user.id,
      },
      include: {
        author: {
            select: {
                id: true,
                name: true,
                image: true,
            }
        }
      }
    });

    return NextResponse.json({ comment: newComment }, { status: 201 });
  } catch (error) {
    console.error("Falha ao criar comentário:", error);
    return NextResponse.json({ error: "Falha ao criar comentário." }, { status: 500 });
  }
}
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const commentId = searchParams.get("commentId");
  
  if (!commentId || isNaN(parseInt(commentId))) return NextResponse.json({ error: "ID do comentário inválido" }, { status: 400 });

  try {
    const comment = await prisma.comment.findUnique({ where: { id: parseInt(commentId) } });
    if (!comment) return NextResponse.json({ error: "Comentário não encontrado" }, { status: 404 });

    // Apenas autor ou admin podem deletar
    if (comment.authorId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado a deletar este comentário" }, { status: 403 });
    }

    await prisma.comment.delete({ where: { id: parseInt(commentId) } });
    return NextResponse.json({ message: "Comentário deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar comentário:", error);
    return NextResponse.json({ error: "Falha ao deletar comentário" }, { status: 500 });
  }
}