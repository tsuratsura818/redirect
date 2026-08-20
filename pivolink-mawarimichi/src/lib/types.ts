/** ドメイン型。0001_init.sql のテーブル定義と1対1で対応させる */

import type { OpenHours } from "./hours";
import type { MealBand } from "./meal";

export type Lang = "ja" | "en" | "zh" | "ko";
export const SUPPORTED_LANGS: Lang[] = ["ja", "en", "zh", "ko"];
/** Phase 1 で実際に出す言語 */
export const PHASE1_LANGS: Lang[] = ["ja", "en"];

/** 多言語テキスト。キーが無い言語は ja にフォールバックする */
export type I18nText = Partial<Record<Lang, string>>;

export type CampaignStatus = "draft" | "active" | "paused" | "ended";
export type RuleType = "random" | "time" | "congestion" | "context";

export interface Campaign {
  id: string;
  slug: string;
  name: I18nText;
  status: CampaignStatus;
  start_qr_token: string;
  start_lat: number;
  start_lng: number;
  /** START地点の表示名（サイネージ設置場所） */
  start_label?: I18nText;
  stamp_target: number;
  detour_tolerance_m: number;
  languages: Lang[];
  cm_frequency_cap: number;
  /**
   * 開催期間（ISO文字列）。★実際の切り替えは PivoLink の schedule / scheduled_switch が行う。
   * ここは管理画面が持つ記録で、保存時に PivoLink 側のルールも作り直す。
   */
  starts_at?: string | null;
  ends_at?: string | null;
  /**
   * 見出し・タグライン・朱印の文字。null ならコード側の既定にフォールバックする。
   * ★別の街で動かすための差し替え口（lib/branding.ts）。
   */
  hero?: Record<string, unknown> | null;
  /** ナビゲーターの名前・台詞・画像URL。null なら既定 */
  navigator?: Record<string, unknown> | null;
}

export interface Goal {
  id: string;
  campaign_id: string;
  slug: string;
  name: I18nText;
  subtitle?: I18nText;
  lat: number;
  lng: number;
  icon_char?: string;
  /** 目的地の拝観時間。終了後は目的地選択の時点で参加者に知らせる */
  open_hours?: OpenHours | null;
  /** 表示用グラデーション（UIトーン。DBでは icon_char 同様の表示メタとして持つ） */
  grad?: [string, string];
  sort_order: number;
  active: boolean;
}

/** レアスタンプ判定条件。判定は必ずサーバー側で行う */
export interface RareConfig {
  /** 基本確率 0..1 */
  prob: number;
  /** [開始時, 終了時) の時間帯に限定（JST） */
  time_window?: [number, number];
  /** 時間帯内での確率（未指定なら prob） */
  prob_in_window?: number;
  label?: I18nText;
}

export interface Spot {
  id: string;
  campaign_id: string;
  slug: string;
  qr_token: string;
  name: I18nText;
  area?: I18nText | null;
  story?: I18nText | null;
  navi_lines?: I18nText | null;
  lat: number;
  lng: number;
  walk_min?: number | null;
  kanji?: string | null;
  grad?: [string, string];
  capacity_weight: number;
  /** 0=空き◎ 1=空き○ 2=混雑 */
  congestion_level: number;
  is_collab: boolean;
  /**
   * 飲食スポットの「食べどき」。空配列＝飲食店ではない（寺社・記念館など）。
   * 時刻→帯の対応は routing_rules 側にあり、ここには帯の名前だけを持つ。
   */
  meal_times?: MealBand[] | null;
  /** 拝観・営業時間。null は終日開いている（屋外の社・通りなど） */
  open_hours?: OpenHours | null;
  coupon?: I18nText | null;
  /** スポットの写真。空なら色面＋漢字のプレースホルダで成立する（現地撮影が入るまでの状態） */
  image_url?: string | null;
  /** 外部デジタルマップ（MapPenguin 等）でこの1地点を開くURL。空なら Google/Apple マップ */
  map_url?: string | null;
  rare_config?: RareConfig | null;
  active: boolean;
}

export interface RoutingRule {
  id: string;
  campaign_id: string;
  rule_type: RuleType;
  config: Record<string, unknown>;
  priority: number;
  active: boolean;
}

export interface Session {
  id: string;
  campaign_id: string;
  goal_id: string | null;
  lang: Lang;
  walked_m: number;
  direct_m: number | null;
  completed_at: string | null;
  created_at: string;
}

export interface Scan {
  id: string;
  session_id: string;
  spot_id: string;
  scanned_at: string;
  is_rare: boolean;
  /** 提示した二択（spot slug 配列）。提示無視率の計測に使う */
  choice_shown: string[] | null;
  nav_clicked: boolean;
}

export interface Coupon {
  id: string;
  session_id: string;
  code: string;
  issued_at: string;
  used_at: string | null;
  used_shop: string | null;
}

/** 多言語テキストの取り出し。ja → en → 最初に見つかったもの の順にフォールバック */
export function tx(text: I18nText | undefined | null, lang: Lang): string {
  if (!text) return "";
  return text[lang] ?? text.ja ?? text.en ?? Object.values(text)[0] ?? "";
}
