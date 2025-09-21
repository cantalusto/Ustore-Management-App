// app/api/tasks/ai/route.ts

import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { getCurrentUser } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // 1. BUSCAR USUÁRIOS REAIS DO BANCO DE DADOS
    //    Esta é a correção principal: removemos o mock e usamos dados reais.
    const teamMembersFromDB = await prisma.user.findMany({
      select: { id: true, name: true },
    });

    if (!teamMembersFromDB || teamMembersFromDB.length === 0) {
        return NextResponse.json({ error: "Nenhum membro de equipe encontrado no banco de dados." }, { status: 500 });
    }

    const { prompt } = await request.json()
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // --- SEÇÃO DO GEMINI (INTOCADA, CONFORME SOLICITADO) ---
    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" })
    // Usar a lista de usuários reais no prompt para a IA
    const teamMemberList = teamMembersFromDB.map((m) => `- ${m.name}`).join("\n")

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
    // --- FIM DA SEÇÃO DO GEMINI ---

    // 2. VALIDAÇÃO ROBUSTA DA RESPOSTA DA IA
    if (!taskData.description?.trim() || !taskData.project?.trim() || !Array.isArray(taskData.tags) || taskData.tags.length < 3) {
      return NextResponse.json({ error: "A IA não gerou todos os campos obrigatórios (descrição, projeto, 3+ tags). Tente ser mais específico." }, { status: 500 });
    }

    // 3. VALIDAÇÃO DO RESPONSÁVEL USANDO A LISTA REAL DO BANCO
    const assignee = teamMembersFromDB.find(
      (m) => m.name.toLowerCase() === taskData.assigneeName?.toLowerCase()
    )
    if (!assignee) {
      return NextResponse.json({ error: `Membro da equipe '${taskData.assigneeName}' não encontrado.` }, { status: 400 })
    }

    // 4. REMOÇÃO DA LÓGICA INSEGURA DE CRIAÇÃO DE USUÁRIOS
    //    O código que estava aqui foi removido.

    const tagsCSV = taskData.tags.join(",")

    // 5. CRIAÇÃO DA TAREFA COM IDs VÁLIDOS
    const newTask = await prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        status: "a-fazer",
        priority: taskData.priority || "media",
        assigneeId: assignee.id, // ID Válido do banco de dados
        createdById: user.id,   // ID Válido do usuário logado
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