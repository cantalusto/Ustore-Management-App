"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User as UserIcon, Users, BarChart3, CheckSquare, TrendingUp, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import type { User as UserType } from "@/lib/auth"

interface DashboardHeaderProps {
  user: UserType
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="border-b border-border bg-[var(--accent)] text-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xl font-semibold text-white hover:opacity-90"
          >
            <Image src="/logo-ustore.png" alt="uStore Logo" width={28} height={28} />
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight">uStore</span>
              <span className="text-xs -mt-1 leading-tight opacity-90">Gerenciamento de Equipe</span>
            </div>
          </Link>

          {/* Navegação arrastável no mobile */}
          <nav className="flex md:flex hidden items-center space-x-4 overflow-x-auto scrollbar-none">
            <Link
              href="/dashboard"
              className="flex-shrink-0 text-sm text-white/90 hover:text-white flex items-center space-x-1"
            >
              <BarChart3 className="h-4 w-4 text-white" />
              <span>Painel</span>
            </Link>
            <Link
              href="/teams"
              className="flex-shrink-0 text-sm text-white/90 hover:text-white flex items-center space-x-1"
            >
              <Users className="h-4 w-4 text-white" />
              <span>Equipes</span>
            </Link>
            <Link
              href="/tasks"
              className="flex-shrink-0 text-sm text-white/90 hover:text-white flex items-center space-x-1"
            >
              <CheckSquare className="h-4 w-4 text-white" />
              <span>Tarefas</span>
            </Link>
            {(user.role === "admin" || user.role === "manager") && (
              <Link
                href="/analytics"
                className="flex-shrink-0 text-sm text-white/90 hover:text-white flex items-center space-x-1"
              >
                <TrendingUp className="h-4 w-4 text-white" />
                <span>Análises</span>
              </Link>
            )}
            {(user.role === "admin" || user.role === "manager") && (
              <Link
                href="/reports"
                className="flex-shrink-0 text-sm text-white/90 hover:text-white flex items-center space-x-1"
              >
                <FileText className="h-4 w-4 text-white" />
                <span>Relatórios</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm bg-white/20 text-white px-2 py-1 rounded-md capitalize">
            {user.role}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full text-white">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-white/20 text-white">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <UserIcon className="mr-2 h-4 w-4 text-white" />
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4 text-white" />
                  Configurações
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4 text-white" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
