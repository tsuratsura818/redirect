-- ============================================================
-- Pivolink まわりみち 0002_seed_kyoto.sql
-- ★このファイルは scripts/gen-seed-sql.ts の生成物です。直接編集しないこと。
--   シードの正は src/data/seed.ts。変更したら `npm run gen:seed` で再生成する。
--
-- ★実在スポット名・d食堂のコラボ特典は許諾未取得の仮データ。
--   対外公開・本番投入の前に許諾取得 or 差し替えを行うこと。
-- ★qr_token は開発用の固定値（dev-*）。本番の看板用トークンは
--   DB既定値（128bit乱数）で発行し直してから印刷入稿すること。
-- ============================================================

-- 表示用メタ列の追加（0001_init.sql には無い列。冪等）
alter table spots     add column if not exists map_url text;
alter table spots     add column if not exists image_url text;
alter table campaigns add column if not exists start_label jsonb;
alter table goals     add column if not exists grad text[];
alter table spots     add column if not exists grad text[];
alter table spots     add column if not exists meal_times text[] not null default '{}';
alter table spots     add column if not exists open_hours jsonb;
alter table goals     add column if not exists open_hours jsonb;

-- ---------- campaign ----------
insert into campaigns (
  id, slug, name, status, start_qr_token, start_lat, start_lng, start_label,
  stamp_target, detour_tolerance_m, languages, cm_frequency_cap
) values (
  '11111111-1111-4111-8111-111111111111', 'kyoto-higashiyama', '{"ja":"まわりみち 京都・東山","en":"Mawarimichi Kyoto — Higashiyama"}'::jsonb, 'active'::campaign_status,
  'dev-start-kyoto', 34.9858, 135.7588, '{"ja":"京都駅ビル 観光案内所","en":"Kyoto Station Tourist Info"}'::jsonb,
  5, 220, '{"ja","en"}'::text[], 3
)
on conflict (slug) do update set
  name = excluded.name, status = excluded.status,
  start_lat = excluded.start_lat, start_lng = excluded.start_lng, start_label = excluded.start_label,
  stamp_target = excluded.stamp_target, detour_tolerance_m = excluded.detour_tolerance_m,
  languages = excluded.languages, cm_frequency_cap = excluded.cm_frequency_cap;

-- ---------- goals ----------
insert into goals (id, campaign_id, slug, name, subtitle, lat, lng, icon_char, open_hours, grad, sort_order, active)
values ('22222222-2222-4222-8222-000000000001', '11111111-1111-4111-8111-111111111111', 'kiyomizu', '{"ja":"清水寺","en":"Kiyomizu-dera"}'::jsonb, '{"ja":"定番へ、定番じゃない道から","en":"The classic — by an unclassic road"}'::jsonb, 34.9949, 135.785, '清', '{"from":6,"to":18}'::jsonb, '{"#7A3E2E","#C8553D"}'::text[], 1, true)
on conflict (campaign_id, slug) do update set
  name = excluded.name, subtitle = excluded.subtitle, lat = excluded.lat, lng = excluded.lng,
  icon_char = excluded.icon_char, open_hours = excluded.open_hours,
  grad = excluded.grad, sort_order = excluded.sort_order, active = excluded.active;

insert into goals (id, campaign_id, slug, name, subtitle, lat, lng, icon_char, open_hours, grad, sort_order, active)
values ('22222222-2222-4222-8222-000000000002', '11111111-1111-4111-8111-111111111111', 'yasaka', '{"ja":"八坂神社","en":"Yasaka Shrine"}'::jsonb, '{"ja":"祇園の入口へ、路地伝いに","en":"Into Gion, lane by lane"}'::jsonb, 35.0037, 135.7787, '八', null, '{"#8E3A4E","#C8553D"}'::text[], 2, true)
on conflict (campaign_id, slug) do update set
  name = excluded.name, subtitle = excluded.subtitle, lat = excluded.lat, lng = excluded.lng,
  icon_char = excluded.icon_char, open_hours = excluded.open_hours,
  grad = excluded.grad, sort_order = excluded.sort_order, active = excluded.active;

insert into goals (id, campaign_id, slug, name, subtitle, lat, lng, icon_char, open_hours, grad, sort_order, active)
values ('22222222-2222-4222-8222-000000000003', '11111111-1111-4111-8111-111111111111', 'nishiki', '{"ja":"錦市場","en":"Nishiki Market"}'::jsonb, '{"ja":"京の台所へ、寄り道しながら","en":"To Kyoto''s kitchen, the long way"}'::jsonb, 35.005, 135.7649, '錦', '{"from":9,"to":18}'::jsonb, '{"#3A5E4A","#7BA05B"}'::text[], 3, true)
on conflict (campaign_id, slug) do update set
  name = excluded.name, subtitle = excluded.subtitle, lat = excluded.lat, lng = excluded.lng,
  icon_char = excluded.icon_char, open_hours = excluded.open_hours,
  grad = excluded.grad, sort_order = excluded.sort_order, active = excluded.active;

