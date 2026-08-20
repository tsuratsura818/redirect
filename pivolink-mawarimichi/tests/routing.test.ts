import { describe, expect, it } from "vitest";

import { seedCampaign, seedGoals, seedRules, seedSpots } from "@/data/seed";
import { distM } from "@/lib/geo";
import { isOpenAt } from "@/lib/hours";
import { seededRng } from "@/lib/rng";
import { pickChoices, type RoutableSpot } from "@/lib/routing";

const SPOTS: RoutableSpot[] = seedSpots.map((s) => ({
  id: s.id,
  slug: s.slug,
  lat: s.lat,
  lng: s.lng,
  capacity_weight: s.capacity_weight,
  congestion_level: s.congestion_level,
  is_collab: s.is_collab,
  meal_times: s.meal_times ?? [],
  open_hours: s.open_hours ?? null,
}));

const START = { lat: seedCampaign.start_lat, lng: seedCampaign.start_lng };

/**
 * ★受け入れ基準（二択破綻0・ユニークルート400通り以上）は「運用時間帯」で見る。
 *   営業時間を入れた結果、17時以降は開いているスポットが13件中3件しか無く、
 *   5つの寄り道は物理的に成立しない。そこで基準を満たすことを求めるのは、
 *   「閉まっている場所へ送れ」と言うのと同じになる。
 *   実測（scripts/simulate-routing.ts）:
 *     7時=2件  8時=4件  9時=8件  10〜16時=11〜12件  17時=6件  18〜21時=2〜3件
 *   夜の挙動は別テスト（下の「開いている場所が足りない時間帯」）で仕様として固定する。
 */
const OPERATING_HOURS = [9, 10, 11, 12, 13, 14, 15, 16];
const TOLERANCE = seedCampaign.detour_tolerance_m;
const STAMP_TARGET = seedCampaign.stamp_target;

/** 1周ぶんのシミュレート。参加者は提示された二択からランダムに選ぶ想定 */
function walkOnce(goal: { lat: number; lng: number }, rng: () => number) {
  let from = START;
  let currentSpotId: string | null = null;
  let previousSlug: string | null = null;
  const visited: string[] = [];
  const route: string[] = [];
  let brokenChoice = 0;

  for (let step = 0; step < STAMP_TARGET; step++) {
    const res = pickChoices({
      from,
      goal,
      spots: SPOTS,
      visitedIds: visited,
      currentSpotId,
      toleranceM: TOLERANCE,
      rules: seedRules,
      hourJst: 13,
      previousSlug,
      rng,
    });

    // 二択破綻 = 2件そろわない / 同じスポットが2回出る
    if (res.choices.length !== 2 || res.choices[0].spot.id === res.choices[1].spot.id) {
      brokenChoice++;
      if (res.choices.length === 0) break;
    }

    const taken = res.choices[Math.floor(rng() * res.choices.length)];
    visited.push(taken.spot.id);
    route.push(taken.spot.slug);
    previousSlug = taken.spot.slug;
    currentSpotId = taken.spot.id;
    from = { lat: taken.spot.lat, lng: taken.spot.lng };
  }

  const walked =
    route.reduce((sum, slug, i) => {
      const spot = SPOTS.find((s) => s.slug === slug)!;
      const prev = i === 0 ? START : SPOTS.find((s) => s.slug === route[i - 1])!;
      return sum + distM(prev, spot);
    }, 0) + distM(from, goal);

  return { route, brokenChoice, walked, direct: distM(START, goal) };
}

