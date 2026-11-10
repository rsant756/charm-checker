# ワイルズ装飾品チェッカー

モンスターハンターワイルズの装飾品の取得状況をチェックできる Web アプリ。

- 公開URL: https://rsant756.github.io/charm-checker/
- 構成: Vite + React + TypeScript + Tailwind CSS v4 / GitHub Pages

## 開発

```bash
npm install
npm run dev      # http://localhost:5173/charm-checker/
npm test         # データ整合性・.mhws 互換テスト
npm run build    # dist/ に出力
```

## デプロイ

`main` ブランチに push すると GitHub Actions（`.github/workflows/deploy.yml`）がテスト → ビルド → GitHub Pages へ公開する。
初回のみ GitHub の Settings → Pages → Source を **GitHub Actions** にしておくこと。

## 装飾品データの追加（アップデート対応）

データは `src/data/decorations.json`。

```json
{
  "id": 362, "name": "新規珠", "slot": 2, "rarity": 5, "type": "weapon",
  "skills": [{ "name": "攻撃", "level": 1 }],
  "addedIn": "1.040"
}
```

ルール:

1. **既存の `id` は絶対に変更・削除しない**（ユーザーの `.mhws` / ブラウザ保存データが壊れる）
2. 新しい装飾品は末尾に **最大ID + 1** で追加する
3. `name` には `【n】` を含めない（`slot` から自動で付く）
4. `type` は `weapon`（武器用）/ `armor`（防具用）、`skills` はレベルの高い順
5. 追加後に `npm test` が通ることを確認

スキル情報は `scripts/skills-source.csv`（出典: https://wilds.gameconductor.com/decoration/ 、2026-11-10 取得）から
`node scripts/merge-skills.mjs` で結合した。

### スキルの最大Lv（必要数の計算に使用）

`src/data/skills.json`（スキル名 → 最大Lv）。`scripts/skill-max-source.csv` を編集して
`node scripts/build-skills.mjs` で生成する（出典: https://wilds.gameconductor.com/skill/ 、2026-11-10 取得）。
新しいスキルの装飾品を追加したときは、ここにも最大Lvを追加すること（テストで検出される）。

必要数 = どのスキルも最大Lvを超えない個数（各スキルの「最大Lv ÷ 珠のLv（切り上げ）」の最小値）。

### 武器種ごとの有効スキル

`src/data/weapons.ts` の `SKILL_WEAPONS`。ここに載っていないスキルは全武器で有効とみなす。
スキル説明文や攻略サイト（Game8）で対象武器が明示・強く示唆されているものだけを限定し、根拠がないものは隠さない方針（詳細はファイル内コメント）。

## ページ・SEO

- URL は通常のパス（`/charm-checker/talisman/` など）。旧版の `#/privacy` 形式は `src/main.tsx` で新しい URL に置き換える
- ページ一覧・タイトル・説明文は `src/seo/pages.json`。ページを追加したらここにも追加する
- `npm run build` の最後に `scripts/build-pages.mjs` が、ページごとの `index.html`（title / description / OGP / canonical / 構造化データ入り）・`404.html`・`sitemap.xml` を `dist/` に書き出す
- アクセス解析（Cloudflare Web Analytics）は `pages.json` の `analyticsToken` を入れると有効になり、プライバシーポリシーにも記載が出る

## データ形式・互換性

- 引き継ぎコード: `MHWS1-XXXX-…-XX`（独自形式。`src/lib/transferCode.ts` に仕様）。URL `?code=` で開くと確認のうえ読み込む

- ブラウザ保存: `localStorage` の `charm-checker:owned:v2`（旧キー `charm-checker:checked:v1` は初回読み込み時に引き継ぐ）
- ファイル保存: `.mhws` = `{"version":"2.0","checkedItems":[id, ...],"counts":{"id":個数}}`
  - 旧形式 `{"version":"1.0","checkedItems":[...]}` も読み込める（チェック済み＝1個所持）
- `scripts/legacy-charms.json` は 2025-07-12 公開版のデータ。テストで ID 互換性の基準として使う
