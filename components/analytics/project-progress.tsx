"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, CheckSquare } from "lucide-react"

interface ProjectData {
  id: number
  name: string
  description: string
  progress: number
  totalTasks: number
  completedTasks: number
  teamMembers: number
  dueDate: string
  status: "on-track" | "at-risk" | "delayed"
  priority: "low" | "medium" | "high"
}

interface ProjectProgressProps {
  userRole: string
}

export function ProjectProgress({ userRole }: ProjectProgressProps) {
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjectProgress()
  }, [])

  const fetchProjectProgress = async () => {
    try {
      const response = await fetch("/api/analytics/projects")
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error("Failed to fetch project progress:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-track":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "at-risk":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "delayed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading project progress...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Project Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {projects.map((project) => (
          <div key={project.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="font-medium">{project.name}</h4>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>
              <div className="flex space-x-2">
                <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                <Badge className={getStatusColor(project.status)}>{project.status.replace("-", " ")}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                <span>
                  {project.completedTasks}/{project.totalTasks} tasks
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{project.teamMembers} members</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(project.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
