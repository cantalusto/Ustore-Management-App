// /app/api/auth/login/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs';
import { signJwt, type User } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const foundUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!foundUser || !(await bcrypt.compare(password, foundUser.password))) {
      return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
    }

    const userPayload: User = {
        id: foundUser.id,
        email: foundUser.email,
        role: foundUser.role as User['role'],
        name: foundUser.name,
        department: foundUser.department,
        // ✅ CORREÇÃO 1: Converte 'null' em 'undefined' para corresponder ao tipo User
        image: foundUser.image ?? undefined
    };

    const token = await signJwt(userPayload);
    
    const response = NextResponse.json({ 
        message: "Login bem-sucedido!",
        user: userPayload 
    });

    // ✅ CORREÇÃO 2: Adiciona 'await' antes de 'cookies()' para resolver a Promise
    (await cookies()).set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 dias
    });

    return response;

  } catch (error) {
    console.error("[LOGIN_ERROR]", error);
    return NextResponse.json({ error: "Falha no login" }, { status: 500 });
  }
}