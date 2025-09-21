// components/dashboard/recent-activity.tsx
"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import type { Task } from "@/lib/types"; // Reutilizando a interface

interface ActivityTask extends Task {
    updatedAt: string;
    createdByName: string;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
        try {
            // Reutilizamos a API de tarefas, que já busca do banco
            const response = await fetch('/api/tasks'); 
            const data = await response.json();
            // Pegamos as 5 tarefas atualizadas mais recentemente
            const recentTasks = data.tasks
                .sort((a: ActivityTask, b: ActivityTask) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 5);
            setActivities(recentTasks);
        } catch (error) {
            console.error("Failed to fetch recent activities:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchRecentActivity();
  }, []);

  const getActivityText = (task: ActivityTask) => {
    const timeAgo = formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true, locale: ptBR });
    
    if (task.status === 'concluido' && (new Date(task.updatedAt).getTime() - new Date(task.createdAt).getTime()) > 1000) {
      return { user: task.assigneeName, action: 'concluiu a tarefa', target: task.title, time: timeAgo };
    }
    return { user: task.createdByName, action: 'criou a tarefa', target: task.title, time: timeAgo };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="space-y-4">
            {activities.map((task) => {
                const activity = getActivityText(task);
                return (
                <div key={task.id} className="flex items-center space-x-4">
                    <Avatar className="h-8 w-8">
                    <AvatarFallback>
                        {activity.user.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                    <p className="text-sm">
                        <span className="font-medium">{activity.user}</span> {activity.action}{" "}
                        <span className="font-medium text-primary">{activity.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <Badge variant="outline">Tarefa</Badge>
                </div>
                )
            })}
            </div>
        )}
      </CardContent>
    </Card>
  )
}