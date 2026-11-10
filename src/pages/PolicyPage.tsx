import type { ReactNode } from 'react'
import Layout from '../components/Layout'

export type PolicySection = { title: string; body: ReactNode }

const KANJI = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

type Props = {
  title: string
  /** 冒頭の説明文 */
  intro?: ReactNode
  /** 条文。「第一条」などの番号は自動で付ける（条項を足し引きしても番号がずれない） */
  sections: PolicySection[]
  /** 最終改定日（例: 2026年11月10日） */
  updated: string
}

export default function PolicyPage({ title, intro, sections, updated }: Props) {
  return (
    <Layout>
      <article className="mx-auto max-w-screen-lg rounded bg-white p-6 shadow">
        <h1 className="mb-4 border-b pb-2 text-2xl font-bold">{title}</h1>
        {intro && <div className="mb-4">{intro}</div>}
        {sections.map((s, i) => (
          <section key={s.title} className="mb-4">
            <h2 className="font-semibold">
              第{KANJI[i] ?? i + 1}条 {s.title}
            </h2>
            <div className="space-y-2">{s.body}</div>
          </section>
        ))}
        <p className="mt-6 text-right text-sm text-gray-500">最終改定：{updated}</p>
      </article>
    </Layout>
  )
}
