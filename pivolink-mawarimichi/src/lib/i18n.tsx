/**
 * 参加者UIの文言。モックアップ（mockup/pivolink-kyoto-spot-mockup.html）の UI オブジェクトが正。
 * Phase 1 は ja/en。zh/ko は Phase 2（キーを足すだけで増やせる形にしてある）。
 */

import { fmtM, walkMinutes } from "./geo";
import type { Lang } from "./types";

export interface UiStrings {
  brandSub: string;
  demoBand: string;
  startTitle: string;
  startTag: string;
  naviIntro: string;
  goalLabel: string;
  freeInput: string;
  goalBarT: string;
  /** 目的地名を強調表示するため ReactNode を返す */
  goalBarD: (goal: React.ReactNode, m: number) => React.ReactNode;
  goalBarM: (m: number) => string;
  routingT: string;
  routing: (quiet: number) => string;
  choiceT: string;
  walk: string;
  min: string;
  cong: [string, string, string];
  detour: (n: number, total: number) => string;
  stampBtn: string;
  stampGet: string;
  rareGet: string;
  alreadyStamped: string;
  bookT: string;
  bookSub: (n: number, total: number) => string;
  routeT: string;
  back: string;
  toGoal: (goal: string) => string;
  arriveL: string;
  arriveT: string;
  arriveP: (goal: string) => string;
  stWalked: string;
  stDirect: string;
  stRate: string;
  statsNote: (walked: number, direct: number) => string;
  couponT: string;
  couponP: string;
  again: string;
  naviGoal: string;
  photoNote: string;
  photoImage: string;
  navBtn: string;
  navGoalBtn: string;
  bookLink: string;
  collabT: string;
  naviNote: string;
  naviName: string;
  startOver: string;
  spotNeedsGoal: string;
  mapWalked: string;
  mapShortest: string;
  mapStart: string;
}

const ja: UiStrings = {
  brandSub: "MAWARIMICHI KYOTO / PIVOLINK",
  demoBand: "DEMO — 検証用。進行状況はこの端末にのみ保存されます",
  startTitle: "目的地は、あなたが決める。\n道のりは、京都が決める。",
  startTag:
    "行きたい場所には、ちゃんと着きます。ただし最短ルートでは行きません。5つの寄り道の果てに、目的地へ。",
  naviIntro:
    "はじめまして、案内役のルルです！ まずは、最後に行きたい場所を教えてくださいな。そこまでの道は、わたしにおまかせ。まっすぐは行きませんけど、ぜったい後悔はさせませんよ〜",
  goalLabel: "最後に行きたい場所は？",
  freeInput: "自由入力（Phase 2で地図検索に対応予定）",
  goalBarT: "DESTINATION",
  goalBarD: (goal, m) => (
    <>
      <b>{goal}</b>まで あと {fmtM(m)}
    </>
  ),
  goalBarM: (m) => `まっすぐ行けば徒歩${walkMinutes(m)}分。でも今日は、まわりみち。`,
  routingT: "ROUTING — 目的地への回廊から選びました",
  routing: (quiet) =>
    `目的地の方向へ少しずつ近づきながら、いま空いている${quiet}件を含む二択をご案内します。`,
  choiceT: "ルルが選んだ、次の寄り道",
  walk: "徒歩",
  min: "分",
  cong: ["空き ◎", "空き ○", "やや混雑"],
  detour: (n, total) => `DETOUR ${String(n).padStart(2, "0")} / ${String(total).padStart(2, "0")}`,
  stampBtn: "この場所のスタンプを押す",
  stampGet: "スタンプを獲得しました！",
  rareGet: "★ レアスタンプ獲得！",
  alreadyStamped: "このスタンプは獲得済みです",
  bookT: "スタンプ帳",
  bookSub: (n, total) => `${n} / ${total} 個 — 今日のあなたの道のり`,
  routeT: "YOUR ROUTE — 今日の寄り道",
  back: "戻る",
  toGoal: (goal) => `目的地 ${goal} へ向かう →`,
  arriveL: "ARRIVED",
  arriveT: "たどり着きました。",
  arriveP: (goal) =>
    `${goal}に、5つの物語を連れて到着。この道のりは、世界であなただけのものです。`,
  stWalked: "歩いた道のり",
  stDirect: "最短ルート",
  stRate: "まわりみち率",
  statsNote: (walked, direct) =>
    `最短${fmtM(direct)}のところを、あなたは${fmtM(walked)}かけて、5つの物語と出会いながら着きました。`,
  couponT: "参加店舗共通クーポン",
  couponP: "東山エリアの参加飲食店・店舗でご提示ください（デモ表記）",
  again: "もう一度巡る — 同じ目的地でも、別の道",
  naviGoal:
    "おつかれさまでした！ ええまわりみちでしたやろ？ 今日の道は、今日だけのもの。またお越しやす。同じ行き先でも、ぜんぜん違う道をご用意しときますからね〜",
  photoNote: "PHOTO PLACEHOLDER — 実装時に現地写真",
  photoImage: "イメージ（AI生成）— 現地写真に差し替え予定",
  navBtn: "ここまでの道順（徒歩）",
  navGoalBtn: "目的地までの道順（徒歩）",
  bookLink: "スタンプ帳",
  collabT: "COLLAB SPOT — 飲食店コラボ",
  naviNote: "※ナビゲーター「ルル」— キャラクターコラボ枠。実運用では権利者の許諾のもとで使用します",
  naviName: "案内役・ルル",
  startOver: "最初から巡りなおす",
  spotNeedsGoal: "ようこそ。まずは最後に行きたい場所を選んでな。ここが最初の寄り道になるで〜",
  mapWalked: "歩いた道のり",
  mapShortest: "最短ルート（歩かなかった道）",
  mapStart: "スタート",
};

