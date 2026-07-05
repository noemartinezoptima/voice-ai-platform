import { useEffect, useState, useRef, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function FadeIn({ children, delay = 0, className = '' }) {
  const [ref, visible] = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const sections = ['Platform', 'Features', 'How It Works', 'Trust', 'Pricing', 'FAQ'];

export default function Welcome({ canLogin, canRegister }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = useCallback((label) => {
    setMobileOpen(false);
    const map = { platform: 'platform', features: 'features', 'how it works': 'how-it-works', trust: 'trust', pricing: 'pricing', faq: 'faq' };
    const id = map[label.toLowerCase()];
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const features = [
    { title: 'Flow engine', desc: '7 step types: say, ask, LLM, condition, goto, transfer, hangup. Mustache variable rendering, context accumulation, versioned configs.' },
    { title: 'Twilio integration', desc: 'Inbound calls via SIP/PSTN <Connect><Stream> WebSocket. Status callbacks. Media Streams protocol with µ-law 8kHz audio.' },
    { title: 'Deepgram STT', desc: 'Nova-2 model, streaming real-time, 500ms endpointing, multi-language support for global deployments.' },
    { title: 'OpenAI LLM', desc: 'GPT-4o with function calling. Interruption handling with barge-in support. Configurable temperature, max_tokens per flow.' },
    { title: 'ElevenLabs TTS', desc: 'Ultra-realistic voices. MP3 to µ-law 8kHz conversion for Twilio. Streaming latency under 300ms.' },
    { title: 'Visual flow builder', desc: 'Drag-and-drop step editor. Real-time validation. Versioned flow configs with publish workflow.' },
    { title: 'Multi-tenant', desc: 'Tenant-isolated data via tenant_id. Custom domains, branding, and auth per client. Complete white-label isolation.' },
    { title: 'REST API', desc: 'Full CRUD for flows, calls, tenants. Sanctum token auth with scoped permissions. Pagination and filtering.' },
    { title: 'Real-time analytics', desc: 'Live call monitoring via Reverb. Streaming transcripts. Post-call quality scoring.' },
  ];

  const steps = [
    { num: '01', title: 'Connect telephony', body: 'Link a Twilio number or SIP trunk in one click. ZeroVoice handles WebSocket streaming, audio codec conversion, and call tracking.' },
    { num: '02', title: 'Build a flow', body: 'Drag-and-drop steps in the visual editor: say, ask, LLM, condition, transfer. Mustache templates for dynamic context.' },
    { num: '03', title: 'Configure AI', body: 'Pick your LLM (GPT-4o, Claude), STT (Deepgram Nova-2), TTS (ElevenLabs). Configurable per flow with custom prompts.' },
    { num: '04', title: 'Go live', body: 'AI answers calls, follows flows, logs everything. Monitor in real-time from the dashboard with transcripts and analytics.' },
  ];

  const tiers = [
    {
      name: 'Starter', price: '$0.08', unit: '/min',
      features: ['1 phone number', '5 active flows', 'Deepgram STT + OpenAI LLM', 'Real-time monitoring', 'Email support'],
      cta: 'Start building', highlighted: false,
    },
    {
      name: 'Pro', price: '$0.05', unit: '/min',
      features: ['10 phone numbers', 'Unlimited flows', 'ElevenLabs TTS', 'Custom LLM support', 'Real-time dashboard', 'Priority support', 'SSO + RBAC'],
      cta: 'Start free trial', highlighted: true,
    },
    {
      name: 'Enterprise', price: 'Custom', unit: '',
      features: ['Unlimited numbers', 'White-label + custom domain', 'Multi-tenant management', 'SLA 99.9%', 'On-premise option', 'Dedicated engineer', 'SOC 2 / HIPAA ready'],
      cta: 'Talk to sales', highlighted: false,
    },
  ];

  const faqs = [
    { q: 'What telephony providers do you support?', a: 'ZeroVoice integrates with Twilio SIP and PSTN. Inbound calls connect via Media Streams WebSocket. Outbound calls use the Twilio REST API. Additional providers can be added per tenant.' },
    { q: 'Can I use my own LLM?', a: 'Yes. Supports OpenAI GPT-4o by default, plus any OpenAI-compatible provider including Anthropic Claude, Llama, and others. Configurable per flow with custom system prompts and function definitions.' },
    { q: 'Is it white-label?', a: 'Enterprise plans include custom domains, branding (logo, colors, favicon), and isolated auth per tenant. Your clients see your brand.' },
    { q: 'How fast can I deploy?', a: 'Basic voice agent live in minutes via Quickstart. Production with custom flows typically takes 2-4 weeks.' },
    { q: 'What compliance certifications?', a: 'SOC 2 Type II in progress. HIPAA-ready architecture. BAA available for Enterprise. GDPR-compliant by design.' },
  ];

  return (
    <div className="bg-white font-sans text-zinc-900 antialiased">
      <Head title="ZeroVoice — White-label Voice AI for BPOs and SaaS Teams" />

      <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-zinc-200/50 bg-white/80 shadow-xs backdrop-blur-xl' : 'border-transparent bg-transparent'
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight text-zinc-900">
            ZeroVoice
          </Link>
          <div className="hidden items-center gap-8 sm:flex">
            {sections.map((item) => (
              <button key={item} onClick={() => scrollTo(item)} className="text-sm text-zinc-500 transition hover:text-zinc-900">
                {item}
              </button>
            ))}
            {canLogin ? (
              <Link href="/login" className="text-sm text-zinc-500 transition hover:text-zinc-900">
                Log in
              </Link>
            ) : null}
            {canRegister ? (
              <Link href="/register" className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-zinc-800">
                Start building
              </Link>
            ) : null}
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="sm:hidden">
            <svg className="h-6 w-6 text-zinc-700" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"} />
            </svg>
          </button>
        </div>
        {mobileOpen && (
          <div className="border-t border-zinc-200 bg-white/95 backdrop-blur-xl px-4 pb-4 sm:hidden">
            <div className="flex flex-col gap-3 pt-4">
              {sections.map((item) => (
                <button key={item} onClick={() => scrollTo(item)} className="text-left text-sm text-zinc-500">{item}</button>
              ))}
              {canLogin ? <Link href="/login" className="text-sm text-zinc-500">Log in</Link> : null}
              {canRegister ? (
                <Link href="/register" className="inline-block rounded-lg bg-zinc-900 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-xs">Start building</Link>
              ) : null}
            </div>
          </div>
        )}
      </nav>

      <section className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--color-zinc-50),transparent_40%,transparent_60%,var(--color-zinc-50))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.511_0.262_276.966/0.06),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-1 text-xs font-medium text-zinc-600 shadow-xs">
              <span className="size-1.5 rounded-full bg-indigo-500" />
              B2B Voice AI Platform
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
              White-label voice AI for{' '}
              <span className="text-indigo-600">BPOs and SaaS teams</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-500">
              Deploy intelligent voice agents under your brand. Connect any phone number,
              build flows visually, and go live in days — not months.
              Zero telephony infrastructure required.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {canRegister ? (
                <Link href="/register" className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-zinc-800">
                  Start building
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              ) : null}
              <a href="#pricing" className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 shadow-xs transition hover:bg-zinc-50">
                Talk to sales
              </a>
            </div>
            <p className="mt-4 text-xs text-zinc-400">No credit card required · Zero to live call in minutes</p>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-100 bg-zinc-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Trusted by operations teams at</p>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {['Ring', 'Vapi', 'Retell', 'Bland'].map((logo) => (
              <div key={logo} className="flex h-12 items-center justify-center rounded-lg border border-zinc-200 bg-white px-6 shadow-xs">
                <span className="text-sm font-semibold text-zinc-400">{logo}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FadeIn>
        <section id="platform" className="border-t border-zinc-100 bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-xs">Platform</span>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-4xl">What is ZeroVoice?</h2>
              <p className="mt-4 text-lg leading-relaxed text-zinc-500">ZeroVoice is a white-label Voice AI platform that lets BPOs and SaaS companies deploy AI phone agents — without building telephony or AI pipelines from scratch.</p>
            </div>
            <div className="mt-16 grid gap-6 lg:grid-cols-2">
              {[
                { title: 'For BPOs', body: 'Launch AI voice agents under your brand in days. White-label everything — domains, branding, voice personality. Visual flow builder, CRM integration, enterprise compliance.', tags: ['White-label', 'Workflow builder', 'CRM integration', 'Compliance'] },
                { title: 'For SaaS Teams', body: 'Add AI voice to your product with 3 lines of code. Embeddable widget, REST API, usage-based pricing. Your customers get voice without you hiring VoIP engineers.', tags: ['Embeddable widget', 'REST API', 'Usage-based pricing', 'Multi-tenant'] },
              ].map((p) => (
                <div key={p.title} className="rounded-xl border border-zinc-200 bg-white p-8 shadow-xs ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900 dark:ring-white/10">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{p.body}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {p.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={100}>
        <section id="features" className="border-t border-zinc-100 bg-zinc-50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-xs">Features</span>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-4xl">Production-ready voice AI stack</h2>
              <p className="mt-4 text-zinc-500">Every component swappable. Change STT, LLM, or TTS providers per flow.</p>
            </div>
            <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <div key={f.title} className="group rounded-xl border border-zinc-200 bg-white p-6 shadow-xs ring-1 ring-zinc-950/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:ring-white/10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 transition group-hover:bg-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:ring-indigo-900/50">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d={
                        i === 0 ? "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z"
                        : i === 1 ? "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.054-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                        : i === 2 ? "M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                        : i === 3 ? "M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                        : i === 4 ? "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                        : i === 5 ? "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z"
                        : i === 6 ? "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                        : i === 7 ? "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                        : "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                      } />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={100}>
        <section id="how-it-works" className="border-t border-zinc-100 bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-xs">How It Works</span>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-4xl">From zero to live call</h2>
              <p className="mt-4 text-zinc-500">No telephony experience needed. Just connect, configure, and deploy.</p>
            </div>
            <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <div key={s.num} className="relative">
                  {i < steps.length - 1 && <div className="absolute left-6 top-10 hidden h-px w-[calc(100%-3rem)] bg-zinc-200 lg:block" />}
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-lg font-bold text-zinc-900 shadow-xs">{s.num}</div>
                  <h3 className="mt-4 text-lg font-semibold text-zinc-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={100}>
        <section id="trust" className="border-t border-zinc-100 bg-zinc-50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-xs">Enterprise Trust</span>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-4xl">Security by design</h2>
              <p className="mt-4 text-zinc-500">Built for BPOs who need to pass security reviews and compliance audits.</p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: 'Multi-tenant isolation', desc: 'Every client data separated by tenant_id. No cross-tenant access possible. Row-level security on all tables.' },
                { title: 'Encryption everywhere', desc: 'AES-256 at rest. TLS 1.3 for all API and streaming connections. Keys managed securely with automatic rotation.' },
                { title: 'API security', desc: 'Sanctum token auth with scoped permissions per endpoint. Token prefix: zk_. Granular read/write/admin roles.' },
                { title: 'Audit logging', desc: 'Full call logs, transcripts, and step execution history captured. Immutable audit trail for compliance.' },
                { title: 'SLA guarantee', desc: '99.9% uptime guarantee for production deployments. Dedicated support channel for Enterprise plans.' },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900 dark:ring-white/10">
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={100}>
        <section id="pricing" className="border-t border-zinc-100 bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-xs">Pricing</span>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-4xl">Transparent per-minute pricing</h2>
              <p className="mt-4 text-zinc-500">One price covers telephony, STT, LLM, and TTS. No hidden fees.</p>
            </div>
            <div className="mt-16 grid gap-8 lg:grid-cols-3">
              {tiers.map((tier) => (
                <div key={tier.name} className={`relative rounded-xl border p-8 transition-all duration-300 ${
                  tier.highlighted
                    ? 'border-zinc-900 bg-zinc-50/50 shadow-sm ring-1 ring-zinc-950/10'
                    : 'border-zinc-200 bg-white shadow-xs ring-1 ring-zinc-950/5'
                }`}>
                  {tier.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white shadow-xs">Most popular</span>
                  )}
                  <h3 className="text-lg font-semibold text-zinc-900">{tier.name}</h3>
                  <div className="mt-4">
                    <span className="font-display text-4xl font-bold tracking-tight text-zinc-900">{tier.price}</span>
                    {tier.unit && <span className="ml-1 text-sm text-zinc-400">{tier.unit}</span>}
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">Includes STT + LLM + TTS</p>
                  <ul className="mt-8 space-y-3">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm text-zinc-500">
                        <svg className="h-4 w-4 shrink-0 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a href={canRegister && tier.highlighted ? '/register' : '#contact'} className={`mt-8 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition ${
                    tier.highlighted
                      ? 'bg-zinc-900 text-white shadow-xs hover:bg-zinc-800'
                      : 'border border-zinc-300 text-zinc-700 shadow-xs hover:bg-zinc-50'
                  }`}>{tier.cta}</a>
                </div>
              ))}
            </div>
            <p className="mt-10 text-center text-sm text-zinc-400">All plans include real-time monitoring, transcripts, and REST API access.</p>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={100}>
        <section id="faq" className="border-t border-zinc-100 bg-zinc-50 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center font-display text-3xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-4xl">Frequently asked questions</h2>
            <div className="mt-12 space-y-3">
              {faqs.map((faq) => (
                <details key={faq.q} className="group cursor-pointer rounded-xl border border-zinc-200 bg-white p-6 shadow-xs ring-1 ring-zinc-950/5 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:ring-white/10">
                  <summary className="flex items-center justify-between text-base font-semibold text-zinc-900 dark:text-white">
                    {faq.q}
                    <svg className="h-5 w-5 shrink-0 text-zinc-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      <section className="relative overflow-hidden bg-zinc-900 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.511_0.262_276.966/0.15),transparent_60%)]" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">Ready to deploy your first voice agent?</h2>
          <p className="mt-4 text-zinc-400">No credit card required. Zero to live call in minutes.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {canRegister ? (
              <Link href="/register" className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-zinc-900 shadow-xs transition hover:bg-zinc-100">
                Get started free
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            ) : null}
            <a href="#pricing" className="inline-flex items-center gap-2 rounded-lg border border-zinc-600 bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800">View pricing</a>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
          <Link href="/" className="font-display text-xl font-bold tracking-tight text-zinc-900 dark:text-white">ZeroVoice</Link>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-500">
            {sections.map((item) => (
              <button key={item} onClick={() => scrollTo(item)} className="transition hover:text-zinc-900">{item}</button>
            ))}
            {canLogin ? <Link href="/login" className="transition hover:text-zinc-900">Log in</Link> : null}
          </div>
          <p className="text-sm text-zinc-400">&copy; {new Date().getFullYear()} ZeroVoice. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
