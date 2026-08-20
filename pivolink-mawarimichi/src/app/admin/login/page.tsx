import { adminLoginAction } from "@/app/admin/actions";
import { adminGate } from "@/lib/admin";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const gate = adminGate();

  return (
    <main className="min-h-dvh grid place-items-center bg-neutral-100 p-6">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold">まわりみち 管理</h1>
        <p className="mt-1 text-xs text-neutral-500">Pivolink / MAWARIMICHI ADMIN</p>

        {gate.ok ? (
          <form action={adminLoginAction} className="mt-5 space-y-3">
            <input
              type="password"
              name="password"
              required
              autoFocus
              placeholder="パスワード"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
            {error ? <p className="text-xs text-red-600">パスワードが違います</p> : null}
            <button
              type="submit"
              className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-sm font-semibold text-white"
            >
              ログイン
            </button>
            {gate.devDefault ? (
              <p className="rounded-md bg-amber-50 p-2 text-xs text-amber-800">
                ADMIN_PASSWORD が未設定です。開発用の既定値
                <code className="mx-1 font-mono">mawarimichi</code>
                でログインできます。本番デプロイ前に必ず設定してください。
              </p>
            ) : null}
          </form>
        ) : (
          <p className="mt-5 rounded-md bg-red-50 p-3 text-xs text-red-700">
            ADMIN_PASSWORD が未設定のため、管理画面は無効化されています（fail-closed）。
            環境変数を設定して再デプロイしてください。
          </p>
        )}
      </div>
    </main>
  );
}
