// app/login/page.tsx

import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Meteors } from "@/components/ui/shadcn-io/meteors";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-orange-950 p-4 overflow-hidden">
      {/* Background stars effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      
      {/* Meteors Background with Orange and Blue colors */}
      <Meteors 
        number={30} 
        className="[&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:via-blue-500 [&>div]:to-transparent"
      />
      
      {/* Login Card */}
      <Card 
        className="w-full max-w-md border-none relative z-10 shadow-2xl backdrop-blur-sm bg-white/95 hover:shadow-orange-500/20 transition-shadow duration-500" 
        style={{ backgroundColor: 'rgba(248, 250, 252, 0.95)', color: 'grey' }}
      >
        <CardHeader className="flex flex-col items-center text-center">
          <Image 
            src="/logo-ustore-login.png" 
            alt="uStore Logo" 
            width={80} 
            height={80}
            className="mb-4"
          />
          <CardTitle className="text-2xl text-gray-800 font-bold">Gerenciamento de Equipe</CardTitle>
          <CardDescription className="text-gray-600">Faça login para acessar o painel de sua equipe</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}