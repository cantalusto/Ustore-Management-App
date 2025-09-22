// app/api/teams/members/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs"; // Garanta que está usando bcryptjs

const prisma = new PrismaClient();
const saltRounds = 10;

// --- ROTA PARA ATUALIZAR (EDITAR) UM MEMBRO ---
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const memberId = parseInt(params.id, 10);
  if (isNaN(memberId)) {
    return NextResponse.json({ error: "ID de membro inválido" }, { status: 400 });
  }

  try {
    const memberToUpdate = await prisma.user.findUnique({ where: { id: memberId } });
    if (!memberToUpdate) {
      return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 });
    }

    // Validação de permissão
    const canEdit = user.role === "admin" || (user.role === "manager" && memberToUpdate.role !== "admin");
    if (!canEdit) {
      return NextResponse.json({ error: "Permissões insuficientes para editar este membro." }, { status: 403 });
    }

    const updates = await request.json();
    
    // Se uma nova senha foi enviada, criptografa-a
    if (updates.password && updates.password.trim() !== "") {
      updates.password = await bcryptjs.hash(updates.password, saltRounds);
    } else {
      delete updates.password; // Garante que a senha não seja sobrescrita com um valor vazio
    }

    const updatedMember = await prisma.user.update({
      where: { id: memberId },
      data: updates,
    });

    const { password, ...memberWithoutPassword } = updatedMember;
    return NextResponse.json({ member: memberWithoutPassword });

  } catch (error) {
    console.error("Falha ao atualizar membro:", error);
    return NextResponse.json({ error: "Falha ao atualizar membro." }, { status: 500 });
  }
}

// --- ROTA PARA EXCLUIR UM MEMBRO ---
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Apenas administradores podem excluir membros." }, { status: 403 });
  }

  const memberId = parseInt(params.id, 10);
  if (isNaN(memberId)) {
    return NextResponse.json({ error: "ID de membro inválido." }, { status: 400 });
  }
  
  if (memberId === user.id) {
    return NextResponse.json({ error: "Você não pode excluir a si mesmo." }, { status: 400 });
  }

  try {
    const memberToDelete = await prisma.user.findUnique({ where: { id: memberId } });
    if (!memberToDelete) {
      return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });
    }
    
    if (memberToDelete.role === "admin") {
      return NextResponse.json({ error: "Não é possível excluir um usuário administrador." }, { status: 403 });
    }

    // Lógica de Segurança: Reatribui as tarefas do usuário a serem excluídas para o admin que está executando a ação.
    await prisma.task.updateMany({
        where: { assigneeId: memberId },
        data: { assigneeId: user.id } 
    });

    // Agora, exclui o usuário
    await prisma.user.delete({
      where: { id: memberId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Falha ao excluir membro:", error);
    return NextResponse.json({ error: "Falha ao excluir membro." }, { status: 500 });
  }
}