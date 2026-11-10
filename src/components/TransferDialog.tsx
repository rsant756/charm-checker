import qrcode from 'qrcode-generator'
import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { parseMhws, serializeMhws, type Owned } from '../lib/storage'
import { decodeTransferCode, encodeTransferCode, TRANSFER_PARAM, TransferCodeError } from '../lib/transferCode'
import { confirmImport, transferUrl } from '../lib/transferUi'

type Props = {
  owned: Owned
  maxId: number
  /** 読み込んだデータで上書きする（確認は呼び出し側で済ませる） */
  onImport: (owned: Owned) => void
  onClose: () => void
}

function QrCode({ text }: { text: string }) {
  const cells = useMemo(() => {
    const qr = qrcode(0, 'L')
    qr.addData(text)
    qr.make()
    const n = qr.getModuleCount()
    const dark: string[] = []
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) dark.push(`M${c} ${r}h1v1h-1z`)
    return { n, path: dark.join('') }
  }, [text])
  const m = 4 // 余白（QR の規格で必要な白枠）
  return (
    <svg
      viewBox={`${-m} ${-m} ${cells.n + m * 2} ${cells.n + m * 2}`}
      className="h-48 w-48 bg-white"
      shapeRendering="crispEdges"
      role="img"
      aria-label="引き継ぎ用URLのQRコード"
    >
      <path d={cells.path} fill="#000" />
    </svg>
  )
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export default function TransferDialog({ owned, maxId, onImport, onClose }: Props) {
  const code = useMemo(() => encodeTransferCode(owned, maxId), [owned, maxId])
  const url = transferUrl(code)
  const [copied, setCopied] = useState<'code' | 'url' | null>(null)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  const doCopy = async (kind: 'code' | 'url') => {
    if (await copy(kind === 'code' ? code : url)) {
      setCopied(kind)
      setTimeout(() => setCopied(null), 2000)
    }
  }

  const importFrom = (loaded: Owned) => {
    for (const id of loaded.keys()) if (id > maxId) loaded.delete(id)
    if (!confirmImport(loaded)) return
    onImport(loaded)
    onClose()
  }

  const importCode = () => {
    setError('')
    // URL ごと貼り付けられた場合にも対応
    const text = input.includes(`${TRANSFER_PARAM}=`) ? (new URL(input.trim()).searchParams.get(TRANSFER_PARAM) ?? '') : input
    try {
      importFrom(decodeTransferCode(text))
    } catch (e) {
      setError(e instanceof TransferCodeError ? e.message : 'コードを読み込めませんでした')
    }
  }

  const saveFile = () => {
    const blob = new Blob([serializeMhws(owned)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'my-charms.mhws'
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 0)
  }

  const loadFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // 同じファイルを再選択できるように
    if (!file) return
    try {
      importFrom(parseMhws(await file.text()))
    } catch {
      setError('読み込み失敗: 正しい mhws ファイルではありません。')
    }
  }

  const btn = 'shrink-0 rounded bg-blue-500 px-3 py-2 text-sm text-white hover:bg-blue-600'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="transfer-title"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 id="transfer-title" className="text-lg font-bold">
            引き継ぎ・バックアップ
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-500 hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-4 text-sm">
          <section>
            <h3 className="mb-1 font-semibold">別の端末へ移す</h3>
            <p className="mb-3 text-gray-600">
              移したい端末でQRコードを読み取るか、URLを開くと、今の所持データ（{owned.size}種類）を読み込めます。
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <QrCode text={url} />
              <div className="w-full min-w-0 space-y-2">
                <div className="flex gap-2">
                  <input readOnly value={url} aria-label="引き継ぎ用URL" className="min-w-0 flex-1 rounded border px-2 py-2 text-xs" />
                  <button type="button" onClick={() => doCopy('url')} className={btn}>
                    {copied === 'url' ? 'コピー済み' : 'URLをコピー'}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  LINEやメモ帳に貼っておけば、バックアップにもなります（iPhoneのSafariは、7日間開かないと保存データが消えることがあります）。
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-1 font-semibold">引き継ぎコード</h3>
            <textarea
              readOnly
              value={code}
              rows={4}
              aria-label="引き継ぎコード"
              className="w-full rounded border bg-gray-50 px-2 py-2 font-mono text-xs break-all"
            />
            <button type="button" onClick={() => doCopy('code')} className={`${btn} mt-1`}>
              {copied === 'code' ? 'コピー済み' : 'コードをコピー'}
            </button>
          </section>

          <section>
            <h3 className="mb-1 font-semibold">コード・URLから読み込む</h3>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="MHWS1-… またはURLを貼り付け"
                aria-label="引き継ぎコードを入力"
                className="min-w-0 flex-1 rounded border px-2 py-2 text-xs"
              />
              <button type="button" onClick={importCode} disabled={input.trim() === ''} className={`${btn} disabled:bg-gray-400`}>
                読み込む
              </button>
            </div>
            {error && <p className="mt-2 rounded bg-red-50 p-2 text-red-800">{error}</p>}
          </section>

          <details>
            <summary className="cursor-pointer text-gray-600">ファイルで保存・読み込み（.mhws）</summary>
            <p className="mt-2 text-xs text-gray-500">以前のバージョンで保存した .mhws ファイルも読み込めます。</p>
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={saveFile} className="rounded border border-gray-300 px-3 py-2 hover:bg-gray-50">
                ファイルに保存
              </button>
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="rounded border border-gray-300 px-3 py-2 hover:bg-gray-50"
              >
                ファイルを読み込む
              </button>
              <input ref={fileInput} type="file" accept=".mhws" onChange={loadFile} className="hidden" />
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
