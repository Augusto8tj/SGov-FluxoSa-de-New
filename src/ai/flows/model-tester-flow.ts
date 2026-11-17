'use server';
/**
 * @fileOverview Fluxo Genkit para testar modelos da OpenRouter.
 */

import { z } from 'genkit';
import { ai } from '@/ai/genkit';

const ModelTesterOutputSchema = z.object({
  content: z.string(),
  latency: z.number(),
  actualModel: z.string(),
  tokens: z.number().optional(),
  error: z.string().optional(),
  rawResponse: z.any().optional(),
});

export type ModelTesterOutput = z.infer<typeof ModelTesterOutputSchema>;

const modelTesterFlow = ai.defineFlow(
  {
    name: 'modelTesterFlow',
    inputSchema: z.object({
      prompt: z.string(),
      modelId: z.string(),
    }),
    outputSchema: ModelTesterOutputSchema,
  },
  async (input) => {
    const startTime = Date.now();
    
    try {
      const apiKey = process.env.OPENROUTER_API_KEY;
      
      if (!apiKey) {
        return {
          content: "",
          latency: 0,
          actualModel: input.modelId,
          error: "OPENROUTER_API_KEY não configurada no ambiente."
        };
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://sgov-fluxosaude.gov.br",
          "X-Title": "SGov FluxoSaúde Lab",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: input.modelId,
          messages: [{ role: "user", content: input.prompt }],
        })
      });

      const data = await response.json();
      const endTime = Date.now();
      const latency = endTime - startTime;

      if (!response.ok) {
        return {
          content: "",
          latency,
          actualModel: input.modelId,
          error: data.error?.message || `Erro HTTP ${response.status}`,
          rawResponse: data
        };
      }

      return {
        content: data.choices?.[0]?.message?.content || "Sem resposta.",
        latency,
        actualModel: data.model || input.modelId,
        tokens: data.usage?.total_tokens,
        rawResponse: data
      };

    } catch (error: any) {
      console.error("Model Tester Flow Error:", error);
      return {
        content: "",
        latency: Date.now() - startTime,
        actualModel: input.modelId,
        error: error.message || "Erro de conexão com OpenRouter."
      };
    }
  }
);

export async function runModelTest(prompt: string, modelId: string): Promise<ModelTesterOutput> {
  return modelTesterFlow({ prompt, modelId });
}
