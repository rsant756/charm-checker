export type Dir = 'below' | 'right' | 'left' | 'above'

export type TourStep = {
  /** 説明対象の data-tour 属性の値 */
  target: string
  title: string
  text: string
  /** PC（まとめて表示）用の短い説明。無ければ text を使う */
  pcText?: string
  /** 'pc' / 'sp' のどちらかでのみ表示する */
  only?: 'pc' | 'sp'
  /** PC（まとめて表示）で吹き出しを置く方向の優先順 */
  place?: Dir[]
  /** PC での吹き出しの幅（px） */
  width?: number
}

/** PC（まとめて表示）・スマホ（1つずつ案内）の説明文 */
export const TOUR_STEPS: TourStep[] = [
  {
    target: 'search',
    title: '検索',
    text: '装飾品名やスキル名で探せます。スペースで区切ると複数条件。',
    pcText: '装飾品名・スキル名で探せます',
    place: ['below'],
  },
  {
    target: 'ownership',
    title: '所持状態',
    text: '「必要数に未達」で、まだ集めきっていない装飾品だけを表示。',
    pcText: '「必要数に未達」で集め途中のものだけ表示',
    place: ['below'],
  },
  {
    target: 'weapon',
    title: '武器種',
    text: 'その武器で効果のある装飾品だけを表示し、専用のものを先頭に並べます。',
    pcText: 'その武器で効果のある装飾品だけ表示',
    place: ['below'],
  },
  {
    target: 'file',
    title: '引き継ぎ',
    text: 'QRコードやURLで、所持データを別の端末へ移せます。バックアップにも。',
    pcText: 'QRコード・URLで別の端末へ',
    place: ['below'],
  },

  // カードの説明：PC は1つにまとめ、スマホは部分ごとに案内
  {
    target: 'card-row2',
    title: 'カードの見方',
    text: '☑ 持っていたらチェック（自動保存）\n＋− 複数持っているときの個数\n必要＝スキル上限まで無駄なく使える個数。届くと緑で「コンプ」\nスキル名を押すとそのスキルで検索（紫は武器限定スキル）',
    only: 'pc',
    place: ['right', 'below'],
    width: 300,
  },
  { target: 'card-check', title: 'チェック', text: '持っている装飾品にチェック。ブラウザに自動保存されます。', only: 'sp' },
  { target: 'card-stepper', title: '所持数', text: '複数持っているときは＋−で個数を入力。', only: 'sp' },
  {
    target: 'card-need',
    title: '必要数',
    text: 'スキル上限まで無駄なく使える個数。届くとカードが緑になり「コンプ」表示。',
    only: 'sp',
  },
  {
    target: 'card-skill',
    title: 'スキル',
    text: '押すとそのスキルで検索。紫色は効果のある武器が限られるスキル。',
    only: 'sp',
  },

  {
    target: 'stats',
    title: '入手率・コンプ率',
    text: '入手率は持っている種類の割合、コンプ率は必要数に対する所持数の割合。',
    pcText: '入手率＝持っている種類の割合\nコンプ率＝必要数に対する所持数の割合',
    place: ['below', 'left'],
  },
  { target: 'menu', title: 'メニュー', text: 'レア別統計・Xで共有・ご意見フォームはこちら。', only: 'sp' },
  {
    target: 'help',
    title: '使い方',
    text: 'この説明はいつでもここから見られます。',
    pcText: 'この説明をもう一度見る',
    place: ['below', 'right'],
  },
]
