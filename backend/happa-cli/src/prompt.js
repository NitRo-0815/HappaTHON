export function buildPrompt({ subject, syllabusOverview, canvasAssignments, feeling }) {
  const assignmentLines = canvasAssignments.length
    ? canvasAssignments
        .map(([name, dueAt]) => `・${name}\n締切${dueAt || '未設定'}`)
        .join('\n\n')
    : '・なし'

  return `
授業名
${subject || '未指定'}

授業概要
${syllabusOverview || '情報がありません'}

課題一覧
${assignmentLines}

現在の気持ち
${feeling || '不明'}

この情報を参考に
「まあ行くか」
「少しだけやるか」
と思える文章を生成してください。`.	rim()
}
