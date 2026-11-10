import seo from '../seo/pages.json'
import PolicyPage from './PolicyPage'

/** アクセス解析を有効にしている（src/seo/pages.json の analyticsToken がある） */
const analytics = Boolean(seo.analyticsToken)

const linkClass = 'text-blue-600 hover:underline'

export default function PrivacyPolicy() {
  return (
    <PolicyPage
      title="プライバシーポリシー"
      updated="2026年11月10日"
      intro="ワイルズ装飾品チェッカー（以下「本サービス」）における、利用者の情報の取扱いについて定めます。"
      sections={[
        {
          title: '取得する情報',
          body: (
            <>
              <p>
                装飾品の所持データは、ご利用のブラウザ内（ローカルストレージ）にのみ保存されます。「引き継ぎ」のコード・URL・ファイルには所持数だけが含まれ、利用者自身が管理します。護石チェッカーの入力内容は保存されません。製作者がこれらを取得することはありません。
              </p>
              <p>
                「ご意見・ご要望」フォームをご利用いただいた場合に限り、入力された内容（種類・本文・任意で入力されたメールアドレス）と、不具合調査のためのブラウザ情報（ユーザーエージェント）を取得します。
              </p>
              {analytics && (
                <p>
                  利用状況を把握するため、閲覧されたページや参照元などの統計情報を取得します。Cookie は使用せず、個人を特定する情報は含みません。
                </p>
              )}
            </>
          ),
        },
        {
          title: '利用目的',
          body: '取得した情報は、本サービスの改善・不具合の調査、およびメールアドレスが入力された場合の返信のためにのみ利用します。',
        },
        {
          title: '利用している外部サービス',
          body: (
            <ul className="list-disc space-y-1 pl-5">
              <li>
                フォーム送信：Formspree（送信内容は同サービスを経由して製作者に届きます）
                <br />
                <a href="https://formspree.io/legal/privacy-policy/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Formspree のプライバシーポリシー
                </a>
              </li>
              {analytics && (
                <li>
                  アクセス解析：Cloudflare Web Analytics
                  <br />
                  <a href="https://www.cloudflare.com/ja-jp/privacypolicy/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                    Cloudflare のプライバシーポリシー
                  </a>
                </li>
              )}
            </ul>
          ),
        },
        {
          title: '第三者への提供',
          body: '取得した情報は、法令に基づく場合を除き、本人の同意なく第三者に提供することはありません。',
        },
        {
          title: '本ポリシーの変更',
          body: '本ポリシーは予告なく変更することがあります。変更後の内容は本ページに掲載した時点から効力を生じます。',
        },
      ]}
    />
  )
}
