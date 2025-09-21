// app/login/page.tsx

import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1f2937] p-4">
      <Card 
        className="w-full max-w-md border-none" 
        style={{ backgroundColor: '#f8fafc', color: 'white' }}
      >
        {/* --- CORREÇÃO AQUI --- */}
        {/* Forçamos o layout para flex, coluna e centralizado */}
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