-- ---------- spots ----------
insert into spots (
  id, campaign_id, slug, qr_token, name, area, story, navi_lines, lat, lng, walk_min, kanji, grad,
  capacity_weight, congestion_level, is_collab, meal_times, open_hours, coupon, rare_config, image_url, active
) values (
  '33333333-3333-4333-8333-000000000001', '11111111-1111-4111-8111-111111111111', 'rokuhara', 'dev-rokuhara', '{"ja":"六波羅蜜寺","en":"Rokuharamitsu-ji"}'::jsonb, '{"ja":"東山・清水寺から徒歩10分","en":"Higashiyama — 10 min from Kiyomizu-dera"}'::jsonb, '{"ja":"口から六体の阿弥陀仏が現れる「空也上人立像」で知られる古刹。行列のできる清水寺のすぐそばにありながら、境内は驚くほど静かです。951年、疫病の都を念仏とともに歩いた空也上人。その祈りの原点が、いまもここにあります。","en":"Home to the famous statue of Kuya, six tiny Buddhas emerging from his lips. Just steps from crowded Kiyomizu-dera, yet remarkably quiet — the origin of a prayer that walked plague-era Kyoto in 951."}'::jsonb, '{"ja":"清水寺の行列を横目に、こっちは静かなもんやで。空也さんの口から仏さまが出てるの、ほんまにびっくりするから見ときや〜","en":"While everyone queues at Kiyomizu, this place is all yours. Wait till you see the Buddhas coming out of Kuya''s mouth!"}'::jsonb,
  34.997, 135.7721, 8, '空', '{"#7A3E2E","#C8553D"}'::text[],
  1, 1, false, '{}'::text[], '{"from":8,"to":17}'::jsonb, null, '{"prob":0.2}'::jsonb, '/spots/rokuhara.webp', true
)
on conflict (campaign_id, slug) do update set
  name = excluded.name, area = excluded.area, story = excluded.story, navi_lines = excluded.navi_lines,
  lat = excluded.lat, lng = excluded.lng, walk_min = excluded.walk_min, kanji = excluded.kanji, grad = excluded.grad,
  capacity_weight = excluded.capacity_weight, congestion_level = excluded.congestion_level,
  is_collab = excluded.is_collab, meal_times = excluded.meal_times, open_hours = excluded.open_hours,
  coupon = excluded.coupon, rare_config = excluded.rare_config,
  image_url = excluded.image_url, active = excluded.active;

insert into spots (
  id, campaign_id, slug, qr_token, name, area, story, navi_lines, lat, lng, walk_min, kanji, grad,
  capacity_weight, congestion_level, is_collab, meal_times, open_hours, coupon, rare_config, image_url, active
) values (
  '33333333-3333-4333-8333-000000000002', '11111111-1111-4111-8111-111111111111', 'rokudo', 'dev-rokudo', '{"ja":"六道珍皇寺","en":"Rokudo Chinno-ji"}'::jsonb, '{"ja":"東山・六道の辻","en":"Higashiyama — Rokudo Crossing"}'::jsonb, '{"ja":"ここは「六道の辻」— あの世とこの世の境目と言い伝えられてきた場所。平安の官僚・小野篁が夜ごと冥界へ通ったという井戸が、いまも本堂の奥に残ります。京都で最も物語の濃い、知る人ぞ知る一角です。","en":"The legendary border between this world and the next. A well behind the main hall is said to have carried the Heian official Ono no Takamura to the underworld each night. One of Kyoto''s most story-rich hidden corners."}'::jsonb, '{"ja":"ここ、あの世への入口って言われてるんやで…。井戸を覗くときは、そーっとな。帰りは一緒に帰ろな？","en":"They say this is the gateway to the other world... Peek into the well gently, okay? And let''s go home together!"}'::jsonb,
  34.9979, 135.7748, 6, '冥', '{"#2A2620","#4A3B5E"}'::text[],
  1, 1, false, '{}'::text[], '{"from":9,"to":16}'::jsonb, null, '{"prob":0.2}'::jsonb, '/spots/rokudo.webp', true
)
on conflict (campaign_id, slug) do update set
  name = excluded.name, area = excluded.area, story = excluded.story, navi_lines = excluded.navi_lines,
  lat = excluded.lat, lng = excluded.lng, walk_min = excluded.walk_min, kanji = excluded.kanji, grad = excluded.grad,
  capacity_weight = excluded.capacity_weight, congestion_level = excluded.congestion_level,
  is_collab = excluded.is_collab, meal_times = excluded.meal_times, open_hours = excluded.open_hours,
  coupon = excluded.coupon, rare_config = excluded.rare_config,
  image_url = excluded.image_url, active = excluded.active;

