/**
 * 京都・東山モデルのシードデータ。
 *
 * ★ここに載っている実在スポット名・d食堂のコラボ特典は「許諾未取得の仮データ」。
 *   対外公開・本番データ投入の前に、必ず許諾取得 or 差し替えを行うこと（README.md 参照）。
 * ★ナビゲーターは「ルル」（キャラクターコラボ枠）。使用は権利者の許諾が前提。
 *   navi_lines は京ことばの語り口で統一している。キャラを差し替えるならここも書き換える。
 *
 * 内容は mockup/pivolink-kyoto-spot-mockup.html のデータをそのまま移植している。
 * 開発用の qr_token は `dev-` 接頭辞で固定（本番は 128bit 乱数がDB既定値で入る）。
 *
 * ★image_url の写真は「場所を特定できないAI生成のイメージ」。現地撮影が入るまでの仮素材で、
 *   画面上に「イメージ」と明記される。実在スポットの写真ではない。
 * ★open_hours（拝観・営業時間）も仮。一般に知られている時間を置いているだけで、
 *   季節変動・臨時休業・最終受付は反映していない。実証実験の前に現地確認が必須。
 *   ここがズレると「開いている前提で送ったら閉まっていた」という、最短ルートより悪い体験になる。
 */

import type { Campaign, Goal, RoutingRule, Spot } from "@/lib/types";

export const CAMPAIGN_ID = "11111111-1111-4111-8111-111111111111";

export const seedCampaign: Campaign = {
  id: CAMPAIGN_ID,
  slug: "kyoto-higashiyama",
  name: {
    ja: "まわりみち 京都・東山",
    en: "Mawarimichi Kyoto — Higashiyama",
  },
  status: "active",
  start_qr_token: "dev-start-kyoto",
  start_lat: 34.9858,
  start_lng: 135.7588,
  start_label: {
    ja: "京都駅ビル 観光案内所",
    en: "Kyoto Station Tourist Info",
  },
  stamp_target: 5,
  detour_tolerance_m: 220,
  languages: ["ja", "en"],
  cm_frequency_cap: 3,
};

export const seedGoals: Goal[] = [
  {
    id: "22222222-2222-4222-8222-000000000001",
    campaign_id: CAMPAIGN_ID,
    slug: "kiyomizu",
    name: { ja: "清水寺", en: "Kiyomizu-dera" },
    subtitle: {
      ja: "定番へ、定番じゃない道から",
      en: "The classic — by an unclassic road",
    },
    lat: 34.9949,
    lng: 135.785,
    open_hours: { from: 6, to: 18 },
    icon_char: "清",
    grad: ["#7A3E2E", "#C8553D"],
    sort_order: 1,
    active: true,
  },
  {
    id: "22222222-2222-4222-8222-000000000002",
    campaign_id: CAMPAIGN_ID,
    slug: "yasaka",
    name: { ja: "八坂神社", en: "Yasaka Shrine" },
    subtitle: { ja: "祇園の入口へ、路地伝いに", en: "Into Gion, lane by lane" },
    lat: 35.0037,
    lng: 135.7787,
    open_hours: null,
    icon_char: "八",
    grad: ["#8E3A4E", "#C8553D"],
    sort_order: 2,
    active: true,
  },
  {
    id: "22222222-2222-4222-8222-000000000003",
    campaign_id: CAMPAIGN_ID,
    slug: "nishiki",
    name: { ja: "錦市場", en: "Nishiki Market" },
    subtitle: {
      ja: "京の台所へ、寄り道しながら",
      en: "To Kyoto's kitchen, the long way",
    },
    lat: 35.005,
    lng: 135.7649,
    open_hours: { from: 9, to: 18 },
    icon_char: "錦",
    grad: ["#3A5E4A", "#7BA05B"],
    sort_order: 3,
    active: true,
  },
];

