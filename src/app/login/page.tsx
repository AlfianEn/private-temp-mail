import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidAccessCookie, ACCESS_COOKIE_NAME } from "@/lib/access";
import { LoginForm } from "./login-form";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = params.next || "/";
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

  if (isValidAccessCookie(accessCookie)) {
    redirect(next.startsWith("/") ? next : "/");
  }

  return (
    <main className="min-h-dvh bg-slate-950 px-4 py-6 text-slate-50 sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-cyan-950/20 backdrop-blur md:grid-cols-[1.1fr_0.9fr]">
          <div className="relative hidden overflow-hidden border-r border-white/10 bg-gradient-to-br from-cyan-500/15 via-slate-950 to-slate-950 p-8 md:block lg:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_28%)]" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  private-temp-mail
                </div>
                <h1 className="mt-6 max-w-md text-4xl font-bold tracking-tight text-slate-50">
                  Akses private untuk inbox sementara dan OTP.
                </h1>
                <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
                  Login sekali, lalu buka generator inbox, riwayat email, dan verifikasi OTP tanpa ribet.
                </p>
              </div>
              <div className="grid max-w-md gap-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">Private access link per inbox</div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">Simpan email sampai 30 hari</div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">Deteksi OTP otomatis</div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300 md:hidden">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              private-temp-mail
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Akses terlindungi</h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">
              Masukkan password untuk membuka generator inbox, riwayat email, dan fitur OTP internal.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">Akses private</span>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">Link inbox JWT</span>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">Deteksi OTP</span>
            </div>
            <LoginForm next={next} />
          </div>
        </div>
      </div>
    </main>
  );
}
