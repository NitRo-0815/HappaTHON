// ① 必要な機能を読み込む（ファイルの先頭に書く）
import * as readline from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"

// ② .env を読み込む（dotenv 不要）
process.loadEnvFile()

function buildSituationText({ category, title, feeling }) {
    return `${category}「${title}」で${feeling}と感じている`;
}

async function getMessage(entry, round, history) {
    const systemPrompt = `
    あなたは大学生を応援するAIです。
    ユーザーは次の状況で悩んでいます。
    種類: ${entry.category}
    ${entry.category === "授業" ? "授業名" : "課題名"}: ${entry.title}
    今の気持ち: ${entry.feeling}
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
    現在の状況: ${buildSituationText(entry)}
    応援回数: ${round}

    過去のメッセージ:
    ${history.join("\n")}

    過去と似た表現は避け、新しい励ましメッセージを作ってください。
    `

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "X-OpenRouter-Title": "Happa CLI",
        },
        body: JSON.stringify({
            model: process.env.OPENROUTER_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
        }),
    })

    const data = await response.json()
    const message = data.choices?.[0]?.message?.content

    return message ?? "今日は一歩だけでも前に進めたら十分だよ。"
}

const rl = readline.createInterface({ input, output })

let round = 0
const history = []

while (round < 5) {
    console.log("\n========== 発破AI ==========")
    console.log("1: 授業")
    console.log("2: 課題")

    const kindAnswer = await rl.question("番号を入力してください: ")

    const entry = {
        category: "",
        title: "",
        feeling: "",
    }

    if (kindAnswer === "1") {
        entry.category = "授業"
        entry.title = await rl.question("授業名を入力してください: ")
    } else if (kindAnswer === "2") {
        entry.category = "課題"
        entry.title = await rl.question("課題名を入力してください: ")
    } else {
        console.log("1か2を入力してください。")
        continue
    }

    if (!entry.title.trim()) {
        console.log("授業名または課題名を入力してください。")
        continue
    }

    console.log("1: だるい")
    console.log("2: めんどくさい")
    console.log("3: 行きたくない")
    const feelingAnswer = await rl.question("今の気持ちを選んでください: ")

    if (feelingAnswer === "1") {
        entry.feeling = "だるい"
    } else if (feelingAnswer === "2") {
        entry.feeling = "めんどくさい"
    } else if (feelingAnswer === "3") {
        entry.feeling = "行きたくない"
    } else {
        console.log("1〜3のいずれかを入力してください。")
        continue
    }

    round++

    try {
        console.log("\nAIがあなたに発破をかけています...\n")

        const message = await getMessage(entry, round, history)

        console.log(`AI: ${message}`)
        history.push(`状況: ${buildSituationText(entry)}\n${message}`)
    } catch (error) {
        console.log("通信に失敗しました。もう一度試してください。")
    }

    console.log("\n-----------------------------")
}

console.log("\nAI: ここまでメッセージを読んだあなたなら、きっと一歩踏み出せるはず。応援しています！")

rl.close()
