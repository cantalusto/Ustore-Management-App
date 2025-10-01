// app/api/teams/members/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const saltRounds = 10;

// Rota para ATUALIZAR (Editar) um membro
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const memberId = parseInt(params.id, 10);
  if (isNaN(memberId)) {
    return NextResponse.json({ error: "ID de membro inválido" }, { status: 400 });
  }
  
  // Um usuário só pode editar o próprio perfil (a menos que seja admin/manager)
  if (user.role !== 'admin' && user.role !== 'manager' && user.id !== memberId) {
      return NextResponse.json({ error: "Permissões insuficientes" }, { status: 403 });
  }

  try {
    const updates = await request.json();
    
    // Se uma nova senha foi enviada, criptografa-a
    if (updates.password && updates.password.trim() !== "") {
      updates.password = await bcrypt.hash(updates.password, saltRounds);
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

// Rota para DELETAR um membro
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const memberId = parseInt(id, 10);
    if (isNaN(memberId)) {
      return NextResponse.json({ error: "ID de membro inválido" }, { status: 400 });
    }

    // Verificar permissões - apenas admin e manager podem deletar membros
    if (user.role !== 'admin' && user.role !== 'manager') {
      return NextResponse.json({ error: "Permissões insuficientes" }, { status: 403 });
    }

    // Não permitir que o usuário delete a si mesmo
    if (user.id === memberId) {
      return NextResponse.json({ error: "Você não pode deletar sua própria conta" }, { status: 400 });
    }

    try {
      // Verificar se o membro existe
      const memberToDelete = await prisma.user.findUnique({
        where: { id: memberId }
      });

      if (!memberToDelete) {
        return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 });
      }

      // Managers só podem deletar members, não outros managers ou admins
      if (user.role === 'manager' && memberToDelete.role !== 'member') {
        return NextResponse.json({ error: "Managers só podem deletar membros comuns" }, { status: 403 });
      }

      // Reatribuir tarefas do usuário deletado para o usuário atual
      await prisma.task.updateMany({
        where: { assigneeId: memberId },
        data: { assigneeId: user.id }
      });

      // Deletar o membro
      await prisma.user.delete({
        where: { id: memberId }
      });

      return NextResponse.json({ message: "Membro deletado com sucesso" });

    } catch (error) {
      console.error("Falha ao deletar membro:", error);
      return NextResponse.json({ error: "Falha ao deletar membro." }, { status: 500 });
    }
  } catch (error) {
    console.error("Falha ao deletar membro:", error);
    return NextResponse.json({ error: "Falha ao deletar membro." }, { status: 500 });
  }
}