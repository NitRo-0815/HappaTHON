process.loadEnvFile()

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini'

export async function generateHappaMessage(prompt) {
  if (!OPENROUTER_API_KEY) {
    return 'サーバーに OpenRouter の API キーが設定されていないため、応答できません。'
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'X-OpenRouter-Title': 'Happa Server',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: 'system',
          content: 'あなたは大学生を励ます短いメッセージを返すAIです。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenRouter request failed: ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || '今日は一歩だけでも前に進めたら十分だよ。'
}
