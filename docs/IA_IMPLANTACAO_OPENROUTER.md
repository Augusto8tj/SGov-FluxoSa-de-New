# Guia de Implantação: IA OpenRouter (Padrão SGov FluxoSaúde)

Este documento descreve como replicar o motor de Inteligência Artificial utilizado neste sistema em outros projetos.

## 1. Requisitos Prévios
- **Conta OpenRouter**: Obter uma API Key em [openrouter.ai](https://openrouter.ai/).
- **Ambiente**: Node.js/Next.js (ou qualquer backend com suporte a requisições HTTP/Fetch).
- **Variável de Ambiente**: Configurar `OPENROUTER_API_KEY` no arquivo `.env`.

## 2. Arquitetura do Serviço (Core)
O segredo da nossa implementação é o **AI Service**, que centraliza as chamadas e garante que o retorno seja sempre um JSON puro, sem marcações Markdown (```json ... ```) que costumam quebrar sistemas.

### Passo 1: O Serviço Central
Crie um arquivo `ai-service.ts`. Ele deve conter esta lógica de limpeza:

```typescript
export const aiService = {
  async generate<T>(prompt: string, schemaDescription: string): Promise<T> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    // Forçamos o modelo a responder apenas JSON no sistema de prompt
    const fullPrompt = `${prompt}\n\nIMPORTANTE: Responda APENAS um objeto JSON: ${schemaDescription}. Não use markdown.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-nano-9b-v2:free", // Ou o modelo de sua escolha
        messages: [{ role: "user", content: fullPrompt }],
        temperature: 0.1
      })
    });

    const data = await response.json();
    let content = data.choices[0].message.content;

    // LIMPEZA CRÍTICA: Remove blocos de código caso a IA ignore o comando
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(content) as T;
  }
};
```

## 3. Passo a Passo para Novas LLMs
Para que outra LLM implemente uma funcionalidade nova seguindo este padrão:

1. **Defina a Interface de Saída**: Crie um tipo TypeScript para o que você espera receber.
   - *Ex: `type ResumoOutput = { texto: string, prioridade: number };`*

2. **Crie o Prompt Estruturado**: Use variáveis para injetar dados dinâmicos.
   - *Ex: `Analise o seguinte relato: ${relato_do_usuario}`*

3. **Invoque o Serviço**:
   ```typescript
   const resultado = await aiService.generate<ResumoOutput>(
     meuPrompt, 
     "{ texto: string, prioridade: number }"
   );
   ```

## 4. Modelos Recomendados (Free/Low Cost)
- **Nvidia Nemotron Nano**: Excelente para classificação e extração de dados.
- **Mistral 7B Instruct**: Rápido e versátil.
- **Gemini Flash**: Melhor para análise de grandes contextos.

## 5. Dicas de Segurança
- **Pseudonimização**: Nunca envie nomes reais ou CPFs para a API. Mascare os dados antes (ex: "Paciente B.S.").
- **Fallback**: Sempre tenha um valor padrão (default) caso a IA falhe ou a cota expire.

---
*Secretaria Municipal de Ordem Pública - Rio Claro, RJ*