
'use server';

import { systemSettingsService } from "@/services/system-settings-service";
import { maskPII } from "@/lib/pii-masking";

/**
 * @fileOverview Camada de execução de IA com resiliência e tratamento de erros.
 * Suporta provedores Cloud e Local (Ollama).
 */

export type AiActionResult<T> = {
  output: T | null;
  error?: {
    code: number;
    message: string;
  };
  latency: number;
};

export async function executeAiAction<T>(prompt: string, schemaDescription: string): Promise<AiActionResult<T>> {
  const startTime = Date.now();
  const settings = await systemSettingsService.getSettings();
  
  // 1. Segurança: Mascaramento PII
  const sanitizedPrompt = maskPII(prompt);
  const fullPrompt = `${sanitizedPrompt}\n\nIMPORTANTE: Responda APENAS um objeto JSON válido: ${schemaDescription}. Não use markdown.`;

  try {
    let response;
    
    if (settings.aiProvider === 'OLLAMA') {
      if (!settings.ollamaBaseUrl) throw new Error("URL do Ollama não configurada.");
      
      const baseUrl = settings.ollamaBaseUrl.endsWith('/') ? settings.ollamaBaseUrl.slice(0, -1) : settings.ollamaBaseUrl;
      
      response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(settings.ollamaApiKey && { "Authorization": `Bearer ${settings.ollamaApiKey}` })
        },
        body: JSON.stringify({
          model: settings.aiModelId,
          messages: [{ role: "user", content: fullPrompt }],
          temperature: 0.1,
          format: "json"
        })
      });
    } else {
      // Outros provedores via OpenRouter (Exemplo mantido para brevidade)
      const apiKey = settings.openrouterApiKey || process.env.OPENROUTER_API_KEY;
      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: settings.aiModelId,
          messages: [{ role: "user", content: fullPrompt }],
          temperature: 0.1
        })
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch((err) => {
        console.error("AI Actions Error parsing error response:", err);
        return {};
      });
      const status = response.status;
      
      let message = "Falha na comunicação com o motor de IA.";
      if (status === 403) message = "Chave de acesso inválida ou expirada.";
      if (status === 429 || status === 503) message = "Limite de cota atingido ou servidor sobrecarregado.";
      if (status === 404) message = "Modelo de IA não encontrado no provedor selecionado.";

      return {
        output: null,
        error: { code: status, message: errorData.error?.message || message },
        latency: Date.now() - startTime
      };
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();

    return {
      output: JSON.parse(content) as T,
      latency: Date.now() - startTime
    };

  } catch (error: any) {
    console.error("Execute AI Action Error:", error);
    return {
      output: null,
      error: { code: 500, message: error.message || "Erro interno no motor híbrido." },
      latency: Date.now() - startTime
    };
  }
}