insert into spots (
  id, campaign_id, slug, qr_token, name, area, story, navi_lines, lat, lng, walk_min, kanji, grad,
  capacity_weight, congestion_level, is_collab, meal_times, open_hours, coupon, rare_config, image_url, active
) values (
  '33333333-3333-4333-8333-000000000003', '11111111-1111-4111-8111-111111111111', 'kenninji', 'dev-kenninji', '{"ja":"建仁寺","en":"Kennin-ji"}'::jsonb, '{"ja":"祇園・花見小路の南端","en":"Gion — south end of Hanamikoji"}'::jsonb, '{"ja":"1202年創建、京都最古の禅寺。俵屋宗達の「風神雷神図」、天井いっぱいの「双龍図」。観光客であふれる花見小路を数分歩いただけで、これほどの静寂と美術に出会えることは、あまり知られていません。","en":"Kyoto''s oldest Zen temple (1202), holding the iconic Wind and Thunder Gods screen and the ceiling-filling Twin Dragons. Minutes from packed Hanamikoji, yet astonishingly serene."}'::jsonb, '{"ja":"花見小路の人混みを抜けたら、急に静かになるやろ？ 天井の双龍、首が痛くなるまで見上げてしまうで〜","en":"Feel how the noise of Hanamikoji just disappears? The twin dragons on the ceiling will keep your head tilted for a while!"}'::jsonb,
  35.0006, 135.7735, 10, '禅', '{"#3D4A3A","#6B7D5A"}'::text[],
  1, 2, false, '{}'::text[], '{"from":10,"to":17}'::jsonb, null, '{"prob":0.2}'::jsonb, '/spots/kenninji.webp', true
)
on conflict (campaign_id, slug) do update set
  name = excluded.name, area = excluded.area, story = excluded.story, navi_lines = excluded.navi_lines,
  lat = excluded.lat, lng = excluded.lng, walk_min = excluded.walk_min, kanji = excluded.kanji, grad = excluded.grad,
  capacity_weight = excluded.capacity_weight, congestion_level = excluded.congestion_level,
  is_collab = excluded.is_collab, meal_times = excluded.meal_times, open_hours = excluded.open_hours,
  coupon = excluded.coupon, rare_config = excluded.rare_config,
  image_url = excluded.image_url, active = excluded.active;

insert into spots (
  id, campaign_id, slug, qr_token, name, area, story, navi_lines, lat, lng, walk_min, kanji, grad,
  capacity_weight, congestion_level, is_collab, meal_times, open_hours, coupon, rare_config, image_url, active
) values (
  '33333333-3333-4333-8333-000000000004', '11111111-1111-4111-8111-111111111111', 'shoseien', 'dev-shoseien', '{"ja":"渉成園","en":"Shosei-en Garden"}'::jsonb, '{"ja":"京都駅から徒歩10分","en":"10 min walk from Kyoto Station"}'::jsonb, '{"ja":"東本願寺の飛地境内にある池泉回遊式庭園。京都駅からわずか徒歩10分に、四季の花と水鏡の広がる名庭があることを、多くの旅行者は知りません。朝の光の時間帯は、ほとんど貸切です。","en":"A strolling pond garden of Higashi Hongan-ji, just 10 minutes from Kyoto Station — and somehow still a secret. In the morning light, you may have it almost to yourself."}'::jsonb, '{"ja":"京都駅のすぐ近くにこんな庭があるって、みんな知らんのよ。朝イチは水面がぴかぴかの鏡やで〜","en":"Nobody expects a garden like this so close to the station. In early morning the pond turns into a perfect mirror!"}'::jsonb,
  34.991, 135.7622, 12, '庭', '{"#2E5E4E","#7BA05B"}'::text[],
  1, 0, false, '{}'::text[], '{"from":9,"to":17}'::jsonb, null, '{"prob":0.2,"time_window":[9,11],"prob_in_window":0.4,"label":{"ja":"朝の水鏡（時間帯限定スタンプ）","en":"Morning Mirror (time-limited stamp)"}}'::jsonb, '/spots/shoseien.webp', true
)
on conflict (campaign_id, slug) do update set
  name = excluded.name, area = excluded.area, story = excluded.story, navi_lines = excluded.navi_lines,
  lat = excluded.lat, lng = excluded.lng, walk_min = excluded.walk_min, kanji = excluded.kanji, grad = excluded.grad,
  capacity_weight = excluded.capacity_weight, congestion_level = excluded.congestion_level,
  is_collab = excluded.is_collab, meal_times = excluded.meal_times, open_hours = excluded.open_hours,
  coupon = excluded.coupon, rare_config = excluded.rare_config,
  image_url = excluded.image_url, active = excluded.active;

