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
        <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
            private-temp-mail
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Protected access</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Masukkan password untuk membuka inbox generator, riwayat email, dan fitur OTP internal.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">Private access</span>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">JWT inbox link</span>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">OTP detection</span>
          </div>
          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}
