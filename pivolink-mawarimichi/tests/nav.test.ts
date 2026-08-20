import { afterEach, describe, expect, it } from "vitest";

import { activeNavProvider, walkingDirectionsUrl } from "@/lib/nav";

const SPOT = { lat: 34.997, lng: 135.7721, slug: "rokuhara", name: "六波羅蜜寺" };
const IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)";
const ANDROID = "Mozilla/5.0 (Linux; Android 14)";

afterEach(() => {
  delete process.env.MAP_NAV_URL_TEMPLATE;
});

describe("walkingDirectionsUrl", () => {
  it("既定は Google マップの徒歩ルート", () => {
    const url = walkingDirectionsUrl(SPOT, ANDROID);
    expect(url).toContain("google.com/maps/dir/");
    expect(url).toContain("destination=34.997,135.7721");
    expect(url).toContain("travelmode=walking");
  });

  it("iOS は Apple マップに出し分ける（Google マップ未導入でも開ける）", () => {
    expect(walkingDirectionsUrl(SPOT, IOS)).toContain("maps.apple.com");
  });

  it("外部デジタルマップのテンプレートがあれば、そちらを優先する", () => {
    process.env.MAP_NAV_URL_TEMPLATE = "https://maps.example.jp/kyoto/?lat={lat}&lng={lng}&spot={slug}";
    const url = walkingDirectionsUrl(SPOT, ANDROID);
    expect(url).toBe("https://maps.example.jp/kyoto/?lat=34.997&lng=135.7721&spot=rokuhara");
  });

  it("外部テンプレートは iOS でも同じものを返す（地図を統一するため）", () => {
    process.env.MAP_NAV_URL_TEMPLATE = "https://maps.example.jp/?lat={lat}&lng={lng}";
    expect(walkingDirectionsUrl(SPOT, IOS)).toBe("https://maps.example.jp/?lat=34.997&lng=135.7721");
  });

  it("{lat}/{lng} を含まないテンプレートは無視する（座標が渡らないリンクを作らない）", () => {
    process.env.MAP_NAV_URL_TEMPLATE = "https://maps.example.jp/kyoto/";
    expect(walkingDirectionsUrl(SPOT, ANDROID)).toContain("google.com/maps/dir/");
  });

  it("スポット名は URL エスケープされる", () => {
    process.env.MAP_NAV_URL_TEMPLATE = "https://maps.example.jp/?lat={lat}&lng={lng}&n={name}";
    expect(walkingDirectionsUrl(SPOT, ANDROID)).toContain("n=%E5%85%AD%E6%B3%A2%E7%BE%85%E8%9C%9C%E5%AF%BA");
  });

  it("activeNavProvider が現在の経路を返す", () => {
    expect(activeNavProvider(ANDROID)).toBe("google");
    expect(activeNavProvider(IOS)).toBe("apple");
    process.env.MAP_NAV_URL_TEMPLATE = "https://maps.example.jp/?lat={lat}&lng={lng}";
    expect(activeNavProvider(IOS)).toBe("custom");
  });
});

describe("スポット個別のデジタルマップURL", () => {
  it("スポットに登録されたURLが最優先される", () => {
    process.env.MAP_NAV_URL_TEMPLATE = "https://maps.example.jp/?lat={lat}&lng={lng}";
    const url = walkingDirectionsUrl(
      { ...SPOT, mapUrl: "https://maps.smartpr.jp/kyoto/spot/12345" },
      ANDROID,
    );
    expect(url).toBe("https://maps.smartpr.jp/kyoto/spot/12345");
  });

  it("https 以外は無視して標準の地図に戻す", () => {
    const url = walkingDirectionsUrl({ ...SPOT, mapUrl: "javascript:alert(1)" }, ANDROID);
    expect(url).toContain("google.com/maps/dir/");
  });

  it("未登録のスポットは従来どおり", () => {
    expect(walkingDirectionsUrl({ ...SPOT, mapUrl: null }, IOS)).toContain("maps.apple.com");
  });
});
