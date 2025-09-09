import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface User {
  id: number
  email: string
  role: "admin" | "manager" | "member"
  name: string
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    console.log("[v0] getCurrentUser - checking for auth-token cookie")
    console.log("[v0] Cookie found:", !!token)
    if (token) {
      console.log("[v0] Cookie value:", token.value)
    }

    if (!token) {
      console.log("[v0] No auth token found, returning null")
      return null
    }

    const user = JSON.parse(token.value) as User
    console.log("[v0] Parsed user from cookie:", user)
    return user
  } catch (error) {
    console.log("[v0] Auth error:", error)
    return null
  }
}

export function hasPermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = { admin: 3, manager: 2, member: 1 }
  return (
    roleHierarchy[userRole as keyof typeof roleHierarchy] >= roleHierarchy[requiredRole as keyof typeof roleHierarchy]
  )
}
