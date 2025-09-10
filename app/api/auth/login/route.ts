import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// Lista de usuários válidos (baseado nos seus dados de exemplo)
// Em um aplicativo real, isso viria de um banco de dados.
const validUsers = [
  {
    id: 1,
    name: "Dante Alighieri",
    email: "admin@company.com",
    role: "admin" as const,
  },
  {
    id: 2,
    name: "Gerente de Projeto",
    email: "manager@company.com",
    role: "manager" as const,
  },
  {
    id: 3,
    name: "Membro da Equipe",
    email: "member@company.com",
    role: "member" as const,
  },
  {
    id: 4,
    name: "Kanye West",
    email: "kan.ye@company.com",
    role: "member" as const,
  },
  {
    id: 5,
    name: "Franz Kafa",
    email: "franka@company.com",
    role: "member" as const,
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // 1. Encontra o usuário na lista pelo e-mail
    const foundUser = validUsers.find(user => user.email === email)

    // NOTA: Neste exemplo, não estamos verificando a senha.
    // Em um projeto real, você faria a verificação da senha aqui.
    if (!foundUser) {
      return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 })
    }

    // 2. Se o usuário for encontrado, cria um objeto para a sessão
    const userForSession = {
        id: foundUser.id,
        email: foundUser.email,
        role: foundUser.role,
        name: foundUser.name
    }

    // 3. Salva as informações do usuário no cookie
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