insert into spots (
  id, campaign_id, slug, qr_token, name, area, story, navi_lines, lat, lng, walk_min, kanji, grad,
  capacity_weight, congestion_level, is_collab, meal_times, open_hours, coupon, rare_config, image_url, active
) values (
  '33333333-3333-4333-8333-000000000005', '11111111-1111-4111-8111-111111111111', 'yasui', 'dev-yasui', '{"ja":"安井金比羅宮","en":"Yasui Konpira-gu"}'::jsonb, '{"ja":"東山・祇園の南","en":"Higashiyama — south of Gion"}'::jsonb, '{"ja":"「悪縁を切り、良縁を結ぶ」— お札に覆われた縁切り縁結び碑をくぐる、京都でも他に類のない参拝体験。切りたい縁と結びたい縁をひとつずつ胸に、碑の穴をくぐってみてください。","en":"Crawl through the paper-covered stone to cut bad ties and bind good ones — a ritual found nowhere else. Bring one bond to break and one to make."}'::jsonb, '{"ja":"碑をくぐるときは、切りたい縁と結びたい縁をひとつずつ、はっきり思い浮かべるんやで。よくばりは禁物！","en":"When you crawl through, picture one tie to cut and one to bind — clearly! No being greedy!"}'::jsonb,
  35.0009, 135.777, 7, '縁', '{"#6E2E3E","#B85C7A"}'::text[],
  1, 2, false, '{}'::text[], null, null, '{"prob":0.2}'::jsonb, '/spots/yasui.webp', true
)
on conflict (campaign_id, slug) do update set
  name = excluded.name, area = excluded.area, story = excluded.story, navi_lines = excluded.navi_lines,
  lat = excluded.lat, lng = excluded.lng, walk_min = excluded.walk_min, kanji = excluded.kanji, grad = excluded.grad,
  capacity_weight = excluded.capacity_weight, congestion_level = excluded.congestion_level,
  is_collab = excluded.is_collab, meal_times = excluded.meal_times, open_hours = excluded.open_hours,
  coupon = excluded.coupon, rare_config = excluded.rare_config,
  image_url = excluded.image_url, active = excluded.active;

insert into spots (
  id, campaign_id, slug, qr_token, name, area, story, navi_lines, lat, lng, walk_min, kanji, grad,
  capacity_weight, congestion_level, is_collab, meal_times, open_hours, coupon, rare_config, image_url, active
) values (
  '33333333-3333-4333-8333-000000000006', '11111111-1111-4111-8111-111111111111', 'kawai', 'dev-kawai', '{"ja":"河井寬次郎記念館","en":"Kawai Kanjiro''s House"}'::jsonb, '{"ja":"東山・五条坂","en":"Higashiyama — Gojozaka"}'::jsonb, '{"ja":"民藝運動を代表する陶工・河井寬次郎が自ら設計した自宅兼工房。裏手には巨大な登り窯が当時のまま残ります。「暮らしが仕事 仕事が暮らし」— 静かな町家の中に、作り手の哲学が息づいています。","en":"The self-designed home and studio of Mingei potter Kawai Kanjiro, with his massive climbing kiln preserved out back. ''Life is work, work is life'' — his philosophy still breathes in this quiet townhouse."}'::jsonb, '{"ja":"ここの登り窯、ほんまに大きいんやで。椅子も棚も全部、河井さんの手づくり。座ってええ椅子もあるから探してみ〜","en":"The climbing kiln here is huge! Every chair and shelf was made by Kanjiro himself — some you can even sit on. Find them!"}'::jsonb,
  34.9928, 135.7754, 9, '陶', '{"#5A4632","#A67B4B"}'::text[],
  1, 0, false, '{}'::text[], '{"from":10,"to":17}'::jsonb, null, '{"prob":0.2}'::jsonb, '/spots/kawai.webp', true
)
on conflict (campaign_id, slug) do update set
  name = excluded.name, area = excluded.area, story = excluded.story, navi_lines = excluded.navi_lines,
  lat = excluded.lat, lng = excluded.lng, walk_min = excluded.walk_min, kanji = excluded.kanji, grad = excluded.grad,
  capacity_weight = excluded.capacity_weight, congestion_level = excluded.congestion_level,
  is_collab = excluded.is_collab, meal_times = excluded.meal_times, open_hours = excluded.open_hours,
  coupon = excluded.coupon, rare_config = excluded.rare_config,
  image_url = excluded.image_url, active = excluded.active;

