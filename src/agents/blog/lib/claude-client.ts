import Anthropic from '@anthropic-ai/sdk';

const MODEL_DEFAULT = 'claude-opus-4-6';
const MAX_RETRIES = 3;

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY no está definida en el entorno');
  }
  _client = new Anthropic({ apiKey });
  return _client;
}

export interface LlamarClaudeOptions {
  model?: string;
  temperature?: number;
}

export interface LlamarClaudeResult {
  texto: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
}

export async function llamarClaude(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 4000,
  options: LlamarClaudeOptions = {},
): Promise<LlamarClaudeResult> {
  const client = getClient();
  const model = options.model ?? MODEL_DEFAULT;

  let lastError: unknown;

  for (let intento = 0; intento < MAX_RETRIES; intento++) {
    try {
      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        temperature: options.temperature ?? 1,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const texto = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n');

      const inputTokens = response.usage.input_tokens;
      const outputTokens = response.usage.output_tokens;

      console.log(
        `[claude-client] model=${model} in=${inputTokens} out=${outputTokens} intento=${intento + 1}`,
      );

      return { texto, inputTokens, outputTokens, model };
    } catch (err) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      const retriable = status === 429 || (typeof status === 'number' && status >= 500);

      if (!retriable || intento === MAX_RETRIES - 1) {
        throw err;
      }

      const backoffMs = 1000 * Math.pow(2, intento);
      console.warn(
        `[claude-client] error status=${status} intento=${intento + 1}/${MAX_RETRIES}, reintentando en ${backoffMs}ms`,
      );
      await new Promise((r) => setTimeout(r, backoffMs));
    }
  }

  throw lastError;
}
