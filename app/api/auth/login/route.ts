// app/api/auth/login/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 1. Encontra o usuário no banco de dados pelo e-mail
    const foundUser = await prisma.user.findUnique({
      where: { email },
    });

    // 2. Verifica se o usuário existe e se a senha está correta
    if (!foundUser || !(await bcrypt.compare(password, foundUser.password))) {
      return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
    }

    // 3. Cria o objeto para a sessão (sem a senha)
    const userForSession = {
        id: foundUser.id,
        email: foundUser.email,
        role: foundUser.role,
        name: foundUser.name
    };

    // 4. Salva as informações do usuário no cookie
    (await
      // 4. Salva as informações do usuário no cookie
      cookies()).set("auth-token", JSON.stringify(userForSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 dias
    });

    return NextResponse.json({ user: userForSession });
  } catch (error) {
    console.error("[LOGIN_ERROR]", error);
    return NextResponse.json({ error: "Falha no login" }, { status: 500 });
  }
}