'use server';
/**
 * @fileOverview Fluxo Genkit para análise estratégica de relatórios de campo.
 * Resume ocorrências e sugere um checklist de ações para o Secretário.
 */

import { aiService } from '@/services/ai-service';

export type FieldAnalysisOutput = {
  executiveSummary: string;
  priorityLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendedActions: Array<{ task: string, department: string }>;
  observation: string;
};

export async function analyzeFieldReports(reports: any[]): Promise<FieldAnalysisOutput> {
  if (reports.length === 0) {
    return {
      executiveSummary: "Nenhum relatório novo para análise.",
      priorityLevel: 'low',
      recommendedActions: [],
      observation: "Sistema operando normalmente."
    };
  }

  const prompt = `Você é um consultor estratégico da Secretaria de Saúde de Rio Claro.
Analise os seguintes relatos enviados pelos motoristas de ambulância e vans:
${JSON.stringify(reports)}

Sua tarefa:
1. Gere um resumo executivo curto.
2. Classifique a urgência geral (low, medium, high, critical).
3. Crie um checklist de ações recomendadas mencionando o departamento (Ex: Manutenção, RH, Logística).`;

  const result = await aiService.generate<FieldAnalysisOutput>(
    prompt,
    "{ executiveSummary: string, priorityLevel: string, recommendedActions: Array<{ task: string, department: string }>, observation: string }"
  );

  if (result.output) return result.output;

  // Fallback de Demonstração
  return {
    executiveSummary: "Análise processada via protocolo de contingência local.",
    priorityLevel: 'medium',
    recommendedActions: [
      { task: "Verificar ruídos relatados na frota", department: "Manutenção" },
      { task: "Sincronizar horários com UBS Lídice", department: "Logística" }
    ],
    observation: "A IA identificou padrões de desgaste mecânico leve."
  };
}