insert into spots (
  id, campaign_id, slug, qr_token, name, area, story, navi_lines, lat, lng, walk_min, kanji, grad,
  capacity_weight, congestion_level, is_collab, meal_times, open_hours, coupon, rare_config, image_url, active
) values (
  '33333333-3333-4333-8333-000000000007', '11111111-1111-4111-8111-111111111111', 'bukkoji', 'dev-bukkoji', '{"ja":"佛光寺と、d食堂","en":"Bukko-ji & d shokudo"}'::jsonb, '{"ja":"四条烏丸から徒歩5分","en":"5 min from Shijo-Karasuma"}'::jsonb, '{"ja":"町なかの静かな古刹・佛光寺。その境内には、京都の定番を丁寧に出す食堂とデザインストアが息づいています。お寺の境内でいただくおやつと定食 — 京都の「いま」と「むかし」が同じ敷地にある、めずらしい場所です。","en":"A quiet urban temple whose grounds host a design store and a beloved set-meal shokudo. Sweets and lunch inside temple grounds — old and new Kyoto sharing one courtyard."}'::jsonb, '{"ja":"お寺の中にごはん屋さんがあるんやで！ スタンプ画面を見せたら、デモ特典で甘味がちょっとおトクになるらしいで〜","en":"There''s a shokudo inside the temple grounds! Show your stamp screen for a little demo treat discount!"}'::jsonb,
  35.0017, 135.7627, 11, '縁', '{"#3A3E5E","#5E6E9E"}'::text[],
  1, 1, true, '{"lunch","snack"}'::text[], '{"from":9,"to":18}'::jsonb, '{"ja":"コラボ特典：スタンプ画面提示で境内の甘味 50円引（デモ表記）","en":"Collab perk: show stamps for ¥50 off sweets (demo)"}'::jsonb, '{"prob":0.2}'::jsonb, '/spots/bukkoji.webp', true
)
on conflict (campaign_id, slug) do update set
  name = excluded.name, area = excluded.area, story = excluded.story, navi_lines = excluded.navi_lines,
  lat = excluded.lat, lng = excluded.lng, walk_min = excluded.walk_min, kanji = excluded.kanji, grad = excluded.grad,
  capacity_weight = excluded.capacity_weight, congestion_level = excluded.congestion_level,
  is_collab = excluded.is_collab, meal_times = excluded.meal_times, open_hours = excluded.open_hours,
  coupon = excluded.coupon, rare_config = excluded.rare_config,
  image_url = excluded.image_url, active = excluded.active;

insert into spots (
  id, campaign_id, slug, qr_token, name, area, story, navi_lines, lat, lng, walk_min, kanji, grad,
  capacity_weight, congestion_level, is_collab, meal_times, open_hours, coupon, rare_config, image_url, active
) values (
  '33333333-3333-4333-8333-000000000008', '11111111-1111-4111-8111-111111111111', 'ichihime', 'dev-ichihime', '{"ja":"市比賣神社","en":"Ichihime Shrine"}'::jsonb, '{"ja":"河原町五条の路地の奥","en":"Down a lane off Kawaramachi-Gojo"}'::jsonb, '{"ja":"女性の守り神として1200年、市場の神として都の商いを見守ってきた小さなお社。ビルの谷間の路地の奥という立地ゆえ、地図を持っていても通り過ぎてしまう — まさに「連れてきてもらわないと出会えない」場所です。","en":"A tiny shrine guarding women and the city''s markets for 1,200 years, tucked so deep in a lane between buildings that even map-holders walk past. Exactly the kind of place you must be led to."}'::jsonb, '{"ja":"ここ、自分ではぜったい見つけられへん場所やろ？ こういう出会いのために、わたしがおるんやで〜","en":"You''d never find this on your own, right? This is exactly why you''ve got me!"}'::jsonb,
  34.9932, 135.7669, 8, '姫', '{"#8E3A4E","#D98A9E"}'::text[],
  1, 0, false, '{}'::text[], '{"from":9,"to":17}'::jsonb, null, '{"prob":0.2}'::jsonb, '/spots/ichihime.webp', true
)
on conflict (campaign_id, slug) do update set
  name = excluded.name, area = excluded.area, story = excluded.story, navi_lines = excluded.navi_lines,
  lat = excluded.lat, lng = excluded.lng, walk_min = excluded.walk_min, kanji = excluded.kanji, grad = excluded.grad,
  capacity_weight = excluded.capacity_weight, congestion_level = excluded.congestion_level,
  is_collab = excluded.is_collab, meal_times = excluded.meal_times, open_hours = excluded.open_hours,
  coupon = excluded.coupon, rare_config = excluded.rare_config,
  image_url = excluded.image_url, active = excluded.active;

