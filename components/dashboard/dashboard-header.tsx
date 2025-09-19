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
        {/* Logo */}
        <div className="flex items-center space-x-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xl font-semibold text-white hover:text-orange-300 transition-colors"
          >
            <Image src="/logo-ustore.png" alt="uStore Logo" width={70} height={70} />
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight">Ustore</span>
              <span className="text-xs -mt-1 leading-tight opacity-90">Gerenciamento de Equipe</span>
            </div>
          </Link>

          {/* Navegação arrastável no mobile */}
          <nav className="flex items-center space-x-4 overflow-x-auto scrollbar-none md:overflow-visible md:flex-nowrap">
            <Link
              href="/dashboard"
              className="group flex-shrink-0 text-sm text-white/90 hover:text-orange-300 flex items-center space-x-1 transition-colors"
            >
              <BarChart3 className="h-4 w-4 group-hover:text-orange-300" />
              <span>Painel</span>
            </Link>
            <Link
              href="/teams"
              className="group flex-shrink-0 text-sm text-white/90 hover:text-orange-300 flex items-center space-x-1 transition-colors"
            >
              <Users className="h-4 w-4 group-hover:text-orange-300" />
              <span>Equipes</span>
            </Link>
            <Link
              href="/tasks"
              className="group flex-shrink-0 text-sm text-white/90 hover:text-orange-300 flex items-center space-x-1 transition-colors"
            >
              <CheckSquare className="h-4 w-4 group-hover:text-orange-300" />
              <span>Tarefas</span>
            </Link>
            {(user.role === "admin" || user.role === "manager") && (
              <Link
                href="/analytics"
                className="group flex-shrink-0 text-sm text-white/90 hover:text-orange-300 flex items-center space-x-1 transition-colors"
              >
                <TrendingUp className="h-4 w-4 group-hover:text-orange-300" />
                <span>Análises</span>
              </Link>
            )}
            {(user.role === "admin" || user.role === "manager") && (
              <Link
                href="/reports"
                className="group flex-shrink-0 text-sm text-white/90 hover:text-orange-300 flex items-center space-x-1 transition-colors"
              >
                <FileText className="h-4 w-4 group-hover:text-orange-300" />
                <span>Relatórios</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Usuário + Menu */}
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
                <Link href="/profile" className="group flex items-center">
                  <UserIcon className="mr-2 h-4 w-4 group-hover:text-white" />
                  <span className="group-hover:text-white">Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="group flex items-center">
                  <Settings className="mr-2 h-4 w-4 group-hover:text-white" />
                  <span className="group-hover:text-white">Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="group flex items-center">
                <LogOut className="mr-2 h-4 w-4 group-hover:text-white" />
                <span className="group-hover:text-white">Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