describe("pickChoices — 受け入れ基準（要件定義 §5-2）", () => {
  // シードを1つに固定すると「たまたま通る」状態になりうるので複数シードで回す。
  // hourJst=13 は time ルールのピーク帯 = ルートが最も収束する最悪条件。
  const SEEDS = [20260803, 1000, 8919];

  it.each(SEEDS)("3目的地 × 各1000周で、二択破綻0件・ユニークルート400通り以上 (seed=%i)", (seed) => {
    for (const goal of seedGoals) {
      const rng = seededRng(seed);
      const routes = new Set<string>();
      let broken = 0;
      const detourRates: number[] = [];

      for (let i = 0; i < 1000; i++) {
        const r = walkOnce(goal, rng);
        broken += r.brokenChoice;
        expect(r.route).toHaveLength(STAMP_TARGET);
        routes.add(r.route.join(">"));
        detourRates.push((r.walked / r.direct) * 100);
      }

      const median = detourRates.sort((a, b) => a - b)[Math.floor(detourRates.length / 2)];

      expect(broken, `${goal.slug}: 二択破綻`).toBe(0);
      expect(routes.size, `${goal.slug}: ユニークルート`).toBeGreaterThanOrEqual(400);
      // 「まわりみち率」がそもそも成立している（最短より確実に遠回りしている）
      expect(median, `${goal.slug}: まわりみち率中央値`).toBeGreaterThan(150);
    }
  });
});

describe("pickChoices — 回廊制約", () => {
  const goal = { lat: seedGoals[0].lat, lng: seedGoals[0].lng };

  it("訪問済み・現在地のスポットは候補に出ない", () => {
    const rng = seededRng(7);
    const visited = [SPOTS[0].id, SPOTS[1].id];
    const current = SPOTS[2].id;

    for (let i = 0; i < 200; i++) {
      const res = pickChoices({
        from: SPOTS[2],
        goal,
        spots: SPOTS,
        visitedIds: visited,
        currentSpotId: current,
        toleranceM: TOLERANCE,
        rng,
      });
      for (const c of res.choices) {
        expect(visited).not.toContain(c.spot.id);
        expect(c.spot.id).not.toBe(current);
      }
    }
  });

  it("回廊が成立しているときは tolerance を超える候補を出さない", () => {
    const rng = seededRng(99);
    let checked = 0;

    for (let i = 0; i < 300; i++) {
      const res = pickChoices({
        from: START,
        goal,
        spots: SPOTS,
        toleranceM: TOLERANCE,
        rng,
      });
      if (res.fallback) continue;
      checked++;
      for (const c of res.choices) {
        expect(c.distanceToGoalM).toBeLessThan(res.distanceNowM + TOLERANCE);
      }
    }

    expect(checked).toBeGreaterThan(0);
  });

  it("回廊プールが2未満ならフォールバックして必ず2件返す", () => {
    // tolerance を極端に絞って回廊を壊す
    const res = pickChoices({
      from: START,
      goal,
      spots: SPOTS,
      toleranceM: -100000,
      rng: seededRng(1),
    });
    expect(res.fallback).toBe(true);
    expect(res.choices).toHaveLength(2);
  });

  it("残りスポットが1件しかなければ1件だけ返す（呼び出し側で判定できる）", () => {
    // 「1件を残して全部訪問済み」— スポットを増やしても壊れないよう件数から引く
    const visited = SPOTS.slice(0, SPOTS.length - 1).map((s) => s.id);
    const res = pickChoices({
      from: START,
      goal,
      spots: SPOTS,
      visitedIds: visited,
      rng: seededRng(1),
    });
    expect(res.choices).toHaveLength(1);
  });
});

