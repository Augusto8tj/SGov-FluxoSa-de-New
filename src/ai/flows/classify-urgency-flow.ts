'use server';
/**
 * @fileOverview Fluxo Genkit para classificação inteligente de urgência.
 * Utiliza o modelo padrão do sistema via AI Service.
 */

import { aiService } from '@/services/ai-service';

export type ClassifyUrgencyOutput = {
  suggestedUrgency: 'low' | 'medium' | 'high' | 'critical';
  reasoning: string;
};

export async function classifyUrgency(input: { patientNotes: string, destination: string }): Promise<ClassifyUrgencyOutput> {
  const prompt = `Você é um triador médico em Rio Claro.
Analise a condição e o destino para sugerir a urgência (low, medium, high, critical).
Condição: ${input.patientNotes}
Destino: ${input.destination}`;

  const result = await aiService.generate<ClassifyUrgencyOutput>(
    prompt,
    "{ suggestedUrgency: string, reasoning: string }"
  );

  if (result.output) return result.output;

  // Fallback Determinístico Local
  const dest = input.destination.toLowerCase();
  const notes = input.patientNotes.toLowerCase();
  let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let reasoning = 'Classificação automática via protocolo de contingência local.';

  if (dest.includes('hemodialise') || dest.includes('oncologia')) {
    urgency = 'high';
    reasoning = 'Prioridade alta para tratamentos contínuos (Protocolo Rio Claro).';
  } else if (notes.includes('dor') || notes.includes('falta de ar')) {
    urgency = 'medium';
  }

  return { suggestedUrgency: urgency, reasoning };
}
