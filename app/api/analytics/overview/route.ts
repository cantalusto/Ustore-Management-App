import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user || user.role === "member") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const range = searchParams.get("range") || "30d"

  // Mock analytics data - replace with real database queries
  const stats = {
    totalTasks: 47,
    completedTasks: 32,
    overdueTasks: 3,
    activeMembers: 12,
    completionRate: 68,
    avgCompletionTime: 3.2,
    trends: {
      tasks: 8,
      completion: 12,
      members: 2,
    },
  }

  return NextResponse.json({ stats })
}