insert into spots (
  id, campaign_id, slug, qr_token, name, area, story, navi_lines, lat, lng, walk_min, kanji, grad,
  capacity_weight, congestion_level, is_collab, meal_times, open_hours, coupon, rare_config, image_url, active
) values (
  '33333333-3333-4333-8333-000000000009', '11111111-1111-4111-8111-111111111111', 'asagiri', 'dev-asagiri', '{"ja":"喫茶 朝霧","en":"Kissa Asagiri"}'::jsonb, '{"ja":"京都駅と五条のあいだ","en":"Between Kyoto Station and Gojo"}'::jsonb, '{"ja":"朝7時から灯りがつく、カウンターだけの喫茶店。厚切りトーストと、ネルドリップの深煎り。観光地に向かう前の、まだ人の少ない京都の空気ごと味わう一杯です。午後は自家製プリンめあての常連で静かに埋まります。","en":"A counter-only coffee shop that opens at 7am. Thick-cut toast and deep-roast flannel-drip coffee — the taste of Kyoto before the crowds arrive. In the afternoon, regulars come for the house-made pudding."}'::jsonb, '{"ja":"朝いちばんに行くならここやで。観光地が動き出す前のこの時間が、いちばん京都らしいと思うんよ〜","en":"If you''re out early, start here. Kyoto before the sightseeing starts is the most Kyoto it ever gets."}'::jsonb,
  34.9905, 135.764, 7, '朝', '{"#4A3B30","#A67B4B"}'::text[],
  0.8, 0, false, '{"morning","snack"}'::text[], '{"from":7,"to":18}'::jsonb, null, '{"prob":0.2,"time_window":[7,10],"prob_in_window":0.4}'::jsonb, '/spots/asagiri.webp', true
)
on conflict (campaign_id, slug) do update set
  name = excluded.name, area = excluded.area, story = excluded.story, navi_lines = excluded.navi_lines,
  lat = excluded.lat, lng = excluded.lng, walk_min = excluded.walk_min, kanji = excluded.kanji, grad = excluded.grad,
  capacity_weight = excluded.capacity_weight, congestion_level = excluded.congestion_level,
  is_collab = excluded.is_collab, meal_times = excluded.meal_times, open_hours = excluded.open_hours,
  coupon = excluded.coupon, rare_config = excluded.rare_config,
  image_url = excluded.image_url, active = excluded.active;

insert into spots (
  id, campaign_id, slug, qr_token, name, area, story, navi_lines, lat, lng, walk_min, kanji, grad,
  capacity_weight, congestion_level, is_collab, meal_times, open_hours, coupon, rare_config, image_url, active
) values (
  '33333333-3333-4333-8333-000000000010', '11111111-1111-4111-8111-111111111111', 'nanakamado', 'dev-nanakamado', '{"ja":"食堂 なゝかまど","en":"Nanakamado Shokudo"}'::jsonb, '{"ja":"東山・松原通","en":"Higashiyama — Matsubara-dori"}'::jsonb, '{"ja":"おばんざいを7品ほど並べ、その日の分がなくなったら閉める町の食堂。観光地価格ではない、京都の人が普段食べているごはんが出てきます。夜は同じ器で一杯やる人が増え、店の顔が少し変わります。","en":"A neighbourhood shokudo serving seven or so obanzai dishes, closing when the day''s batch runs out. Not tourist pricing — just what Kyoto people actually eat. At night the same bowls come with a drink, and the room changes character."}'::jsonb, '{"ja":"お昼はここ。売り切れたら閉まってまうから、お腹すいてるなら先に寄っといたほうがええで〜","en":"Lunch stop! They close when the food runs out, so if you''re hungry, come here first."}'::jsonb,
  34.9975, 135.77, 6, '膳', '{"#3D4A3A","#8A9E6B"}'::text[],
  1, 1, true, '{"lunch","dinner"}'::text[], '{"from":11,"to":21}'::jsonb, '{"ja":"コラボ特典：スタンプ画面提示で小鉢ひとつサービス（デモ表記）","en":"Collab perk: show your stamps for a free side dish (demo)"}'::jsonb, '{"prob":0.2}'::jsonb, '/spots/nanakamado.webp', true
)
on conflict (campaign_id, slug) do update set
  name = excluded.name, area = excluded.area, story = excluded.story, navi_lines = excluded.navi_lines,
  lat = excluded.lat, lng = excluded.lng, walk_min = excluded.walk_min, kanji = excluded.kanji, grad = excluded.grad,
  capacity_weight = excluded.capacity_weight, congestion_level = excluded.congestion_level,
  is_collab = excluded.is_collab, meal_times = excluded.meal_times, open_hours = excluded.open_hours,
  coupon = excluded.coupon, rare_config = excluded.rare_config,
  image_url = excluded.image_url, active = excluded.active;

