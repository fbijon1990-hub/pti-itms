import { signIn, signUp } from "./actions";

export default function LoginPage({
  searchParams
}: {
  searchParams: { error?: string; message?: string };
}) {
  return (
    <main className="min-h-screen grid place-items-center p-6 bg-green-ink">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-gold grid place-items-center text-green-ink font-bold text-xl h-serif">
            PTI
          </div>
          <h1 className="text-white text-2xl font-bold h-serif">Training Management System</h1>
          <p className="text-white/70 text-sm mt-1">Parliamentary Training Institute, Ghana</p>
        </div>

        <div className="card card-pad">
          {searchParams.error && (
            <p className="badge-bad w-full justify-center mb-3 py-2">{searchParams.error}</p>
          )}
          {searchParams.message && (
            <p className="badge-ok w-full justify-center mb-3 py-2">{searchParams.message}</p>
          )}

          <form className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required className="field" placeholder="you@parliament.gh" />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required className="field" placeholder="********" />
            </div>
            <div className="flex gap-2">
              <button formAction={signIn} className="btn-primary flex-1">Sign in</button>
              <button formAction={signUp} className="btn-ghost flex-1">Create account</button>
            </div>
          </form>
        </div>
        <p className="text-white/50 text-xs text-center mt-4">
          Access is restricted to authorised PTI staff.
        </p>
      </div>
    </main>
  );
}
