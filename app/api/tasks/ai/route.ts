// app/api/tasks/ai/route.ts

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || typeof user.id !== 'number') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const teamMembersFromDB = await prisma.user.findMany({
      select: { id: true, name: true },
    });

    if (!teamMembersFromDB || teamMembersFromDB.length === 0) {
      return NextResponse.json({ error: "Nenhum membro de equipe encontrado no banco de dados." }, { status: 500 });
    }

    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: "O prompt é obrigatório." }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("A chave GEMINI_API_KEY não está configurada.");
      return NextResponse.json({ error: "A configuração da IA está ausente." }, { status: 500 });
    }

    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const teamMemberList = teamMembersFromDB.map((m) => `- ${m.name}`).join("\n");

    const aiPrompt = `
      Você é um assistente inteligente para um sistema de gerenciamento de tarefas.
      Sua função é criar uma tarefa em JSON puro, sem títulos, explicações ou markdown.
      O JSON DEVE ter esta estrutura:
      {
        "title": "string",
        "description": "string (obrigatório)",
        "priority": "'baixa' | 'media' | 'alta' | 'urgente'",
        "assigneeName": "string (nome de um dos membros da equipe)",
        "dueDate": "string (no formato AAAA-MM-DD, obrigatório)",
        "project": "string (obrigatório)",
        "tags": "string[] (mínimo 3 tags relacionadas ao projeto, obrigatório)"
      }
      Membros disponíveis para atribuição:
      ${teamMemberList}
      Regras importantes:
      - A descrição deve ser detalhada.
      - O campo project deve ser preenchido mas com no maximo duas palavras.
      - Devem existir 3 tags relacionadas ao projeto.
      - O formato da data deve ser estritamente AAAA-MM-DD.
      - Se algum dos campos obrigatórios estiver ausente, gere-os automaticamente.
      - Retorne apenas JSON válido.
      Analise o seguinte texto do usuário e extraia os detalhes da tarefa:
      Texto: "${prompt}"
    `;
    
    const responseObj = await client.models.generateContent({
      // ===============================================
      // ESTA É A LINHA QUE ATUALIZA O MODELO USADO:
      model: "gemini-2.5-flash",
      // ===============================================
      contents: aiPrompt,
    });

    const text = responseObj?.text ?? "";
    if (!text) {
      return NextResponse.json({ error: "Nenhuma resposta da IA." }, { status: 500 });
    }

    const jsonMatch = text.replace(/```json/g, "").replace(/```/g, "").match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : "";
    if (!jsonString) {
      console.error("Texto bruto da IA não contém JSON:", text);
      return NextResponse.json({ error: "Não foi possível extrair JSON da IA." }, { status: 500 });
    }

    let taskData;
    try {
      taskData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Erro ao parsear JSON da IA:", parseError, "String JSON:", jsonString);
      return NextResponse.json({ error: "Resposta da IA não é um JSON válido." }, { status: 500 });
    }

    // Validações
    const assignee = teamMembersFromDB.find(m => m.name.toLowerCase() === taskData.assigneeName?.toLowerCase());
    if (!assignee) {
      return NextResponse.json({ error: `Membro da equipe '${taskData.assigneeName}' não encontrado.` }, { status: 400 });
    }
    const dueDate = new Date(taskData.dueDate);
    if (isNaN(dueDate.getTime())) {
      return NextResponse.json({ error: `A IA retornou uma data inválida: '${taskData.dueDate}'.` }, { status: 500 });
    }
    const allowedPriorities = ["low", "medium", "high", "urgent"];
    const priority = allowedPriorities.includes(taskData.priority) ? taskData.priority : "medium";

    // Criação da Tarefa
    const newTask = await prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        status: "a-fazer",
        priority: priority,
        assigneeId: assignee.id,
        createdById: user.id,
        dueDate: dueDate,
        project: taskData.project,
        tags: Array.isArray(taskData.tags) ? taskData.tags.join(",") : "",
      },
    });

    return NextResponse.json({ success: true, task: newTask });
  } catch (error) {
    console.error("Erro ao processar com a IA:", error);
    return NextResponse.json({ error: "Falha ao criar tarefa com IA." }, { status: 500 });
  }
}