insert into spots (
  id, campaign_id, slug, qr_token, name, area, story, navi_lines, lat, lng, walk_min, kanji, grad,
  capacity_weight, congestion_level, is_collab, meal_times, open_hours, coupon, rare_config, image_url, active
) values (
  '33333333-3333-4333-8333-000000000011', '11111111-1111-4111-8111-111111111111', 'hitoyasumi', 'dev-hitoyasumi', '{"ja":"甘味 ひとやすみ","en":"Kanmi Hitoyasumi"}'::jsonb, '{"ja":"清水道の途中、坂の左手","en":"Halfway up Kiyomizu-michi, on the left"}'::jsonb, '{"ja":"清水寺へ登る坂の途中、縁台が2つだけ出ている甘味処。名物は炭火であぶるみたらし団子と、夏場の宇治金時。坂を登りきる前に一度座る、その「ひとやすみ」ごと名前になった店です。","en":"Two benches on the slope up to Kiyomizu-dera. Charcoal-grilled mitarashi dango, and Uji-kintoki shaved ice in summer. The shop is named after the pause itself — the rest you take before the last of the climb."}'::jsonb, '{"ja":"坂の途中で一回座るの、だいじやで。ここのお団子、炭火であぶってくれるから香りがちゃうんよ〜","en":"Sitting down halfway up matters. They grill the dango over charcoal — you''ll smell it before you see it."}'::jsonb,
  34.9962, 135.7812, 5, '甘', '{"#7A3E2E","#D9A05B"}'::text[],
  0.6, 1, true, '{"snack"}'::text[], '{"from":10,"to":17}'::jsonb, '{"ja":"コラボ特典：スタンプ画面提示でお茶をサービス（デモ表記）","en":"Collab perk: show your stamps for a complimentary tea (demo)"}'::jsonb, '{"prob":0.2}'::jsonb, '/spots/hitoyasumi.webp', true
)
on conflict (campaign_id, slug) do update set
  name = excluded.name, area = excluded.area, story = excluded.story, navi_lines = excluded.navi_lines,
  lat = excluded.lat, lng = excluded.lng, walk_min = excluded.walk_min, kanji = excluded.kanji, grad = excluded.grad,
  capacity_weight = excluded.capacity_weight, congestion_level = excluded.congestion_level,
  is_collab = excluded.is_collab, meal_times = excluded.meal_times, open_hours = excluded.open_hours,
  coupon = excluded.coupon, rare_config = excluded.rare_config,
  image_url = excluded.image_url, active = excluded.active;

insert into spots (
  id, campaign_id, slug, qr_token, name, area, story, navi_lines, lat, lng, walk_min, kanji, grad,
  capacity_weight, congestion_level, is_collab, meal_times, open_hours, coupon, rare_config, image_url, active
) values (
  '33333333-3333-4333-8333-000000000012', '11111111-1111-4111-8111-111111111111', 'miyakoroji', 'dev-miyakoroji', '{"ja":"居酒屋 みやこ路地","en":"Izakaya Miyako-roji"}'::jsonb, '{"ja":"祇園の南、路地を2本入ったところ","en":"South Gion, two lanes in"}'::jsonb, '{"ja":"表通りから路地を2本入った、赤提灯ひとつの店。京都の居酒屋らしく、出汁の効いた煮物と地の日本酒が並びます。日が落ちてから灯りがつくので、昼にここを通っても、店があることに気づきません。","en":"Two lanes back from the main street, marked by a single red lantern. Dashi-rich simmered dishes and local sake. The lantern only lights after dark — walk past at noon and you''d never know it was there."}'::jsonb, '{"ja":"ここは暗なってからやな。昼に通っても閉まってるから、夕方の道でめぐりあえたらラッキーやで〜","en":"This one''s for after dark. Walk by at noon and it''s shuttered — meeting it in the evening is luck."}'::jsonb,
  35.0022, 135.7745, 4, '灯', '{"#2A2620","#8E4A3A"}'::text[],
  0.7, 1, false, '{"dinner"}'::text[], '{"from":17,"to":23}'::jsonb, null, '{"prob":0.2,"time_window":[17,22],"prob_in_window":0.4}'::jsonb, '/spots/miyakoroji.webp', true
)
on conflict (campaign_id, slug) do update set
  name = excluded.name, area = excluded.area, story = excluded.story, navi_lines = excluded.navi_lines,
  lat = excluded.lat, lng = excluded.lng, walk_min = excluded.walk_min, kanji = excluded.kanji, grad = excluded.grad,
  capacity_weight = excluded.capacity_weight, congestion_level = excluded.congestion_level,
  is_collab = excluded.is_collab, meal_times = excluded.meal_times, open_hours = excluded.open_hours,
  coupon = excluded.coupon, rare_config = excluded.rare_config,
  image_url = excluded.image_url, active = excluded.active;