export const seedSpots: Spot[] = [
  {
    id: "33333333-3333-4333-8333-000000000001",
    campaign_id: CAMPAIGN_ID,
    slug: "rokuhara",
    qr_token: "dev-rokuhara",
    image_url: "/spots/rokuhara.webp",
    name: { ja: "六波羅蜜寺", en: "Rokuharamitsu-ji" },
    area: {
      ja: "東山・清水寺から徒歩10分",
      en: "Higashiyama — 10 min from Kiyomizu-dera",
    },
    story: {
      ja: "口から六体の阿弥陀仏が現れる「空也上人立像」で知られる古刹。行列のできる清水寺のすぐそばにありながら、境内は驚くほど静かです。951年、疫病の都を念仏とともに歩いた空也上人。その祈りの原点が、いまもここにあります。",
      en: "Home to the famous statue of Kuya, six tiny Buddhas emerging from his lips. Just steps from crowded Kiyomizu-dera, yet remarkably quiet — the origin of a prayer that walked plague-era Kyoto in 951.",
    },
    navi_lines: {
      ja: "清水寺の行列を横目に、こっちは静かなもんやで。空也さんの口から仏さまが出てるの、ほんまにびっくりするから見ときや〜",
      en: "While everyone queues at Kiyomizu, this place is all yours. Wait till you see the Buddhas coming out of Kuya's mouth!",
    },
    lat: 34.997,
    lng: 135.7721,
    walk_min: 8,
    kanji: "空",
    grad: ["#7A3E2E", "#C8553D"],
    capacity_weight: 1.0,
    congestion_level: 1,
    open_hours: { from: 8, to: 17 },
    is_collab: false,
    rare_config: { prob: 0.2 },
    active: true,
  },
  {
    id: "33333333-3333-4333-8333-000000000002",
    campaign_id: CAMPAIGN_ID,
    slug: "rokudo",
    qr_token: "dev-rokudo",
    image_url: "/spots/rokudo.webp",
    name: { ja: "六道珍皇寺", en: "Rokudo Chinno-ji" },
    area: { ja: "東山・六道の辻", en: "Higashiyama — Rokudo Crossing" },
    story: {
      ja: "ここは「六道の辻」— あの世とこの世の境目と言い伝えられてきた場所。平安の官僚・小野篁が夜ごと冥界へ通ったという井戸が、いまも本堂の奥に残ります。京都で最も物語の濃い、知る人ぞ知る一角です。",
      en: "The legendary border between this world and the next. A well behind the main hall is said to have carried the Heian official Ono no Takamura to the underworld each night. One of Kyoto's most story-rich hidden corners.",
    },
    navi_lines: {
      ja: "ここ、あの世への入口って言われてるんやで…。井戸を覗くときは、そーっとな。帰りは一緒に帰ろな？",
      en: "They say this is the gateway to the other world... Peek into the well gently, okay? And let's go home together!",
    },
    lat: 34.9979,
    lng: 135.7748,
    walk_min: 6,
    kanji: "冥",
    grad: ["#2A2620", "#4A3B5E"],
    capacity_weight: 1.0,
    congestion_level: 1,
    open_hours: { from: 9, to: 16 },
    is_collab: false,
    rare_config: { prob: 0.2 },
    active: true,
  },
  {
    id: "33333333-3333-4333-8333-000000000003",
    campaign_id: CAMPAIGN_ID,
    slug: "kenninji",
    qr_token: "dev-kenninji",
    image_url: "/spots/kenninji.webp",
    name: { ja: "建仁寺", en: "Kennin-ji" },
    area: { ja: "祇園・花見小路の南端", en: "Gion — south end of Hanamikoji" },
    story: {
      ja: "1202年創建、京都最古の禅寺。俵屋宗達の「風神雷神図」、天井いっぱいの「双龍図」。観光客であふれる花見小路を数分歩いただけで、これほどの静寂と美術に出会えることは、あまり知られていません。",
      en: "Kyoto's oldest Zen temple (1202), holding the iconic Wind and Thunder Gods screen and the ceiling-filling Twin Dragons. Minutes from packed Hanamikoji, yet astonishingly serene.",
    },
    navi_lines: {
      ja: "花見小路の人混みを抜けたら、急に静かになるやろ？ 天井の双龍、首が痛くなるまで見上げてしまうで〜",
      en: "Feel how the noise of Hanamikoji just disappears? The twin dragons on the ceiling will keep your head tilted for a while!",
    },
    lat: 35.0006,
    lng: 135.7735,
    walk_min: 10,
    kanji: "禅",
    grad: ["#3D4A3A", "#6B7D5A"],
    capacity_weight: 1.0,
    congestion_level: 2,
    open_hours: { from: 10, to: 17 },
    is_collab: false,
    rare_config: { prob: 0.2 },
    active: true,
  },
  {
    id: "33333333-3333-4333-8333-000000000004",
    campaign_id: CAMPAIGN_ID,
    slug: "shoseien",
    qr_token: "dev-shoseien",
    image_url: "/spots/shoseien.webp",
    name: { ja: "渉成園", en: "Shosei-en Garden" },
    area: { ja: "京都駅から徒歩10分", en: "10 min walk from Kyoto Station" },
    story: {
      ja: "東本願寺の飛地境内にある池泉回遊式庭園。京都駅からわずか徒歩10分に、四季の花と水鏡の広がる名庭があることを、多くの旅行者は知りません。朝の光の時間帯は、ほとんど貸切です。",
      en: "A strolling pond garden of Higashi Hongan-ji, just 10 minutes from Kyoto Station — and somehow still a secret. In the morning light, you may have it almost to yourself.",
    },
    navi_lines: {
      ja: "京都駅のすぐ近くにこんな庭があるって、みんな知らんのよ。朝イチは水面がぴかぴかの鏡やで〜",
      en: "Nobody expects a garden like this so close to the station. In early morning the pond turns into a perfect mirror!",
    },
    lat: 34.991,
    lng: 135.7622,
    walk_min: 12,
    kanji: "庭",
    grad: ["#2E5E4E", "#7BA05B"],
    capacity_weight: 1.0,
    congestion_level: 0,
    open_hours: { from: 9, to: 17 },
    is_collab: false,
    rare_config: {
      // ★開園9:00なので窓もそこから。open_hours を入れる前は 6〜10 だったが、
      //   開いていない時間にしか取れないレアスタンプになっていた
      prob: 0.2,
      time_window: [9, 11],
      prob_in_window: 0.4,
      label: {
        ja: "朝の水鏡（時間帯限定スタンプ）",
        en: "Morning Mirror (time-limited stamp)",
      },
    },
    active: true,
  },
  {
    id: "33333333-3333-4333-8333-000000000005",
    campaign_id: CAMPAIGN_ID,
    slug: "yasui",
    qr_token: "dev-yasui",
    image_url: "/spots/yasui.webp",
    name: { ja: "安井金比羅宮", en: "Yasui Konpira-gu" },
    area: { ja: "東山・祇園の南", en: "Higashiyama — south of Gion" },
    story: {
      ja: "「悪縁を切り、良縁を結ぶ」— お札に覆われた縁切り縁結び碑をくぐる、京都でも他に類のない参拝体験。切りたい縁と結びたい縁をひとつずつ胸に、碑の穴をくぐってみてください。",
      en: "Crawl through the paper-covered stone to cut bad ties and bind good ones — a ritual found nowhere else. Bring one bond to break and one to make.",
    },
    navi_lines: {
      ja: "碑をくぐるときは、切りたい縁と結びたい縁をひとつずつ、はっきり思い浮かべるんやで。よくばりは禁物！",
      en: "When you crawl through, picture one tie to cut and one to bind — clearly! No being greedy!",
    },
    lat: 35.0009,
    lng: 135.777,
    walk_min: 7,
    kanji: "縁",
    grad: ["#6E2E3E", "#B85C7A"],
    capacity_weight: 1.0,
    congestion_level: 2,
    open_hours: null,
    is_collab: false,
    rare_config: { prob: 0.2 },
    active: true,
  },
  {
    id: "33333333-3333-4333-8333-000000000006",
    campaign_id: CAMPAIGN_ID,
    slug: "kawai",
    qr_token: "dev-kawai",
    image_url: "/spots/kawai.webp",
    name: { ja: "河井寬次郎記念館", en: "Kawai Kanjiro's House" },
    area: { ja: "東山・五条坂", en: "Higashiyama — Gojozaka" },
    story: {
      ja: "民藝運動を代表する陶工・河井寬次郎が自ら設計した自宅兼工房。裏手には巨大な登り窯が当時のまま残ります。「暮らしが仕事 仕事が暮らし」— 静かな町家の中に、作り手の哲学が息づいています。",
      en: "The self-designed home and studio of Mingei potter Kawai Kanjiro, with his massive climbing kiln preserved out back. 'Life is work, work is life' — his philosophy still breathes in this quiet townhouse.",
    },
    navi_lines: {
      ja: "ここの登り窯、ほんまに大きいんやで。椅子も棚も全部、河井さんの手づくり。座ってええ椅子もあるから探してみ〜",
      en: "The climbing kiln here is huge! Every chair and shelf was made by Kanjiro himself — some you can even sit on. Find them!",
    },
    lat: 34.9928,
    lng: 135.7754,
    walk_min: 9,
    kanji: "陶",
    grad: ["#5A4632", "#A67B4B"],
    capacity_weight: 1.0,
    congestion_level: 0,
    open_hours: { from: 10, to: 17 },
    is_collab: false,
    rare_config: { prob: 0.2 },
    active: true,
  },
  {
    id: "33333333-3333-4333-8333-000000000007",
    campaign_id: CAMPAIGN_ID,
    slug: "bukkoji",
    qr_token: "dev-bukkoji",
    image_url: "/spots/bukkoji.webp",
    name: { ja: "佛光寺と、d食堂", en: "Bukko-ji & d shokudo" },
    area: { ja: "四条烏丸から徒歩5分", en: "5 min from Shijo-Karasuma" },
    story: {
      ja: "町なかの静かな古刹・佛光寺。その境内には、京都の定番を丁寧に出す食堂とデザインストアが息づいています。お寺の境内でいただくおやつと定食 — 京都の「いま」と「むかし」が同じ敷地にある、めずらしい場所です。",
      en: "A quiet urban temple whose grounds host a design store and a beloved set-meal shokudo. Sweets and lunch inside temple grounds — old and new Kyoto sharing one courtyard.",
    },
    navi_lines: {
      ja: "お寺の中にごはん屋さんがあるんやで！ スタンプ画面を見せたら、デモ特典で甘味がちょっとおトクになるらしいで〜",
      en: "There's a shokudo inside the temple grounds! Show your stamp screen for a little demo treat discount!",
    },
    lat: 35.0017,
    lng: 135.7627,
    walk_min: 11,
    kanji: "縁",
    grad: ["#3A3E5E", "#5E6E9E"],
    capacity_weight: 1.0,
    congestion_level: 1,
    open_hours: { from: 9, to: 18 },
    meal_times: ["lunch", "snack"],
    is_collab: true,
    coupon: {
      ja: "コラボ特典：スタンプ画面提示で境内の甘味 50円引（デモ表記）",
      en: "Collab perk: show stamps for ¥50 off sweets (demo)",
    },
    rare_config: { prob: 0.2 },
    active: true,
  },
  {
    id: "33333333-3333-4333-8333-000000000008",
    campaign_id: CAMPAIGN_ID,
    slug: "ichihime",
    qr_token: "dev-ichihime",
    image_url: "/spots/ichihime.webp",
    name: { ja: "市比賣神社", en: "Ichihime Shrine" },
    area: { ja: "河原町五条の路地の奥", en: "Down a lane off Kawaramachi-Gojo" },
    story: {
      ja: "女性の守り神として1200年、市場の神として都の商いを見守ってきた小さなお社。ビルの谷間の路地の奥という立地ゆえ、地図を持っていても通り過ぎてしまう — まさに「連れてきてもらわないと出会えない」場所です。",
      en: "A tiny shrine guarding women and the city's markets for 1,200 years, tucked so deep in a lane between buildings that even map-holders walk past. Exactly the kind of place you must be led to.",
    },
    navi_lines: {
      ja: "ここ、自分ではぜったい見つけられへん場所やろ？ こういう出会いのために、わたしがおるんやで〜",
      en: "You'd never find this on your own, right? This is exactly why you've got me!",
    },
    lat: 34.9932,
    lng: 135.7669,
    walk_min: 8,
    kanji: "姫",
    grad: ["#8E3A4E", "#D98A9E"],
    capacity_weight: 1.0,
    congestion_level: 0,
    open_hours: { from: 9, to: 17 },
    is_collab: false,
    rare_config: { prob: 0.2 },
    active: true,
  },

  /* ================= 飲食スポット =================
   * ★ここから下の5件は「実在しない架空の店」。
   *   寺社（上の8件）は実在名を許諾未取得で仮置きしているが、飲食店は事情が違う。
   *   実在の個人店の名前に、こちらが勝手に作った割引特典を紐づけて公開すると
   *   信用問題になる。だから店だけは最初から架空にしてある。
   *   実証実験で参加店が決まったら、管理画面から名前・座標・特典を差し替える。
   * ★meal_times が「食べどき」。時刻→帯の対応は routing_rules 側（下の meal ルール）。
   *   店は寺社と違って開いている時間があるので、帯の外では重みを大きく下げる。
   * ★capacity_weight は docs/capacity-guide.md の基準に従い、
   *   個人店（1時間に2〜3人）= 0.6〜1.0 に置いている。
   */
  {
    id: "33333333-3333-4333-8333-000000000009",
    campaign_id: CAMPAIGN_ID,
    slug: "asagiri",
    qr_token: "dev-asagiri",
    image_url: "/spots/asagiri.webp",
    name: { ja: "喫茶 朝霧", en: "Kissa Asagiri" },
    area: { ja: "京都駅と五条のあいだ", en: "Between Kyoto Station and Gojo" },
    story: {
      ja: "朝7時から灯りがつく、カウンターだけの喫茶店。厚切りトーストと、ネルドリップの深煎り。観光地に向かう前の、まだ人の少ない京都の空気ごと味わう一杯です。午後は自家製プリンめあての常連で静かに埋まります。",
      en: "A counter-only coffee shop that opens at 7am. Thick-cut toast and deep-roast flannel-drip coffee — the taste of Kyoto before the crowds arrive. In the afternoon, regulars come for the house-made pudding.",
    },
    navi_lines: {
      ja: "朝いちばんに行くならここやで。観光地が動き出す前のこの時間が、いちばん京都らしいと思うんよ〜",
      en: "If you're out early, start here. Kyoto before the sightseeing starts is the most Kyoto it ever gets.",
    },
    lat: 34.9905,
    lng: 135.764,
    walk_min: 7,
    kanji: "朝",
    grad: ["#4A3B30", "#A67B4B"],
    capacity_weight: 0.8,
    congestion_level: 0,
    open_hours: { from: 7, to: 18 },
    meal_times: ["morning", "snack"],
    is_collab: false,
    rare_config: { prob: 0.2, time_window: [7, 10], prob_in_window: 0.4 },
    active: true,
  },
  {
    id: "33333333-3333-4333-8333-000000000010",
    campaign_id: CAMPAIGN_ID,
    slug: "nanakamado",
    qr_token: "dev-nanakamado",
    image_url: "/spots/nanakamado.webp",
    name: { ja: "食堂 なゝかまど", en: "Nanakamado Shokudo" },
    area: { ja: "東山・松原通", en: "Higashiyama — Matsubara-dori" },
    story: {
      ja: "おばんざいを7品ほど並べ、その日の分がなくなったら閉める町の食堂。観光地価格ではない、京都の人が普段食べているごはんが出てきます。夜は同じ器で一杯やる人が増え、店の顔が少し変わります。",
      en: "A neighbourhood shokudo serving seven or so obanzai dishes, closing when the day's batch runs out. Not tourist pricing — just what Kyoto people actually eat. At night the same bowls come with a drink, and the room changes character.",
    },
    navi_lines: {
      ja: "お昼はここ。売り切れたら閉まってまうから、お腹すいてるなら先に寄っといたほうがええで〜",
      en: "Lunch stop! They close when the food runs out, so if you're hungry, come here first.",
    },
    lat: 34.9975,
    lng: 135.77,
    walk_min: 6,
    kanji: "膳",
    grad: ["#3D4A3A", "#8A9E6B"],
    capacity_weight: 1.0,
    congestion_level: 1,
    open_hours: { from: 11, to: 21 },
    meal_times: ["lunch", "dinner"],
    is_collab: true,
    coupon: {
      ja: "コラボ特典：スタンプ画面提示で小鉢ひとつサービス（デモ表記）",
      en: "Collab perk: show your stamps for a free side dish (demo)",
    },
    rare_config: { prob: 0.2 },
    active: true,
  },
  {
    id: "33333333-3333-4333-8333-000000000011",
    campaign_id: CAMPAIGN_ID,
    slug: "hitoyasumi",
    qr_token: "dev-hitoyasumi",
    image_url: "/spots/hitoyasumi.webp",
    name: { ja: "甘味 ひとやすみ", en: "Kanmi Hitoyasumi" },
    area: { ja: "清水道の途中、坂の左手", en: "Halfway up Kiyomizu-michi, on the left" },
    story: {
      ja: "清水寺へ登る坂の途中、縁台が2つだけ出ている甘味処。名物は炭火であぶるみたらし団子と、夏場の宇治金時。坂を登りきる前に一度座る、その「ひとやすみ」ごと名前になった店です。",
      en: "Two benches on the slope up to Kiyomizu-dera. Charcoal-grilled mitarashi dango, and Uji-kintoki shaved ice in summer. The shop is named after the pause itself — the rest you take before the last of the climb.",
    },
    navi_lines: {
      ja: "坂の途中で一回座るの、だいじやで。ここのお団子、炭火であぶってくれるから香りがちゃうんよ〜",
      en: "Sitting down halfway up matters. They grill the dango over charcoal — you'll smell it before you see it.",
    },
    lat: 34.9962,
    lng: 135.7812,
    walk_min: 5,
    kanji: "甘",
    grad: ["#7A3E2E", "#D9A05B"],
    capacity_weight: 0.6,
    congestion_level: 1,
    open_hours: { from: 10, to: 17 },
    meal_times: ["snack"],
    is_collab: true,
    coupon: {
      ja: "コラボ特典：スタンプ画面提示でお茶をサービス（デモ表記）",
      en: "Collab perk: show your stamps for a complimentary tea (demo)",
    },
    rare_config: { prob: 0.2 },
    active: true,
  },
  {
    id: "33333333-3333-4333-8333-000000000012",
    campaign_id: CAMPAIGN_ID,
    slug: "miyakoroji",
    qr_token: "dev-miyakoroji",
    image_url: "/spots/miyakoroji.webp",
    name: { ja: "居酒屋 みやこ路地", en: "Izakaya Miyako-roji" },
    area: { ja: "祇園の南、路地を2本入ったところ", en: "South Gion, two lanes in" },
    story: {
      ja: "表通りから路地を2本入った、赤提灯ひとつの店。京都の居酒屋らしく、出汁の効いた煮物と地の日本酒が並びます。日が落ちてから灯りがつくので、昼にここを通っても、店があることに気づきません。",
      en: "Two lanes back from the main street, marked by a single red lantern. Dashi-rich simmered dishes and local sake. The lantern only lights after dark — walk past at noon and you'd never know it was there.",
    },
    navi_lines: {
      ja: "ここは暗なってからやな。昼に通っても閉まってるから、夕方の道でめぐりあえたらラッキーやで〜",
      en: "This one's for after dark. Walk by at noon and it's shuttered — meeting it in the evening is luck.",
    },
    lat: 35.0022,
    lng: 135.7745,
    walk_min: 4,
    kanji: "灯",
    grad: ["#2A2620", "#8E4A3A"],
    capacity_weight: 0.7,
    congestion_level: 1,
    open_hours: { from: 17, to: 23 },
    meal_times: ["dinner"],
    is_collab: false,
    rare_config: { prob: 0.2, time_window: [17, 22], prob_in_window: 0.4 },
    active: true,
  },
  {
    id: "33333333-3333-4333-8333-000000000013",
    campaign_id: CAMPAIGN_ID,
    slug: "mizunowa",
    qr_token: "dev-mizunowa",
    image_url: "/spots/mizunowa.webp",
    name: { ja: "町家珈琲 みずのわ", en: "Machiya Coffee Mizunowa" },
    area: { ja: "錦市場の南、烏丸の町家", en: "A machiya south of Nishiki Market" },
    story: {
      ja: "築100年の町家をそのまま使った珈琲店。通り庭を抜けた奥に坪庭があり、そこに面した席が3つだけあります。朝はサンドイッチ、昼は日替わりのキッシュ、午後は珈琲と焼き菓子。一日中、いつ来ても居場所がある店です。",
      en: "A 100-year-old machiya turned coffee house. Past the through-garden are three seats facing a tiny courtyard. Sandwiches in the morning, a daily quiche at noon, coffee and baked sweets after — a place that has room for you at any hour.",
    },
    navi_lines: {
      ja: "坪庭の見える席、3つしかないねん。空いてたら座り。錦に行く前に、ここで一息つくとちょうどええで〜",
      en: "Only three seats face the courtyard — grab one if it's free. A good pause before you hit Nishiki.",
    },
    lat: 35.0026,
    lng: 135.7668,
    walk_min: 8,
    kanji: "珈",
    grad: ["#3A5E4A", "#9E8B5A"],
    capacity_weight: 0.9,
    congestion_level: 0,
    open_hours: { from: 8, to: 18 },
    meal_times: ["morning", "lunch", "snack"],
    is_collab: false,
    rare_config: { prob: 0.2 },
    active: true,
  },
];

