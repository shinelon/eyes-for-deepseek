import OpenAI from "openai";

const MODEL = process.env.SENSENOVA_MODEL ?? "sensenova-6.7-flash-lite";
const BASE_URL = process.env.SENSENOVA_BASE_URL ?? "https://token.sensenova.cn/v1";

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.SENSENOVA_API_KEY || "placeholder-key",
      baseURL: BASE_URL,
    });
  }
  return _client;
}

export function getModel(): string {
  return MODEL;
}

export function getBaseUrl(): string {
  return BASE_URL;
}

export interface AnalyzeOptions {
  maxTokens?: number;
}

export async function analyzeImages(
  dataUrls: string[],
  systemPrompt: string,
  userPrompt: string,
  options: AnalyzeOptions = {}
): Promise<string> {
  if (!process.env.SENSENOVA_API_KEY) {
    throw new Error(
      "SENSENOVA_API_KEY environment variable is not set. Get one at https://platform.sensenova.cn/console"
    );
  }

  const completion = await getClient().chat.completions.create({
    model: MODEL,
    max_tokens: options.maxTokens ?? 4096,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          ...dataUrls.map((url) => ({ type: "image_url" as const, image_url: { url } })),
          { type: "text" as const, text: userPrompt },
        ],
      },
    ],
  });

  const choice = completion.choices[0];
  const content = choice?.message?.content ?? "";
  if (!content) {
    return `[No content returned — finish_reason=${choice?.finish_reason ?? "unknown"}. The model likely exhausted max_tokens on reasoning.]`;
  }
  return content;
}
