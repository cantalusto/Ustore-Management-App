// /lib/auth.ts

import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const secretKey = process.env.JWT_SECRET || "your-very-secret-key-that-is-long-and-secure";
const key = new TextEncoder().encode(secretKey);

// ===================
// Interfaces
// ===================
export interface User {
  department: string | null;
  id: number;
  email: string;
  role: "admin" | "manager" | "member";
  name: string;
  image?: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: "a-fazer" | "em-progresso" | "revisao" | "concluido";
  priority: "baixa" | "media" | "alta" | "urgente";
  assigneeId: number;
  assigneeName: string;
  assigneeDepartment?: string;
  createdBy: number;
  createdByName: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  project: string;
  tags: string[];
}

export interface TeamMember {
  id: number;
  name: string;
  email?: string;
  role?: string;
}

// ===================
// Funções JWT (Segurança)
// ===================

export async function signJwt(payload: User) {
  // ✅ CORREÇÃO 1: Espalha o payload em um novo objeto para corresponder ao tipo JWTPayload
  return new SignJWT({ ...payload }) 
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(key);
}

export async function verifyJwt(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    // ✅ CORREÇÃO 2: Usa um cast de duas etapas para converter o tipo de forma segura
    return payload as unknown as User;
  } catch (error) {
    console.error("[Auth] Token JWT inválido ou expirado:", error);
    return null;
  }
}

// ===================
// Funções Auxiliares
// ===================

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    // ✅ CORREÇÃO 3: A função cookies() é síncrona, não use 'await'
    const token = cookieStore.get("auth-token");

    if (!token?.value) {
      return null;
    }

    const verifiedUser = await verifyJwt(token.value);
    
    if (!verifiedUser) {
      return null;
    }
    
    return verifiedUser;
  } catch (error) {
    console.error("[Auth] Erro ao processar o cookie de autenticação:", error);
    return null;
  }
}

export function hasPermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = { admin: 3, manager: 2, member: 1 };
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
  return userLevel >= requiredLevel;
}