describe("pickChoices — 重み付け", () => {
  const goal = { lat: seedGoals[0].lat, lng: seedGoals[0].lng };

  it("capacity_weight を上げたスポットの出現率が上がる（管理画面の重み調整が効く）", () => {
    const target = SPOTS.find((s) => s.slug === "kenninji")!;
    const count = (weight: number) => {
      const spots = SPOTS.map((s) => (s.id === target.id ? { ...s, capacity_weight: weight } : s));
      const rng = seededRng(4242);
      let hits = 0;
      for (let i = 0; i < 2000; i++) {
        const res = pickChoices({ from: START, goal, spots, toleranceM: TOLERANCE, rng });
        if (res.choices.some((c) => c.spot.id === target.id)) hits++;
      }
      return hits;
    };

    expect(count(4.0)).toBeGreaterThan(count(1.0));
  });

  it("congestion ルールで混雑スポットが抑制される", () => {
    const busy = SPOTS.filter((s) => s.congestion_level === 2).map((s) => s.id);
    const rule = {
      id: "r",
      campaign_id: "c",
      rule_type: "congestion" as const,
      config: { multiplier_by_level: { "2": 0.01 } },
      priority: 0,
      active: true,
    };

    const hits = (rules: typeof seedRules) => {
      const rng = seededRng(555);
      let n = 0;
      for (let i = 0; i < 1000; i++) {
        const res = pickChoices({ from: START, goal, spots: SPOTS, toleranceM: TOLERANCE, rules, rng });
        if (res.choices.some((c) => busy.includes(c.spot.id))) n++;
      }
      return n;
    };

    expect(hits([rule])).toBeLessThan(hits([]));
  });

  it("time ルールは指定時間帯の外では効かない", () => {
    const rule = {
      id: "r",
      campaign_id: "c",
      rule_type: "time" as const,
      config: { hours: [11, 12], multiplier_by_level: { "2": 0.01 } },
      priority: 0,
      active: true,
    };
    const busy = SPOTS.filter((s) => s.congestion_level === 2).map((s) => s.id);

    const hits = (hourJst: number) => {
      const rng = seededRng(31337);
      let n = 0;
      for (let i = 0; i < 1000; i++) {
        const res = pickChoices({
          from: START,
          goal,
          spots: SPOTS,
          toleranceM: TOLERANCE,
          rules: [rule],
          hourJst,
          rng,
        });
        if (res.choices.some((c) => busy.includes(c.spot.id))) n++;
      }
      return n;
    };

    expect(hits(12)).toBeLessThan(hits(18));
  });

  it("全候補の重みが0でも二択は返る（ルール設定ミスで体験が止まらない）", () => {
    const rule = {
      id: "r",
      campaign_id: "c",
      rule_type: "congestion" as const,
      config: { multiplier_by_level: { "0": 0, "1": 0, "2": 0 } },
      priority: 0,
      active: true,
    };
    const res = pickChoices({
      from: START,
      goal,
      spots: SPOTS,
      toleranceM: TOLERANCE,
      rules: [rule],
      rng: seededRng(8),
    });
    expect(res.choices).toHaveLength(2);
  });
});

