import { useState, type FormEvent } from 'react'
import Layout from '../components/Layout'
import { FORMSPREE_FORM_ID } from '../config'

const CATEGORIES = ['機能の要望', '不具合の報告', 'データの誤り', 'その他'] as const
const MAX_LENGTH = 2000

type Status = 'idle' | 'sending' | 'sent' | 'error'

const fieldClass = 'w-full rounded border border-gray-300 bg-white px-3 py-2'

export default function ContactPage() {
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  const ready = FORMSPREE_FORM_ID !== ''

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!ready || status === 'sending') return
    setStatus('sending')
    try {
      const data = new FormData(e.currentTarget)
      data.append('_subject', `[装飾品チェッカー] ${category}`)
      data.append('userAgent', navigator.userAgent)
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('sent')
      setMessage('')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <Layout>
      <article className="mx-auto max-w-screen-md rounded bg-white p-6 shadow">
        <h1 className="mb-2 border-b pb-2 text-2xl font-bold">ご意見・ご要望</h1>
        <p className="mb-6 text-sm text-gray-600">
          「こんな機能がほしい」「表示がおかしい」「装飾品のデータが間違っている」など、お気軽にお送りください。
          いただいた内容はすべて目を通していますが、個別のお返事はできない場合があります。
        </p>

        {!ready ? (
          <p className="rounded bg-gray-100 p-4 text-center text-gray-600">現在準備中です。もうしばらくお待ちください。</p>
        ) : status === 'sent' ? (
          <div className="space-y-4 text-center">
            <p className="rounded bg-green-50 p-4 text-green-800">送信しました。ご協力ありがとうございます！</p>
            <button type="button" onClick={() => setStatus('idle')} className="text-blue-600 hover:underline">
              続けて送る
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <label className="block">
              <span className="mb-1 block font-semibold">種類</span>
              <select name="category" value={category} onChange={(e) => setCategory(e.target.value)} className={fieldClass}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block font-semibold">
                内容 <span className="text-sm font-normal text-red-600">（必須）</span>
              </span>
              <textarea
                name="message"
                required
                rows={6}
                maxLength={MAX_LENGTH}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={fieldClass}
                placeholder={
                  category === '不具合の報告'
                    ? '何をしたときに、どうなったかを書いていただけると助かります（例：スマホで「引き継ぎ」のQRコードを読み取っても読み込まれない）'
                    : ''
                }
              />
              <span className="block text-right text-xs text-gray-500">
                {message.length} / {MAX_LENGTH}
              </span>
            </label>

            <label className="block">
              <span className="mb-1 block font-semibold">
                返信先メールアドレス <span className="text-sm font-normal text-gray-500">（任意）</span>
              </span>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
                autoComplete="email"
              />
              <span className="mt-1 block text-xs text-gray-500">返信が必要な場合のみご記入ください。</span>
            </label>

            {/* スパム対策（人には見えない項目。入力されていたら Formspree が破棄する） */}
            <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

            {status === 'error' && (
              <p className="rounded bg-red-50 p-3 text-sm text-red-800">
                送信に失敗しました。時間をおいてもう一度お試しください。
              </p>
            )}

            <p className="text-xs text-gray-500">
              送信内容は、フォーム送信サービス Formspree を経由して製作者に届きます。詳しくはプライバシーポリシーをご覧ください。
            </p>

            <button
              type="submit"
              disabled={status === 'sending' || message.trim() === ''}
              className="w-full rounded bg-blue-500 px-4 py-3 font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {status === 'sending' ? '送信中…' : '送信する'}
            </button>
          </form>
        )}
      </article>
    </Layout>
  )
}
