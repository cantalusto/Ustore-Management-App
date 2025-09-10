import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// Lista de usuários válidos com senhas
// Em um aplicativo real, as senhas NUNCA devem ser salvas em texto plano.
// Elas devem ser "hashed" (criptografadas).
const validUsers = [
  {
    id: 1,
    name: "Dante Alighieri",
    email: "admin@company.com",
    password: "admin123", // Senha para o admin
    role: "admin" as const,
  },
  {
    id: 2,
    name: "Gerente de Projeto",
    email: "manager@company.com",
    password: "manager123", // Senha para o gerente
    role: "manager" as const,
  },
  {
    id: 3,
    name: "Membro da Equipe",
    email: "member@company.com",
    password: "member123", // Senha para o membro
    role: "member" as const,
  },
  {
    id: 4,
    name: "Kanye West",
    email: "kan.ye@company.com",
    password: "kanye123",
    role: "member" as const,
  },
  {
    id: 5,
    name: "Franz Kafka",
    email: "franz@company.com",
    password: "kafka123",
    role: "member" as const,
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // 1. Encontra o usuário na lista pelo e-mail
    const foundUser = validUsers.find(user => user.email === email)

    // 2. Verifica se o usuário foi encontrado E se a senha corresponde
    if (!foundUser || foundUser.password !== password) {
      return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 })
    }

    // 3. Se o usuário for válido, cria um objeto para a sessão (sem a senha)
    const userForSession = {
        id: foundUser.id,
        email: foundUser.email,
        role: foundUser.role,
        name: foundUser.name
    }

    // 4. Salva as informações do usuário no cookie
    const cookieStore = await cookies()
    cookieStore.set("auth-token", JSON.stringify(userForSession), {
      httpOnly: true,
      secure: false, // Mantenha como false para ambiente de desenvolvimento
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 dias
    })

    return NextResponse.json({ user: userForSession })
  } catch (error) {
    console.log("[v0] Login error:", error)
    return NextResponse.json({ error: "Falha no login" }, { status: 500 })
  }
}