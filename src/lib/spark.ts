export type SparkLLM = {
  llm: (prompt: any, model: string, json?: boolean) => Promise<string>
  llmPrompt: (strings: TemplateStringsArray, ...exprs: any[]) => any
}

export function getSparkLLM(): { spark: SparkLLM | null; available: boolean } {
  const w = (typeof window !== 'undefined' ? (window as any) : undefined)
  const s = w?.spark
  if (!s || typeof s.llm !== 'function' || typeof s.llmPrompt !== 'function') {
    return { spark: null, available: false }
  }
  return { spark: s as SparkLLM, available: true }
}

export function isLLMAvailable(): boolean {
  const { available } = getSparkLLM()
  return available
}

export async function tryLLM<T>(
  runner: (spark: SparkLLM) => Promise<T>,
  fallback: () => Promise<T> | T
): Promise<T> {
  const { spark, available } = getSparkLLM()
  if (!available || !spark) return await Promise.resolve(fallback())
  try {
    return await runner(spark)
  } catch {
    return await Promise.resolve(fallback())
  }
}

// Call Spark LLM and parse JSON with a typed fallback
export async function llmJSON<T>(
  buildPrompt: (spark: SparkLLM) => any,
  fallback: () => Promise<T> | T,
  model: string = 'gpt-4o',
  forceJSON: boolean = true
): Promise<T> {
  return tryLLM(async (spark) => {
    const prompt = buildPrompt(spark)
    const text = await spark.llm(prompt, model, forceJSON)
    try {
      return JSON.parse(text) as T
    } catch {
      return await Promise.resolve(fallback())
    }
  }, fallback)
}