insert into spots (
  id, campaign_id, slug, qr_token, name, area, story, navi_lines, lat, lng, walk_min, kanji, grad,
  capacity_weight, congestion_level, is_collab, meal_times, open_hours, coupon, rare_config, image_url, active
) values (
  '33333333-3333-4333-8333-000000000013', '11111111-1111-4111-8111-111111111111', 'mizunowa', 'dev-mizunowa', '{"ja":"町家珈琲 みずのわ","en":"Machiya Coffee Mizunowa"}'::jsonb, '{"ja":"錦市場の南、烏丸の町家","en":"A machiya south of Nishiki Market"}'::jsonb, '{"ja":"築100年の町家をそのまま使った珈琲店。通り庭を抜けた奥に坪庭があり、そこに面した席が3つだけあります。朝はサンドイッチ、昼は日替わりのキッシュ、午後は珈琲と焼き菓子。一日中、いつ来ても居場所がある店です。","en":"A 100-year-old machiya turned coffee house. Past the through-garden are three seats facing a tiny courtyard. Sandwiches in the morning, a daily quiche at noon, coffee and baked sweets after — a place that has room for you at any hour."}'::jsonb, '{"ja":"坪庭の見える席、3つしかないねん。空いてたら座り。錦に行く前に、ここで一息つくとちょうどええで〜","en":"Only three seats face the courtyard — grab one if it''s free. A good pause before you hit Nishiki."}'::jsonb,
  35.0026, 135.7668, 8, '珈', '{"#3A5E4A","#9E8B5A"}'::text[],
  0.9, 0, false, '{"morning","lunch","snack"}'::text[], '{"from":8,"to":18}'::jsonb, null, '{"prob":0.2}'::jsonb, '/spots/mizunowa.webp', true
)
on conflict (campaign_id, slug) do update set
  name = excluded.name, area = excluded.area, story = excluded.story, navi_lines = excluded.navi_lines,
  lat = excluded.lat, lng = excluded.lng, walk_min = excluded.walk_min, kanji = excluded.kanji, grad = excluded.grad,
  capacity_weight = excluded.capacity_weight, congestion_level = excluded.congestion_level,
  is_collab = excluded.is_collab, meal_times = excluded.meal_times, open_hours = excluded.open_hours,
  coupon = excluded.coupon, rare_config = excluded.rare_config,
  image_url = excluded.image_url, active = excluded.active;

-- ---------- routing_rules ----------
delete from routing_rules where campaign_id = '11111111-1111-4111-8111-111111111111';
insert into routing_rules (id, campaign_id, rule_type, config, priority, active)
values ('44444444-4444-4444-8444-000000000004', '11111111-1111-4111-8111-111111111111', 'congestion'::rule_type, '{"window_min":60,"per_capacity":true,"thresholds":[{"from":0,"multiplier":1},{"from":3,"multiplier":0.75},{"from":6,"multiplier":0.45},{"from":10,"multiplier":0.2}]}'::jsonb, 30, true);

insert into routing_rules (id, campaign_id, rule_type, config, priority, active)
values ('44444444-4444-4444-8444-000000000002', '11111111-1111-4111-8111-111111111111', 'time'::rule_type, '{"hours":[11,12,13,14],"multiplier_by_level":{"2":0.8}}'::jsonb, 20, true);

insert into routing_rules (id, campaign_id, rule_type, config, priority, active)
values ('44444444-4444-4444-8444-000000000005', '11111111-1111-4111-8111-111111111111', 'time'::rule_type, '{"meal_bands":{"morning":[7,8,9,10],"lunch":[11,12,13,14],"snack":[14,15,16,17],"dinner":[17,18,19,20,21]},"meal_in_band":2,"meal_off_band":0.25}'::jsonb, 25, true);

insert into routing_rules (id, campaign_id, rule_type, config, priority, active)
values ('44444444-4444-4444-8444-000000000006', '11111111-1111-4111-8111-111111111111', 'time'::rule_type, '{"closed_multiplier":0.05,"closing_soon_hours":1,"closing_soon_multiplier":0.4}'::jsonb, 10, true);

insert into routing_rules (id, campaign_id, rule_type, config, priority, active)
values ('44444444-4444-4444-8444-000000000003', '11111111-1111-4111-8111-111111111111', 'random'::rule_type, '{"jitter":0.5}'::jsonb, 90, true);
