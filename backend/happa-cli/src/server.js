import http from 'node:http'
import { URL } from 'node:url'

process.loadEnvFile()

const PORT = Number(process.env.PORT || 3001)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini'

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(JSON.stringify(payload))
}

function buildSituationText({ category, title, feeling }) {
  return `${category}「${title}」で${feeling}と感じている`
}

async function getMessage({ category, title, feeling, round = 1, history = [] }) {
  if (!OPENROUTER_API_KEY) {
    return 'サーバーに OpenRouter の API キーが設定されていないため、応答できません。'
  }

  const systemPrompt = `
あなたは大学生を応援するAIです。
ユーザーは次の状況で悩んでいます。
種類: ${category}
${category === '授業' ? '授業名' : '課題名'}: ${title}
今の気持ち: ${feeling}
あなたの目的は、無理にやる気を出させることではありません。

この情報に合わせて、親しみのある自然な日本語で背中を押す一言を作成してください。
条件:
・2文以内
・40〜80文字程度
・説教しない
・命令口調にしない
・ネガティブな気持ちを否定しない
・大学生らしい自然な口調
・少しユーモアがあってもよい
・毎回違う表現にする
・絵文字は使わない
・授業名や課題名の内容を反映する
出力はメッセージのみ。
`

  const userPrompt = `
現在の状況: ${buildSituationText({ category, title, feeling })}
応援回数: ${round}

過去のメッセージ:
${history.join('\n')}

過去と似た表現は避け、新しい励ましメッセージを作ってください。
`

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
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenRouter request failed: ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || '今日は一歩だけでも前に進めたら十分だよ。'
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {})
    return
  }

  if (req.method === 'GET' && requestUrl.pathname === '/health') {
    sendJson(res, 200, { ok: true, service: 'happa-cli-server' })
    return
  }

  if (req.method === 'POST' && requestUrl.pathname === '/api/assistant') {
    try {
      let body = ''
      req.on('data', (chunk) => {
        body += chunk
      })

      req.on('end', async () => {
        try {
          const payload = body ? JSON.parse(body) : {}
          const message = await getMessage({
            category: payload.category,
            title: payload.title,
            feeling: payload.feeling,
            round: payload.round,
            history: payload.history || [],
          })

          sendJson(res, 200, { message })
        } catch (error) {
          sendJson(res, 500, {
            error: 'assistant_request_failed',
            message: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      })
      return
    } catch (error) {
      sendJson(res, 400, { error: 'invalid_json', message: 'Request body must be valid JSON.' })
      return
    }
  }

  sendJson(res, 404, { error: 'not_found', message: 'Endpoint was not found.' })
})

server.listen(PORT, () => {
  console.log(`Happa server is running on http://localhost:${PORT}`)
  console.log('Health check: http://localhost:3001/health')
})
