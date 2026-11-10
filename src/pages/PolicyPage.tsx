import type { ReactNode } from 'react'
import Layout from '../components/Layout'

export type PolicySection = { title: string; body: ReactNode }

export default function PolicyPage({ title, sections }: { title: string; sections: PolicySection[] }) {
  return (
    <Layout>
      <article className="mx-auto max-w-screen-lg rounded bg-white p-6 shadow">
        <h1 className="mb-4 border-b pb-2 text-2xl font-bold">{title}</h1>
        {sections.map((s) => (
          <section key={s.title} className="mb-4 last:mb-0">
            <h2 className="font-semibold">{s.title}</h2>
            <div>{s.body}</div>
          </section>
        ))}
      </article>
    </Layout>
  )
}
