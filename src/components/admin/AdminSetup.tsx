import Link from 'next/link';
import EndGrain from '../EndGrain';

const REASONS: Record<string, { title: string; body: string }> = {
  'no-admin': {
    title: 'Admin panel is not switched on yet',
    body: 'Nobody can sign in until you say who is allowed to. Pick one of the two routes below, then reload this page.',
  },
};

export default function AdminSetup({ reason = 'no-admin' }: { reason?: string }) {
  const r = REASONS[reason] ?? REASONS['no-admin'];

  return (
    <div className="shell relative py-20">
      <EndGrain className="pointer-events-none absolute right-0 top-10 h-96 w-96 text-patina opacity-[0.12]" animate={false} />

      <div className="relative mx-auto max-w-2xl">
        <p className="stamp">Setup required</p>
        <h1 className="mt-3 font-display text-4xl leading-tight">{r.title}</h1>
        <p className="mt-4 text-base leading-relaxed text-muted">{r.body}</p>

        <div className="mt-10 space-y-4">
          <Step
            n={1}
            title="Option A — Google account allowlist (recommended)"
            body="Koi password store nahi hota. Sirf wo Google accounts andar aa sakte hain jo tum list karo."
            code={'ADMIN_EMAILS="you@woodhub.pk,ops@woodhub.pk"\nNEXT_PUBLIC_GOOGLE_CLIENT_ID="...apps.googleusercontent.com"'}
          />
          <Step
            n={2}
            title="Option B — shared password"
            body="Jaldi shuru karne ke liye theek hai. Lamba aur random rakhna."
            code={'ADMIN_PASSWORD="a-long-random-string"'}
          />
          <Step
            n={3}
            title="Then connect the database"
            body="Supabase project banao, supabase-schema.sql chalao, phir ye do values daal do."
            code={'SUPABASE_URL="https://xxxx.supabase.co"\nSUPABASE_SERVICE_ROLE_KEY="service-role-key"\nAUTH_SECRET="openssl rand -base64 32 se banao"'}
          />
        </div>

        <p className="mt-10 text-sm text-muted">
          Poori tafseel <code className="font-mono text-2xs text-patina">README.md</code> me hai.{' '}
          <Link href="/" className="text-patina underline underline-offset-4">Back to the shop</Link>
        </p>
      </div>
    </div>
  );
}

function Step({ n, title, body, code }: { n: number; title: string; body: string; code: string }) {
  return (
    <div className="card p-6">
      <div className="flex gap-4">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-patina/50 font-mono text-2xs text-patina">
          {n}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg">{title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
          <pre className="mt-4 overflow-x-auto rounded-xl border border-edge bg-ink p-4 font-mono text-xs leading-relaxed text-patina-soft">
{code}
          </pre>
        </div>
      </div>
    </div>
  );
}
