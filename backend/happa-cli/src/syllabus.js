import fs from 'node:fs'
import path from 'node:path'

let syllabusCache = null

function getSyllabusDataPath() {
  return path.resolve(process.cwd(), '..', 'canvas_api', 'all_syllabi_fast.json')
}

export function loadSyllabusCache() {
  if (syllabusCache) {
    return syllabusCache
  }

  const dataPath = getSyllabusDataPath()
  const raw = fs.readFileSync(dataPath, 'utf8')
  syllabusCache = JSON.parse(raw)
  return syllabusCache
}

function normalizeText(value = '') {
  return value.toString().toLowerCase().replace(/\s+/g, '')
}

export function findSyllabusOverview(subject = '') {
  const records = loadSyllabusCache()
  if (!subject) {
    return ''
  }

  const target = normalizeText(subject)

  for (const record of records) {
    const candidateNames = [record.科目名, record.subject, record.name].filter(Boolean)

    for (const name of candidateNames) {
      if (normalizeText(name).includes(target) || target.includes(normalizeText(name))) {
        const overviewKeys = Object.keys(record).filter((key) => /概要|overview|summary/i.test(key))
        for (const key of overviewKeys) {
          const value = record[key]
          if (typeof value === 'string' && value.trim()) {
            return value.trim()
          }
        }
        return ''
      }
    }
  }

  return ''
}
