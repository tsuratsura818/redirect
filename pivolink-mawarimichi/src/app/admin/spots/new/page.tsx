import Link from "next/link";
import { redirect } from "next/navigation";

import { createSpotAction } from "@/app/admin/spots/actions";
import { SpotForm } from "@/components/SpotForm";
import { isAdmin } from "@/lib/admin";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function NewSpotPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { error } = await searchParams;
  const kind = getStore().kind;

  return (
    <main className="min-h-dvh bg-neutral-100 p-6 text-neutral-900">
      <div className="mx-auto max-w-3xl space-y-5">
        <header>
          <Link href="/admin" className="text-xs text-neutral-500 underline">
            ← ダッシュボードへ
          </Link>
          <h1 className="mt-2 text-xl font-semibold">スポットを追加</h1>
          <p className="mt-1 text-xs text-neutral-500">
            追加すると即座に抽選の対象になります（公開をONにした場合）。
            QRトークンは自動で採番されるので、保存後に「QR発行」から現地用のQRを出してください。
          </p>
        </header>

        {kind !== "supabase" ? (
          <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
            DB未接続（{kind}モード）のため、追加しても保存されません。Supabaseを接続してください。
          </p>
        ) : null}
        {error ? <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p> : null}

        <SpotForm action={createSpotAction} submitLabel="このスポットを追加" />
      </div>
    </main>
  );
}