describe("混雑の自動連動（スキャンログ密度）", () => {
  const goal = { lat: seedGoals[0].lat, lng: seedGoals[0].lng };
  const liveRule = {
    id: "live",
    campaign_id: "c",
    rule_type: "congestion" as const,
    config: {
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
  };

  const appearRate = (recentScans: Record<string, number>, slug: string) => {
    const rng = seededRng(20260818);
    let hit = 0;
    const N = 2000;
    for (let i = 0; i < N; i++) {
      const res = pickChoices({
        from: START,
        goal,
        spots: SPOTS,
        toleranceM: TOLERANCE,
        rules: [liveRule],
        recentScans,
        rng,
      });
      if (res.choices.some((c) => c.spot.slug === slug)) hit++;
    }
    return hit / N;
  };

  it("誰も来ていなければ何も起きない（全スポット同じ倍率）", () => {
    const target = SPOTS.find((s) => s.slug === "kawai")!;
    const idle = appearRate({}, "kawai");
    const noRule = (() => {
      const rng = seededRng(20260818);
      let hit = 0;
      for (let i = 0; i < 2000; i++) {
        const res = pickChoices({ from: START, goal, spots: SPOTS, toleranceM: TOLERANCE, rng });
        if (res.choices.some((c) => c.spot.id === target.id)) hit++;
      }
      return hit / 2000;
    })();
    expect(Math.abs(idle - noRule)).toBeLessThan(0.02);
  });

  it("人が集まったスポットは自動で出にくくなる", () => {
    const target = SPOTS.find((s) => s.slug === "kawai")!;
    const before = appearRate({}, "kawai");
    const after = appearRate({ [target.id]: 12 }, "kawai"); // 直近60分に12人
    expect(after).toBeLessThan(before * 0.5);
  });

  it("抑制されたぶん、空いているスポットへ流れる", () => {
    const busy = SPOTS.find((s) => s.slug === "kawai")!;
    const quiet = "rokudo";
    const before = appearRate({}, quiet);
    const after = appearRate({ [busy.id]: 12 }, quiet);
    expect(after).toBeGreaterThan(before);
  });

  it("受入キャパが大きい場所は、同じ人数でも混雑とみなされにくい", () => {
    const target = SPOTS.find((s) => s.slug === "kawai")!;
    const bigSpots = SPOTS.map((s) => (s.id === target.id ? { ...s, capacity_weight: 4 } : s));
    const rate = (spots: typeof SPOTS) => {
      const rng = seededRng(777);
      let hit = 0;
      for (let i = 0; i < 2000; i++) {
        const res = pickChoices({
          from: START, goal, spots, toleranceM: TOLERANCE,
          rules: [liveRule], recentScans: { [target.id]: 8 }, rng,
        });
        if (res.choices.some((c) => c.spot.id === target.id)) hit++;
      }
      return hit / 2000;
    };
    // 同じ8人でも、キャパ4なら密度2 → 抑制なし。キャパ1なら密度8 → 0.45倍
    expect(rate(bigSpots)).toBeGreaterThan(rate(SPOTS));
  });

  it("混雑連動を入れても受け入れ基準（二択破綻0・ユニークルート400+）を満たす", () => {
    const rng = seededRng(4649);
    const routes = new Set<string>();
    let broken = 0;
    for (let i = 0; i < 1000; i++) {
      let from = START;
      let currentSpotId: string | null = null;
      const visited: string[] = [];
      const route: string[] = [];
      for (let step = 0; step < STAMP_TARGET; step++) {
        const res = pickChoices({
          from, goal, spots: SPOTS, visitedIds: visited, currentSpotId,
          toleranceM: TOLERANCE, rules: [...seedRules], hourJst: 13,
          recentScans: {}, rng,
        });
        if (res.choices.length !== 2) broken++;
        if (!res.choices.length) break;
        const taken = res.choices[Math.floor(rng() * res.choices.length)];
        visited.push(taken.spot.id);
        route.push(taken.spot.slug);
        currentSpotId = taken.spot.id;
        from = { lat: taken.spot.lat, lng: taken.spot.lng };
      }
      routes.add(route.join(">"));
    }
    expect(broken).toBe(0);
    expect(routes.size).toBeGreaterThanOrEqual(400);
  });
});

describe("食べどき（飲食スポットの時間帯連動）", () => {
  const MEAL_RULE = seedRules.filter(
    (r) => r.rule_type === "time" && "meal_bands" in r.config,
  );
  const GOAL = { lat: seedGoals[0].lat, lng: seedGoals[0].lng };

  /** 指定時刻で1手だけ抽選し、そのスポットの重みを返す */
  function weightAt(slug: string, hour: number) {
    const res = pickChoices({
      from: START,
      goal: GOAL,
      spots: SPOTS,
      toleranceM: 100_000, // 全スポットを回廊に入れて重みだけを比べる
      rules: MEAL_RULE,
      hourJst: hour,
      count: SPOTS.length,
      rng: seededRng(7),
    });
    const hit = res.choices.find((c) => c.spot.slug === slug);
    if (!hit) throw new Error(`${slug} が候補に出ていない`);
    return hit.weight;
  }

  it("ルールが seed に入っている", () => {
    expect(MEAL_RULE.length).toBe(1);
  });

  it("ランチの店は昼に重くなり、朝は軽くなる", () => {
    expect(weightAt("nanakamado", 12)).toBeGreaterThan(weightAt("nanakamado", 9));
  });

  it("夜だけの店は昼に沈む（朝10時に居酒屋を出さない）", () => {
    expect(weightAt("miyakoroji", 10)).toBeLessThan(weightAt("miyakoroji", 19));
  });

  it("朝の喫茶は夜に沈む", () => {
    expect(weightAt("asagiri", 8)).toBeGreaterThan(weightAt("asagiri", 20));
  });

  it("複数の帯を持つ店は、そのどれかに入っていれば重い", () => {
    // みずのわ: morning / lunch / snack
    const dinner = weightAt("mizunowa", 20);
    for (const h of [8, 12, 16]) expect(weightAt("mizunowa", h)).toBeGreaterThan(dinner);
  });

  it("飲食スポットでない場所は時刻で動かない", () => {
    for (const h of [8, 12, 19]) {
      expect(weightAt("rokuhara", h)).toBeCloseTo(weightAt("rokuhara", 13), 6);
    }
  });

  it("食べどきを入れても受け入れ基準を満たす（運用時間帯で二択破綻0・ユニーク400+）", () => {
    for (const hour of OPERATING_HOURS) {
      const rng = seededRng(20260818 + hour);
      const routes = new Set<string>();
      let broken = 0;
      for (let i = 0; i < 1000; i++) {
        let from = START;
        let currentSpotId: string | null = null;
        const visited: string[] = [];
        const route: string[] = [];
        for (let step = 0; step < STAMP_TARGET; step++) {
          const res = pickChoices({
            from,
            goal: GOAL,
            spots: SPOTS,
            visitedIds: visited,
            currentSpotId,
            toleranceM: TOLERANCE,
            rules: seedRules,
            hourJst: hour,
            rng,
          });
          if (res.choices.length !== 2) broken++;
          if (!res.choices.length) break;
          const taken = res.choices[Math.floor(rng() * res.choices.length)];
          visited.push(taken.spot.id);
          route.push(taken.spot.slug);
          currentSpotId = taken.spot.id;
          from = { lat: taken.spot.lat, lng: taken.spot.lng };
        }
        routes.add(route.join(">"));
      }
      expect(broken, `hour=${hour} で二択破綻`).toBe(0);
      expect(routes.size, `hour=${hour} のユニークルート`).toBeGreaterThanOrEqual(400);
    }
  });
});

describe("開いている時間（拝観・営業）", () => {
  const HOURS_RULE = seedRules.filter(
    (r) => r.rule_type === "time" && "closed_multiplier" in r.config,
  );
  const GOAL = { lat: seedGoals[0].lat, lng: seedGoals[0].lng };

  function weightAt(slug: string, hour: number) {
    const res = pickChoices({
      from: START,
      goal: GOAL,
      spots: SPOTS,
      toleranceM: 100_000,
      rules: HOURS_RULE,
      hourJst: hour,
      count: SPOTS.length,
      rng: seededRng(7),
    });
    const hit = res.choices.find((c) => c.spot.slug === slug);
    if (!hit) throw new Error(`${slug} が候補に出ていない`);
    return hit.weight;
  }

  it("ルールが seed に入っている", () => {
    expect(HOURS_RULE.length).toBe(1);
  });

  it("閉まっている時間はほぼ提示されない", () => {
    // 六道珍皇寺 9〜16時
    expect(weightAt("rokudo", 18)).toBeLessThan(weightAt("rokudo", 12) * 0.1);
    expect(weightAt("rokudo", 7)).toBeLessThan(weightAt("rokudo", 12) * 0.1);
  });

  it("閉まる1時間前から下がる（着く頃には閉まっている、を防ぐ）", () => {
    const soon = weightAt("rokudo", 15); // 16時閉館の1時間前
    const open = weightAt("rokudo", 12);
    expect(soon).toBeLessThan(open);
    expect(soon).toBeGreaterThan(weightAt("rokudo", 17)); // 閉館後よりは高い
  });

  it("終日開いている場所は時刻で動かない（安井金比羅宮）", () => {
    for (const h of [7, 12, 22]) {
      expect(weightAt("yasui", h)).toBeCloseTo(weightAt("yasui", 15), 6);
    }
  });

  it("夜だけ開く店は昼に沈み、夜に出る（居酒屋 17〜23時）", () => {
    expect(weightAt("miyakoroji", 12)).toBeLessThan(weightAt("miyakoroji", 19) * 0.1);
  });

  it("全スポットの営業時間が形として正しい", () => {
    for (const s of seedSpots) {
      if (!s.open_hours) continue;
      expect(s.open_hours.to, `${s.slug}: to <= from`).toBeGreaterThan(s.open_hours.from);
      expect(s.open_hours.from).toBeGreaterThanOrEqual(0);
      expect(s.open_hours.to).toBeLessThanOrEqual(24);
    }
  });

  it("レアスタンプの時間窓が営業時間の外に出ていない", () => {
    // 開いていない時間にしか取れないレアスタンプは、誰も取れない
    for (const s of seedSpots) {
      const win = s.rare_config?.time_window;
      if (!win || !s.open_hours) continue;
      expect(win[0], `${s.slug}: レア窓の開始が開館前`).toBeGreaterThanOrEqual(s.open_hours.from);
      expect(win[1], `${s.slug}: レア窓の終了が閉館後`).toBeLessThanOrEqual(s.open_hours.to);
    }
  });

  it("全ルール込み・運用時間帯（9〜16時）で受け入れ基準を満たす", () => {
    for (const hour of OPERATING_HOURS) {
      const rng = seededRng(31337 + hour);
      const routes = new Set<string>();
      let broken = 0;
      for (let i = 0; i < 1000; i++) {
        let from = START;
        let currentSpotId: string | null = null;
        const visited: string[] = [];
        const route: string[] = [];
        for (let step = 0; step < STAMP_TARGET; step++) {
          const res = pickChoices({
            from,
            goal: GOAL,
            spots: SPOTS,
            visitedIds: visited,
            currentSpotId,
            toleranceM: TOLERANCE,
            rules: seedRules,
            hourJst: hour,
            rng,
          });
          if (res.choices.length !== 2) broken++;
          if (!res.choices.length) break;
          const taken = res.choices[Math.floor(rng() * res.choices.length)];
          visited.push(taken.spot.id);
          route.push(taken.spot.slug);
          currentSpotId = taken.spot.id;
          from = { lat: taken.spot.lat, lng: taken.spot.lng };
        }
        routes.add(route.join(">"));
      }
      expect(broken, `hour=${hour} で二択破綻`).toBe(0);
      expect(routes.size, `hour=${hour} のユニークルート`).toBeGreaterThanOrEqual(400);
    }
  });
});

describe("開いている場所が足りない時間帯（早朝・夜）", () => {
  const GOAL = { lat: seedGoals[0].lat, lng: seedGoals[0].lng };

  it("夜は開いているスポットがスタンプ数に足りない — これは仕様", () => {
    // 参加者に「いま巡れません」と伝えるための根拠。
    // ここが変わった（＝夜に開くスポットを増やした）なら、
    // 目的地選択画面の注意文と docs/hours-guide.md も更新すること。
    const openAt = (h: number) =>
      seedSpots.filter((s) => s.active && isOpenAt(s.open_hours, h)).length;

    expect(openAt(19)).toBeLessThan(STAMP_TARGET);
    expect(openAt(7)).toBeLessThan(STAMP_TARGET);
    expect(openAt(12)).toBeGreaterThanOrEqual(STAMP_TARGET);
  });

  it("それでもエンジンは止まらない（二択は返り続ける）", () => {
    // 開いている場所が足りなくても、画面が壊れてはいけない。
    // 閉店ペナルティは 0 ではなく 0.05 なので、フォールバックで必ず候補は出る。
    for (const hour of [6, 7, 18, 19, 22]) {
      const rng = seededRng(777 + hour);
      for (let i = 0; i < 200; i++) {
        let from = START;
        let currentSpotId: string | null = null;
        const visited: string[] = [];
        for (let step = 0; step < STAMP_TARGET; step++) {
          const res = pickChoices({
            from,
            goal: GOAL,
            spots: SPOTS,
            visitedIds: visited,
            currentSpotId,
            toleranceM: TOLERANCE,
            rules: seedRules,
            hourJst: hour,
            rng,
          });
          expect(res.choices.length, `hour=${hour} で候補が出ない`).toBe(2);
          const taken = res.choices[Math.floor(rng() * res.choices.length)];
          visited.push(taken.spot.id);
          currentSpotId = taken.spot.id;
          from = { lat: taken.spot.lat, lng: taken.spot.lng };
        }
      }
    }
  });
});
