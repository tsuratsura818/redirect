import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 親フォルダ（pivolink 本体）の lockfile を拾わせない。
  // これを指定しないと Turbopack がワークスペースルートを誤検出する
  turbopack: { root: path.resolve(process.cwd()) },
  outputFileTracingRoot: path.resolve(process.cwd()),
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
