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

// ... Sua função DELETE permanece aqui ...