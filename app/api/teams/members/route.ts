// app/api/teams/members/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const saltRounds = 10; // Fator de complexidade para o hash

// LISTAR MEMBROS
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const members = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        phone: true,
        joinDate: true,
        status: true,
      }
    });
    return NextResponse.json({ members });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao buscar membros." }, { status: 500 });
  }
}

// CRIAR NOVO MEMBRO
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "manager")) {
    return NextResponse.json({ error: "Permissões insuficientes" }, { status: 403 });
  }

  try {
    const { name, email, role, department, phone, password } = await request.json();

    if (!name || !email || !role || !password) {
        return NextResponse.json({ error: "Nome, e-mail, função e senha são obrigatórios." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Este e-mail já está em uso." }, { status: 400 });
    }
    
    if (role === "admin" && user.role !== "admin") {
      return NextResponse.json({ error: "Apenas administradores podem criar outros administradores." }, { status: 403 });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newMember = await prisma.user.create({
      data: {
        name,
        email,
        role,
        department,
        phone,
        password: hashedPassword,
      },
    });

    // Remove a senha do objeto de retorno
    const { password: _, ...memberWithoutPassword } = newMember;

    return NextResponse.json({ member: memberWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error("[CREATE_MEMBER_ERROR]", error);
    return NextResponse.json({ error: "Dados da requisição inválidos." }, { status: 400 });
  }
}