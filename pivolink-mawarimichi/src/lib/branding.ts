/**
 * 見た目と語り口の差し替え層。
 *
 * ★「京都モデル専用アプリ」から出るための層。
 *   見出し・タグライン・ナビゲーターの名前と台詞・画像・朱印の文字は、
 *   もともと i18n.tsx に直書きされていて、別の街や別のキャラクターで動かせなかった。
 *   ここでキャンペーンの設定を上書きとして重ね、空なら既定にフォールバックする。
 *
 * ★UIの文言すべてをDBに出すわけではない。
 *   ボタンや単位のような「動きが変わらない語」はコード側に置いたままにする。
 *   出すのは「その街・そのキャラクターで書き換わるもの」だけ。
 *   全部を編集可能にすると、翻訳の抜けが即バグになる。
 */

import { ui, type UiStrings } from "./i18n";
import { tx, type Campaign, type I18nText, type Lang } from "./types";

/** 既定の素材。キャンペーン側で上書きできる */
const DEFAULT_FACE = "/navi/ruru-face.webp";
const DEFAULT_STANDING = "/navi/ruru-standing.webp";
const DEFAULT_SEAL = "巡";
const DEFAULT_OG = "/og.png";

export interface Branding {
  /** スタート画面の見出し。改行は \n */
  title: string;
  tagline: string;
  /** スタート画面の印に入れる文字（1〜2字）。空なら印を出さない */
  seal: string;
  navigatorName: string;
  /** 初対面のあいさつ */
  intro: string;
  /** 到着時のねぎらい */
  outro: string;
  /** キャラクターについての注記 */
  note: string;
  faceUrl: string;
  standingUrl: string;
  /** SNSに貼ったときの画像。既定は /og.png */
  ogImageUrl: string;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** JSONBから多言語テキストを取り出す。空文字は「未設定」として扱う */
function pick(source: unknown, key: string, lang: Lang): string {
  if (!isRecord(source)) return "";
  const v = source[key];
  if (typeof v === "string") return v.trim();
  if (isRecord(v)) return tx(v as I18nText, lang).trim();
  return "";
}

function pickUrl(source: unknown, key: string): string {
  if (!isRecord(source)) return "";
  const v = source[key];
  if (typeof v !== "string") return "";
  const s = v.trim();
  // ★自サイトの相対パスか https のみ。javascript: 等を弾く
  return /^\/[^/]/.test(s) || /^https:\/\//.test(s) ? s : "";
}

/**
 * キャンペーンの設定を既定文言に重ねる。
 * 空欄はすべて既定に落ちるので、部分的な上書きができる。
 */
export function branding(campaign: Campaign | null, lang: Lang): Branding {
  const t: UiStrings = ui(lang);
  const hero = campaign?.hero;
  const navi = campaign?.navigator;

  return {
    title: pick(hero, "title", lang) || t.startTitle,
    tagline: pick(hero, "tagline", lang) || t.startTag,
    seal: pick(hero, "seal", lang) || DEFAULT_SEAL,
    navigatorName: pick(navi, "name", lang) || t.naviName,
    intro: pick(navi, "intro", lang) || t.naviIntro,
    outro: pick(navi, "outro", lang) || t.naviGoal,
    note: pick(navi, "note", lang) || t.naviNote,
    faceUrl: pickUrl(navi, "face_url") || DEFAULT_FACE,
    standingUrl: pickUrl(navi, "standing_url") || DEFAULT_STANDING,
    ogImageUrl: pickUrl(hero, "og_image_url") || DEFAULT_OG,
  };
}

/** 管理フォームの初期値。未設定は空欄にして「既定を使う」と分かるようにする */
export function brandingFormValues(campaign: Campaign) {
  const h = campaign.hero;
  const n = campaign.navigator;
  const raw = (src: unknown, key: string, l: "ja" | "en") => {
    if (!isRecord(src)) return "";
    const v = src[key];
    if (typeof v === "string") return l === "ja" ? v : "";
    if (isRecord(v)) return typeof v[l] === "string" ? (v[l] as string) : "";
    return "";
  };
  return {
    hero_title_ja: raw(h, "title", "ja"),
    hero_title_en: raw(h, "title", "en"),
    hero_tagline_ja: raw(h, "tagline", "ja"),
    hero_tagline_en: raw(h, "tagline", "en"),
    hero_seal: raw(h, "seal", "ja"),
    hero_og_image_url: pickUrl(h, "og_image_url"),
    navi_name_ja: raw(n, "name", "ja"),
    navi_name_en: raw(n, "name", "en"),
    navi_intro_ja: raw(n, "intro", "ja"),
    navi_intro_en: raw(n, "intro", "en"),
    navi_outro_ja: raw(n, "outro", "ja"),
    navi_outro_en: raw(n, "outro", "en"),
    navi_note_ja: raw(n, "note", "ja"),
    navi_note_en: raw(n, "note", "en"),
    navi_face_url: pickUrl(n, "face_url"),
    navi_standing_url: pickUrl(n, "standing_url"),
  };
}

/** 既定値。管理画面に「いま何が出ているか」を示すために使う */
export const BRANDING_DEFAULTS = {
  face: DEFAULT_FACE,
  standing: DEFAULT_STANDING,
  seal: DEFAULT_SEAL,
  og: DEFAULT_OG,
};
