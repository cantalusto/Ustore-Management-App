// app/api/tasks/ai/route.ts

import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { getCurrentUser } from "@/lib/auth"

// Mock de dados
const teamMembers = [
  { id: 1, name: "Dante Alighieri", role: "admin" },
  { id: 2, name: "Gerente de Projeto", role: "manager" },
  { id: 3, name: "Membro da Equipe", role: "member" },
  { id: 4, name: "Kanye West", role: "member" },
  { id: 5, name: "Franz Kafka", role: "member" },
]

// Mock de tarefas
const tasks: any[] = []
let nextId = 6

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
  "description": "string (opcional)",
  "priority": "'baixa' | 'media' | 'alta' | 'urgente'",
  "assigneeName": "string (nome de um dos membros da equipe)",
  "dueDate": "string (AAAA-MM-DD)",
  "project": "string (opcional)",
  "tags": "string[] (opcional)"
}

Membros disponíveis para atribuição:
${teamMemberList}

Analise o seguinte texto do usuário e extraia os detalhes da tarefa.
Texto: "${prompt}"

Retorne **apenas JSON válido**.
`

    const responseObj = await client.models.generateContent({
      model: "gemini-1.5-flash",
      contents: aiPrompt,
    })

    const text = responseObj?.text ?? ""

    if (!text) {
      return NextResponse.json({ error: "Nenhuma resposta da IA" }, { status: 500 })
    }

    // Limpeza do JSON: pega apenas o conteúdo entre chaves, mesmo com quebras de linha
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

    const assignee = teamMembers.find(
      (m) => m.name.toLowerCase() === taskData.assigneeName?.toLowerCase()
    )
    if (!assignee) {
      return NextResponse.json({ error: `Membro da equipe '${taskData.assigneeName}' não encontrado.` }, { status: 400 })
    }

    const newTask = {
      id: nextId++,
      title: taskData.title,
      description: taskData.description || "",
      status: "a-fazer" as const,
      priority: taskData.priority || "media",
      assigneeId: assignee.id,
      assigneeName: assignee.name,
      createdBy: user.id,
      createdByName: user.name,
      dueDate: taskData.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      project: taskData.project || "",
      tags: taskData.tags || [],
    }

    tasks.push(newTask)

    return NextResponse.json({ success: true, task: newTask })
  } catch (error) {
    console.error("Erro ao processar com a IA:", error)
    return NextResponse.json({ error: "Falha ao criar tarefa com IA." }, { status: 500 })
  }
}
