import { LoginForm } from "./login-form";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = params.next || "/";

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center">
        <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/20">
          <p className="mb-2 text-sm font-medium text-cyan-400">private-temp-mail</p>
          <h1 className="text-2xl font-bold tracking-tight">Protected access</h1>
          <p className="mt-2 text-sm text-slate-400">Masukkan password untuk membuka inbox generator dan riwayat email.</p>
          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}
