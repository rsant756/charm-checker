import type { Decoration } from '../types'

export const WEAPONS = [
  '大剣',
  '太刀',
  '片手剣',
  '双剣',
  'ハンマー',
  '狩猟笛',
  'ランス',
  'ガンランス',
  'スラッシュアックス',
  'チャージアックス',
  '操虫棍',
  'ライトボウガン',
  'ヘビィボウガン',
  '弓',
] as const

export type Weapon = (typeof WEAPONS)[number]

const MELEE: Weapon[] = WEAPONS.filter((w) => w !== 'ライトボウガン' && w !== 'ヘビィボウガン' && w !== '弓')
const BOWGUN: Weapon[] = ['ライトボウガン', 'ヘビィボウガン']
const RANGED: Weapon[] = [...BOWGUN, '弓']
/** ガードできる武器 */
const GUARD: Weapon[] = ['大剣', '片手剣', 'ランス', 'ガンランス', 'チャージアックス', 'ヘビィボウガン']

/**
 * 効果のある武器が限られるスキル。ここに無いスキルはすべての武器で有効とみなす。
 *
 * 方針: ゲーム内のスキル説明文（出典: wilds.gameconductor.com のスキル詳細、2026-11-10 取得）や
 * 攻略サイト（Game8 の各スキル解説、2026-11-10 確認）で対象武器が明示・強く示唆されているものだけを限定する。
 * 根拠が見つからないもの（KO術・飛燕・スタミナ奪取・状態異常系・会心撃【特殊】など）は
 * 誤って隠さないよう「全武器」扱いにしている。
 */
export const SKILL_WEAPONS: Record<string, readonly Weapon[]> = {
  // 斬れ味に関わるスキル（斬れ味があるのは近接武器のみ）
  匠: MELEE,
  業物: MELEE,
  剛刃研磨: MELEE,
  鈍器使い: MELEE,
  達人芸: MELEE,
  砥石使用高速化: MELEE,

  // 近接武器のみ（Game8: 心眼「近接武器の攻撃にのみ乗る」、抜刀術は抜刀攻撃の解説・装備例が近接のみ）
  心眼: MELEE,
  '抜刀術【技】': MELEE,
  '抜刀術【力】': MELEE,

  // 溜め攻撃・ゲージ（Game8 の解説より）
  // 集中: 説明文の「太刀、双剣、銃槍、剣斧、盾斧、弓、ボウガン」＋溜め斬りの大剣・ハンマー。操虫棍は装備例があるため残す
  集中: ['大剣', '太刀', '双剣', 'ハンマー', 'ガンランス', 'スラッシュアックス', 'チャージアックス', '操虫棍', ...BOWGUN, '弓'],
  // チャージマスター: Game8 の倍率表に載っている武器
  チャージマスター: ['大剣', '太刀', '片手剣', 'ハンマー', 'ランス', 'チャージアックス', '操虫棍', '弓'],

  // ガード関連
  ガード性能: GUARD,
  ガード強化: GUARD,
  攻めの守勢: GUARD,

  // 説明文に武器種が明記されているもの
  強化持続: ['太刀', '双剣', 'スラッシュアックス', 'チャージアックス', '操虫棍'],
  高速変形: ['スラッシュアックス', 'チャージアックス'],
  砲術: ['ガンランス', 'チャージアックス', ...BOWGUN], // 砲撃・竜撃砲・ビン攻撃・徹甲榴弾
  砲弾装填: ['ガンランス', 'チャージアックス'],
  笛吹き名人: ['狩猟笛'],
  溜打強化: ['ハンマー'],

  // 射撃武器
  弾導強化: RANGED,
  ファーストショット: BOWGUN,
  フォースショット: RANGED,
  '通常弾・通常矢強化': RANGED,
  '貫通弾・竜の矢強化': RANGED,
  '散弾・剛射強化': RANGED,
  速射強化: ['ライトボウガン'],
  特殊射撃強化: RANGED,
  毒ビン追加: ['弓'],
  麻痺ビン追加: ['弓'],
  睡眠ビン追加: ['弓'],
  爆破ビン追加: ['弓'],
  減気ビン追加: ['弓'],
}

export const skillAppliesTo = (skill: string, weapon: Weapon) =>
  SKILL_WEAPONS[skill]?.includes(weapon) ?? true

/** その武器で、装飾品のすべてのスキルが効果を持つか */
export const decorationUsableBy = (d: Decoration, weapon: Weapon) =>
  d.skills.every((s) => skillAppliesTo(s.name, weapon))

/**
 * 装飾品の「武器の限定度」。含むスキルのうち、効果のある武器が最も少ないものの武器数。
 * 小さいほどその武器専用に近い（例: 鼓笛珠=1、守勢珠=6、匠珠=11、攻撃珠=14）
 */
export const weaponSpecificity = (d: Decoration) =>
  Math.min(...d.skills.map((s) => SKILL_WEAPONS[s.name]?.length ?? WEAPONS.length))
