import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user || user.role === "member") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const range = searchParams.get("range") || "30d"

  // Mock task analytics data - replace with real database queries
  const data = {
    statusDistribution: [
      { name: "To Do", value: 12, color: "#6b7280" },
      { name: "In Progress", value: 8, color: "#3b82f6" },
      { name: "Review", value: 5, color: "#f59e0b" },
      { name: "Completed", value: 22, color: "#10b981" },
    ],
    priorityDistribution: [
      { name: "Low", value: 15 },
      { name: "Medium", value: 20 },
      { name: "High", value: 10 },
      { name: "Urgent", value: 2 },
    ],
    completionTrend: [
      { date: "2024-01-01", completed: 3, created: 5 },
      { date: "2024-01-02", completed: 2, created: 3 },
      { date: "2024-01-03", completed: 4, created: 2 },
      { date: "2024-01-04", completed: 1, created: 4 },
      { date: "2024-01-05", completed: 5, created: 3 },
      { date: "2024-01-06", completed: 3, created: 1 },
      { date: "2024-01-07", completed: 2, created: 6 },
    ],
    departmentStats: [
      { department: "Development", completed: 18, pending: 7 },
      { department: "Design", completed: 12, pending: 4 },
      { department: "Marketing", completed: 8, pending: 3 },
      { department: "Management", completed: 6, pending: 2 },
    ],
  }

  return NextResponse.json({ data })
}