/**
 * 既定のルーティングルール。
 * マジックナンバーはここ（＝DBの routing_rules）に置き、エンジン側には置かない。
 *
 * ★ congestion ルールは「スキャンログ密度による自動補正」だけを入れている。
 *   静的な multiplier_by_level は入れない。理由:
 *   基本重み (3 - congestion_level) × capacity_weight が既に混雑を織り込んでいるため、
 *   静的な congestion ルールを重ねると同じ信号の二重計上になり、ルートが数パターンに
 *   収束して受け入れ基準（ユニークルート400通り以上）を割る。実測: 清水寺で 433→364 に低下。
 *   congestion ルールは Phase 2 の「スキャンログ密度による動的補正」用に予約する。
 */
export const seedRules: RoutingRule[] = [
  {
    id: "44444444-4444-4444-8444-000000000004",
    campaign_id: CAMPAIGN_ID,
    // ★混雑の自動連動。直近60分のスキャン数を「受入キャパで割った密度」で見る。
    //   参加者がいない時間帯は全スポットが from:0 に該当し、同じ倍率がかかるだけなので
    //   相対的な重みは変わらない＝何も起きない。混み始めた場所だけが自動で抑制される。
    rule_type: "congestion",
    config: {
      window_min: 60,
      per_capacity: true,
      thresholds: [
        { from: 0, multiplier: 1.0 },
        { from: 3, multiplier: 0.75 },
        { from: 6, multiplier: 0.45 },
        { from: 10, multiplier: 0.2 },
      ],
    },
    priority: 30,
    active: true,
  },
  {
    id: "44444444-4444-4444-8444-000000000002",
    campaign_id: CAMPAIGN_ID,
    // 昼のピーク帯は混雑スポットを抑える。
    // ※空きスポットの「加点」はここでは行わない（基本重みと二重計上になるため）
    rule_type: "time",
    config: { hours: [11, 12, 13, 14], multiplier_by_level: { "2": 0.8 } },
    priority: 20,
    active: true,
  },
  {
    id: "44444444-4444-4444-8444-000000000005",
    campaign_id: CAMPAIGN_ID,
    // ★食べどきルール。飲食スポット（meal_times を持つもの）だけに効く。
    //   帯の中 → 重みを上げ、帯の外 → 大きく下げる。
    //   meal_off_band を 0 にすれば「その時間は絶対に出さない」にできるが、
    //   0 にすると回廊内の候補が2件を切ったときにフォールバックで結局出るので、
    //   「出にくいが、他に何も無ければ出る」0.25 にしている。
    //   時刻の区切りは店舗事情で変わる想定なので、コードではなくここで持つ。
    rule_type: "time",
    config: {
      meal_bands: {
        morning: [7, 8, 9, 10],
        lunch: [11, 12, 13, 14],
        snack: [14, 15, 16, 17],
        dinner: [17, 18, 19, 20, 21],
      },
      meal_in_band: 2.0,
      meal_off_band: 0.25,
    },
    priority: 25,
    active: true,
  },
  {
    id: "44444444-4444-4444-8444-000000000006",
    campaign_id: CAMPAIGN_ID,
    // ★開いている時間ルール。分散よりも先に効かせたいので priority を小さくしている。
    //   スポットを増やすほど「行ったら閉まっていた」事故は増える。
    //   分散のために散らした先が閉館では、体験としては最短ルートより悪い。
    //   closing_soon は「着く頃には閉まっている」を防ぐためのもの。
    //   徒歩で次のスポットまで5〜12分かかるので、閉館1時間前からは薦めない。
    rule_type: "time",
    config: {
      closed_multiplier: 0.05,
      closing_soon_hours: 1,
      closing_soon_multiplier: 0.4,
    },
    priority: 10,
    active: true,
  },
  {
    id: "44444444-4444-4444-8444-000000000003",
    campaign_id: CAMPAIGN_ID,
    // 同じ二択ばかり出さないための揺らぎ。分散と「道のりの偶然」の両立点。
    // jitter/peak は scripts/simulate-routing.ts のグリッド探索で決めた値
    rule_type: "random",
    config: { jitter: 0.5 },
    priority: 90,
    active: true,
  },
];