const en: UiStrings = {
  brandSub: "MAWARIMICHI KYOTO / PIVOLINK",
  demoBand: "DEMO — test build. Progress is stored on this device only.",
  startTitle: "You choose the destination.\nKyoto chooses the way.",
  startTag:
    "You will reach the place you want — just not by the shortest path. Five detours, then your destination.",
  naviIntro:
    "Hi! I'm Ruru, your guide. First, tell me where you want to end up — then leave the road to me. It won't be straight, but you won't regret it!",
  goalLabel: "Where do you want to end up?",
  freeInput: "Free input (map search comes in Phase 2)",
  goalBarT: "DESTINATION",
  goalBarD: (goal, m) => (
    <>
      {fmtM(m)} to <b>{goal}</b>
    </>
  ),
  goalBarM: (m) => `${walkMinutes(m)} min if you walked straight. But today, we wander.`,
  routingT: "ROUTING — picked from the corridor to your goal",
  routing: (quiet) => `Edging toward your destination — two options including ${quiet} uncrowded pick(s).`,
  choiceT: "Ruru's picks for your next detour",
  walk: "walk",
  min: "min",
  cong: ["Quiet", "Calm", "Busy-ish"],
  detour: (n, total) => `DETOUR ${String(n).padStart(2, "0")} / ${String(total).padStart(2, "0")}`,
  stampBtn: "Collect the stamp for this spot",
  stampGet: "Stamp collected!",
  rareGet: "★ Rare stamp!",
  alreadyStamped: "You already have this stamp",
  bookT: "Stamp Book",
  bookSub: (n, total) => `${n} / ${total} — your road today`,
  routeT: "YOUR ROUTE — today's detours",
  back: "Back",
  toGoal: (goal) => `Head to ${goal} →`,
  arriveL: "ARRIVED",
  arriveT: "You made it.",
  arriveP: (goal) => `You arrived at ${goal} carrying five stories. This road belongs to you alone.`,
  stWalked: "You walked",
  stDirect: "Shortest",
  stRate: "Detour rate",
  statsNote: (walked, direct) =>
    `The straight line was ${fmtM(direct)}. You took ${fmtM(walked)} — and met five stories on the way.`,
  couponT: "Partner Shops Coupon",
  couponP: "Show at partner shops in the Higashiyama area (demo)",
  again: "Walk again — same destination, different road",
  naviGoal:
    "Well done! A good mawarimichi, wasn't it? Today's road exists only today. Come back — same destination, a completely different way!",
  photoNote: "PHOTO PLACEHOLDER",
  photoImage: "Image (AI-generated) — to be replaced with on-site photos",
  navBtn: "Walking directions",
  navGoalBtn: "Walking directions to your destination",
  bookLink: "Stamps",
  collabT: "COLLAB SPOT",
  naviNote: "Navigator \"Ruru\" — character collaboration. Used with the rights holder's permission in production.",
  naviName: "Ruru, your guide",
  startOver: "Start over",
  spotNeedsGoal: "Welcome! Pick where you want to end up — this spot becomes your first detour.",
  mapWalked: "Your road",
  mapShortest: "Shortest (not taken)",
  mapStart: "Start",
};

const DICT: Record<string, UiStrings> = { ja, en };

export function ui(lang: Lang): UiStrings {
  return DICT[lang] ?? ja;
}
