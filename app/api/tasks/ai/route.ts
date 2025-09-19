// app/api/tasks/ai/route.ts

import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { getCurrentUser } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Membros da equipe (mock)
const teamMembers = [
  { id: 1, name: "Dante Alighieri", role: "admin" },
  { id: 2, name: "Gerente de Projeto", role: "manager" },
  { id: 3, name: "Membro da Equipe", role: "member" },
  { id: 4, name: "Kanye West", role: "member" },
  { id: 5, name: "Franz Kafka", role: "member" },
]

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { prompt } = await request.json()
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" })
    const teamMemberList = teamMembers.map((m) => `- ${m.name} (id: ${m.id})`).join("\n")

    const aiPrompt = `
Você é um assistente inteligente para um sistema de gerenciamento de tarefas.
Sua função é criar uma tarefa em **JSON puro**, sem títulos, explicações ou markdown.

O JSON DEVE ter esta estrutura:
{
  "title": "string",
  "description": "string (obrigatório)",
  "priority": "'baixa' | 'media' | 'alta' | 'urgente'",
  "assigneeName": "string (nome de um dos membros da equipe)",
  "dueDate": "string (AAAA-MM-DD)",
  "project": "string (obrigatório)",
  "tags": "string[] (mínimo 3 tags relacionadas ao projeto, obrigatório)"
}

Membros disponíveis para atribuição:
${teamMemberList}

Regras importantes:
- A descrição deve ser detalhada.
- O campo project deve ser preenchido mas com no maximo duas palavras.
- Devem existir 3 tags relacionadas ao projeto.
- Se algum dos campos obrigatórios estiver ausente, gere-os automaticamente.
- Retorne **apenas JSON válido**.

Analise o seguinte texto do usuário e extraia os detalhes da tarefa:
Texto: "${prompt}"
`

    const responseObj = await client.models.generateContent({
      model: "gemini-1.5-flash",
      contents: aiPrompt,
    })

    const text = responseObj?.text ?? ""
    if (!text) {
      return NextResponse.json({ error: "Nenhuma resposta da IA" }, { status: 500 })
    }

    // Limpeza do JSON
    const jsonMatch = text.replace(/```json/g, "").replace(/```/g, "").match(/\{[\s\S]*\}/)
    const jsonString = jsonMatch ? jsonMatch[0] : ""
    if (!jsonString) {
      console.error("Texto bruto da IA:", text)
      return NextResponse.json({ error: "Não foi possível extrair JSON da IA" }, { status: 500 })
    }

    let taskData
    try {
      taskData = JSON.parse(jsonString)
    } catch (parseError) {
      console.error("Erro ao parsear JSON da IA:", parseError)
      console.error("Texto bruto da IA:", text)
      return NextResponse.json({ error: "Resposta da IA não é um JSON válido" }, { status: 500 })
    }

    // --- VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS ---
    if (!taskData.description) {
      taskData.description = "Descrição automática gerada pela IA para a tarefa."
    }

    if (!taskData.project) {
      taskData.project = "Projeto padrão da equipe"
    }

    if (!Array.isArray(taskData.tags) || taskData.tags.length < 3) {
      taskData.tags = ["tag1", "tag2", "tag3"]
    }

    const assignee = teamMembers.find(
      (m) => m.name.toLowerCase() === taskData.assigneeName?.toLowerCase()
    )
    if (!assignee) {
      return NextResponse.json({ error: `Membro da equipe '${taskData.assigneeName}' não encontrado.` }, { status: 400 })
    }

    // --- GARANTIR USUÁRIOS NO BANCO ---
    let dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: { id: user.id, name: user.name, role: user.role || "member" },
      })
    }

    let dbAssignee = await prisma.user.findUnique({ where: { id: assignee.id } })
    if (!dbAssignee) {
      dbAssignee = await prisma.user.create({
        data: { id: assignee.id, name: assignee.name, role: assignee.role || "member" },
      })
    }

    // Converte tags em CSV
    const tagsCSV = taskData.tags.join(",")

    // --- CRIAÇÃO DA TASK ---
    const newTask = await prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        status: "a-fazer",
        priority: taskData.priority || "media",
        assigneeId: dbAssignee.id,
        createdById: dbUser.id,
        dueDate: new Date(taskData.dueDate),
        project: taskData.project,
        tags: tagsCSV,
      },
      include: {
        assignee: true,
        createdBy: true,
      },
    })

    return NextResponse.json({ success: true, task: newTask })
  } catch (error) {
    console.error("Erro ao processar com a IA:", error)
    return NextResponse.json({ error: "Falha ao criar tarefa com IA." }, { status: 500 })
  }
}
