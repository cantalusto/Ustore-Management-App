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