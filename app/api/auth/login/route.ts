import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    let user
    if (email.includes("admin")) {
      user = { id: 1, email, role: "admin", name: "Admin User" }
    } else if (email.includes("manager")) {
      user = { id: 2, email, role: "manager", name: "Manager User" }
    } else {
      user = { id: 3, email, role: "member", name: "Team Member" }
    }

    const cookieStore = await cookies()
    cookieStore.set("auth-token", JSON.stringify(user), {
      httpOnly: true,
      secure: false, // Allow for development
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.log("[v0] Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
