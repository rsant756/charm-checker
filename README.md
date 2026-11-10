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

## データ形式・互換性

- ブラウザ保存: `localStorage` の `charm-checker:checked:v1`
- ファイル保存: `.mhws` = `{"version":"1.0","checkedItems":[id, ...]}`（旧版と同じ形式）
- `scripts/legacy-charms.json` は 2025-07-12 公開版のデータ。テストで ID 互換性の基準として使う
