import http from 'node:http'
import { URL, fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import path from 'node:path'

try {
  process.loadEnvFile()
} catch (e) {
  console.log('.env file not found, using environment variables.')
}

const PORT = Number(process.env.PORT || 3001)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini'
const CANVAS_API_KEY = process.env.CANVAS_API_KEY
// Python 実行コマンド（macOS/Linux は python3、Windows は python など環境差を吸収）
const PYTHON_BIN = process.env.PYTHON_BIN || 'python'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Pythonスクリプトへの絶対パスを計算
const PYTHON_SCRIPT_PATH = path.resolve(__dirname, '../../canvas_api/match_syllabi.py')

// ==========================================
// グローバルデータキャッシュ（インメモリDB）
// ==========================================
let globalUserData = {
  last_updated: null,
  timetable: null,
  syllabi: null,
  tasks: null
}

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

  // キャッシュからシラバスと課題を抽出してAIに渡す追加情報（プロンプト）を構築
  let extraInfo = ''
  if (globalUserData.syllabi && globalUserData.syllabi[title]) {
    const syllabus = globalUserData.syllabi[title]
    extraInfo += `\n【シラバス情報（授業の狙いなど）】\n`
    for (const [k, v] of Object.entries(syllabus)) {
      if (k !== 'url' && k !== '授業計画') {
        extraInfo += `${k}: ${v}\n`
      }
    }
  }
  
  if (globalUserData.tasks && globalUserData.tasks[title]) {
    const tasks = globalUserData.tasks[title]
    if (tasks.length > 0) {
      extraInfo += `\n【未提出の課題リスト】\n`
      tasks.forEach(t => {
        extraInfo += `- ${t.name} (期限: ${t.due_at || '未定'})\n`
      })
    }
  }

  const systemPrompt = `
あなたは以下の人格で話すAIです。

# 人格
かっこいいイケメンで、人生で成功を収めたハイステータスな人物。強い自信と余裕を持つナルシスト。少しうざく軽く煽るツッコミを入れるが、本気では傷つけない。根はポジティブで、相手が「できる前提」で話す。（40代中盤という裏設定は秘密で明かさない）

# 状況
種類: ${category}
${category === '授業' ? '授業名' : '課題名'}: ${title}
今の気持ち: ${feeling}
${extraInfo}

# 目的
説教ではなく、自然な会話で相手を前向きな行動に導く。

# 返答の流れ
気持ちに軽く反応 → 少しうざいツッコミ → 成功者視点の現実的な一言 → 小さな行動を提案 → 自信ある一言で締める。

# 条件
・2〜3文、150文字程度
・軽い煽りや余裕ある言い回し（例:「まぁ分かるけどね」「ちなみに俺ならもう終わらせてる」「あんたなら普通にできる」「さて、どうする？」）
・見下さない／過度な説教や恐怖で動かさない
・毎回違う表現、絵文字なし、断定ミスをしない
・授業名や課題名、あればシラバスの目的や課題内容を自然に反映する
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

// リクエストボディを読み込むヘルパー関数
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
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

  // ==========================================
  // 1. /api/sync (Canvasデータ同期)
  // ==========================================
  if (req.method === 'POST' && requestUrl.pathname === '/api/sync') {
    console.log('[API] POST /api/sync - 同期を開始します...')
    try {
      const payload = await readBody(req)
      // リクエストボディにキーがあれば優先し、なければサーバーの .env の CANVAS_API_KEY を使う
      const apiKey = payload.canvasApiKey || CANVAS_API_KEY

      if (!apiKey) {
        console.log('[API] エラー: APIキーがありません')
        sendJson(res, 400, {
          error: 'missing_api_key',
          message: 'Canvas APIキーが設定されていません。backend/happa-cli/.env に CANVAS_API_KEY を設定してください。',
        })
        return
      }

      // Pythonスクリプトを実行してJSONを取得
      // 注意: 環境によっては 'python3' にする必要があるかもしれません
      // Windows環境での文字化け（cp932エラー）を防ぐため PYTHONIOENCODING を明示的に設定
      const execOptions = {
        maxBuffer: 1024 * 1024 * 10,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }
      }
      execFile(PYTHON_BIN, [PYTHON_SCRIPT_PATH, apiKey], execOptions, (error, stdout, stderr) => {
        if (error) {
          console.error('[API] Python実行エラー:', error.message)
          sendJson(res, 500, { error: 'sync_failed', message: error.message, stderr })
          return
        }

        try {
          const parsedData = JSON.parse(stdout)
          if (parsedData.error) {
             console.error('[API] Canvasからエラーが返りました:', parsedData.error)
             sendJson(res, 500, { error: 'canvas_error', message: parsedData.error })
             return
          }
          
          // キャッシュを更新
          globalUserData.last_updated = parsedData.last_updated
          globalUserData.timetable = parsedData.timetable || {}
          globalUserData.syllabi = parsedData.syllabi || {}
          globalUserData.tasks = parsedData.tasks || {}

          console.log('[API] POST /api/sync - 同期が正常に完了しました！')
          sendJson(res, 200, { ok: true, message: 'Sync completed successfully' })
        } catch (parseError) {
          console.error('[API] JSONパースエラー:', parseError.message)
          sendJson(res, 500, { error: 'invalid_json_from_python', message: parseError.message })
        }
      })
      return
    } catch (error) {
      console.error('[API] リクエストのパースに失敗:', error.message)
      sendJson(res, 400, { error: 'invalid_json', message: 'Request body must be valid JSON.' })
      return
    }
  }

  // ==========================================
  // 2. /api/timetable (時間割データの取得)
  // ==========================================
  if (req.method === 'GET' && requestUrl.pathname === '/api/timetable') {
    console.log('[API] GET /api/timetable - 時間割を要求されました')
    if (!globalUserData.timetable) {
      sendJson(res, 404, { error: 'not_synced', message: 'データが同期されていません。/api/sync を実行してください。' })
      return
    }
    sendJson(res, 200, globalUserData.timetable)
    return
  }

  // ==========================================
  // 3. /api/tasks (課題リストの取得)
  // ==========================================
  if (req.method === 'GET' && requestUrl.pathname === '/api/tasks') {
    console.log('[API] GET /api/tasks - 課題リストを要求されました')
    if (!globalUserData.tasks) {
      sendJson(res, 404, { error: 'not_synced', message: 'データが同期されていません。/api/sync を実行してください。' })
      return
    }
    sendJson(res, 200, globalUserData.tasks)
    return
  }

  // ==========================================
  // 4. /api/assistant (チャット機能)
  // ==========================================
  if (req.method === 'POST' && requestUrl.pathname === '/api/assistant') {
    console.log('[API] POST /api/assistant - AIにリクエストを送信中...')
    try {
      const payload = await readBody(req)
      const message = await getMessage({
        category: payload.category,
        title: payload.title,
        feeling: payload.feeling,
        round: payload.round,
        history: payload.history || [],
      })

      console.log('[API] POST /api/assistant - AIから返答がありました！')
      sendJson(res, 200, { message })
      return
    } catch (error) {
      console.error('[API] AIリクエストエラー:', error.message)
      sendJson(res, 400, { error: 'invalid_json', message: error.message || 'Request body must be valid JSON.' })
      return
    }
  }

  sendJson(res, 404, { error: 'not_found', message: 'Endpoint was not found.' })
})

server.listen(PORT, () => {
  console.log(`Happa server is running on http://localhost:${PORT}`)
  console.log('Health check: http://localhost:3001/health')
})
