import { useEffect, useState, useRef, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import { login, register } from '@/routes';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import { GitBranch, Mic, Radio, MessageCircle, FileText, BarChart3, Check, ArrowRight, Menu, X, Rocket, Eye, Layers, Building2, Store } from 'lucide-react';

function FadeIn({ children, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={`transition-all duration-700 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} ${className}`}>{children}</div>;
}

const navItems = ['Platform', 'How It Works', 'Features', 'Pricing', 'FAQ'];
const sectionIds = { platform: 'platform', 'how it works': 'how-it-works', features: 'features', pricing: 'pricing', faq: 'faq' };

const platformCards = [
  { icon: Layers, title: 'SaaS Teams', text: 'Embed voice AI into your product. REST API, embeddable widgets, usage-based pricing. Ship voice features without hiring VoIP engineers.', tags: ['REST API', 'Embeddable widget', 'Usage-based pricing', 'Multi-tenant'] },
  { icon: Building2, title: 'Enterprise', text: 'White-label everything — domains, branding, voice personality. Visual flow builder, CRM integration, enterprise compliance, dedicated SLAs.', tags: ['White-label', 'Custom domain', 'SLA 99.9%', 'SOC 2 / HIPAA'] },
  { icon: Store, title: 'SMB', text: 'Launch an AI phone agent in minutes. No telephony infrastructure needed. Connect your number, pick a flow template, and go live.', tags: ['Quick setup', 'Flow templates', 'Pay-as-you-go', 'Email support'] },
];

const steps = [
  { icon: GitBranch, title: 'Build Flow', text: 'Drag and drop steps in the visual editor — say, ask, LLM, condition, transfer. Mustache templates for dynamic context.' },
  { icon: Rocket, title: 'Deploy', text: 'Connect a Twilio number or SIP trunk in one click. We handle WebSocket streaming, audio codec conversion, and call tracking.' },
  { icon: Eye, title: 'Monitor', text: 'Watch calls live with streaming transcripts. Post-call analytics, quality scoring, and full audit trail.' },
];

const features = [
  { icon: GitBranch, title: 'Visual Flow Builder', text: 'Drag-and-drop step editor with real-time validation, versioned configs, and publish workflow.' },
  { icon: Mic, title: 'AI Voice Synthesis', text: 'ElevenLabs ultra-realistic voices with sub-300ms streaming latency. Per-flow voice configuration.' },
  { icon: Radio, title: 'Real-time Monitoring', text: 'Live call tracking via Reverb WebSockets. Streaming transcripts and agent state visibility.' },
  { icon: MessageCircle, title: 'SMS + WhatsApp', text: 'Multi-channel messaging on the same platform. Trigger flows from SMS, send follow-ups automatically.' },
  { icon: FileText, title: 'Knowledge Base RAG', text: 'Upload documents as agent knowledge. Retrieval-augmented generation for accurate, grounded responses.' },
  { icon: BarChart3, title: 'Analytics + Insights', text: 'Call volume trends, duration analysis, completion rates. Exportable reports and dashboards.' },
];

const tiers = [
  { name: 'Free', price: '$0.08', unit: '/min', features: ['1 phone number', '5 flows', 'Deepgram STT + OpenAI LLM', 'Real-time monitoring', 'Email support'], cta: 'Start Free', highlighted: false },
  { name: 'Pro', price: '$0.05', unit: '/min', features: ['10 phone numbers', 'Unlimited flows', 'ElevenLabs TTS', 'Custom LLM support', 'Priority support', 'SSO + RBAC'], cta: 'Start Free Trial', highlighted: true },
  { name: 'Enterprise', price: 'Custom', unit: '', features: ['Unlimited numbers', 'White-label + custom domain', 'Multi-tenant', 'SLA 99.9%', 'Dedicated engineer', 'SOC 2 / HIPAA'], cta: 'Contact Sales', highlighted: false },
];

const faqs = [
  { q: 'What telephony providers do you support?', a: 'ZeroVoice integrates with Twilio SIP and PSTN. Inbound calls connect via Media Streams WebSocket. Additional providers available per tenant.' },
  { q: 'Can I use my own LLM?', a: 'Yes. Supports OpenAI GPT-4o by default, plus any OpenAI-compatible provider — Anthropic Claude, Llama, and others. Configurable per flow with custom system prompts.' },
  { q: 'Is it white-label?', a: 'Enterprise plans include custom domains, branding (logo, colors, favicon), and isolated auth per tenant. Your clients see your brand, not ours.' },
  { q: 'How fast can I deploy?', a: 'Basic voice agent live in minutes via Quickstart. Production with custom flows typically takes 2–4 weeks.' },
  { q: 'Do you offer an on-premise option?', a: 'Yes — available for Enterprise plans. Deploy behind your firewall with full data isolation and air-gapped operation.' },
  { q: 'What compliance certifications?', a: 'SOC 2 Type II in progress. HIPAA-ready architecture. BAA available for Enterprise. GDPR-compliant by design.' },
];

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
    const id = sectionIds[label.toLowerCase()];
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const sectionHeading = (label, title, subtitle) => (
    <div className="mx-auto max-w-2xl text-center">
      <Badge color="indigo">{label}</Badge>
      <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-zinc-500">{subtitle}</p>}
    </div>
  );

  return (
    <div className="bg-white font-sans text-zinc-900 antialiased">
      <Head title="ZeroVoice — White-label Voice AI for BPOs and SaaS Teams" />

      <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-zinc-200/50 bg-white/80 shadow-xs backdrop-blur-xl' : 'border-transparent bg-transparent'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="font-display text-2xl font-bold tracking-tight text-zinc-900">ZeroVoice</a>
          <div className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => <button key={item} onClick={() => scrollTo(item)} className="text-sm text-zinc-500 transition hover:text-zinc-900">{item}</button>)}
            {canLogin && <Button href={login().url} plain className="text-sm text-zinc-500 hover:text-zinc-900">Log in</Button>}
            {canRegister && <Button href={register().url} color="dark">Start building</Button>}
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 -mr-2">
            {mobileOpen ? <X className="h-6 w-6 text-zinc-700" /> : <Menu className="h-6 w-6 text-zinc-700" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="border-t border-zinc-200 bg-white/95 backdrop-blur-xl px-4 pb-4 lg:hidden">
            <div className="flex flex-col gap-3 pt-4">
              {navItems.map((item) => <button key={item} onClick={() => scrollTo(item)} className="text-left text-sm text-zinc-500">{item}</button>)}
              {canLogin && <Button href={login().url} plain className="justify-start text-sm text-zinc-500">Log in</Button>}
              {canRegister && <Button href={register().url} color="dark" className="justify-center">Start building</Button>}
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
              <span className="size-1.5 rounded-full bg-indigo-500" /> B2B Voice AI Platform
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
              White-label voice AI for <span className="text-indigo-600">BPOs and SaaS teams</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-500">
              Deploy intelligent voice agents under your brand. Connect any phone number, build flows visually, and go live in days — not months.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {canRegister && <Button href={register().url} color="dark">Start Free <ArrowRight className="ml-1 size-4" /></Button>}
              <Button href="#pricing" outline>View Pricing</Button>
            </div>
            <p className="mt-4 text-xs text-zinc-400">No credit card required · Zero to live call in minutes</p>
          </div>
        </div>
      </section>

      <FadeIn>
        <section id="platform" className="border-t border-zinc-100 bg-zinc-50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {sectionHeading('Platform', 'Built for every team', "Whether you're embedding voice into your SaaS, running enterprise BPO operations, or just getting started — we've got you.")}
            <div className="mt-16 grid gap-8 lg:grid-cols-3">
              {platformCards.map((p) => (
                <div key={p.title} className="rounded-xl border border-zinc-200 bg-white p-8 shadow-xs">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><p.icon className="size-5" /></div>
                  <h3 className="mt-4 text-lg font-semibold text-zinc-900">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">{p.text}</p>
                  <div className="mt-6 flex flex-wrap gap-2">{p.tags.map((tag) => <Badge key={tag} color="zinc">{tag}</Badge>)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn>
        <section id="how-it-works" className="border-t border-zinc-100 bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {sectionHeading('How It Works', 'From zero to live call', 'No telephony experience needed. Just connect, configure, and deploy.')}
            <div className="mt-16 grid gap-10 sm:grid-cols-3">
              {steps.map((s, i) => (
                <div key={s.title} className="relative text-center">
                  {i < steps.length - 1 && <div className="absolute left-[calc(50%+3rem)] top-8 hidden h-px w-[calc(100%-6rem)] bg-zinc-200 lg:block" />}
                  <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-indigo-600 shadow-xs"><s.icon className="size-7" /></div>
                  <h3 className="mt-4 text-lg font-semibold text-zinc-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn>
        <section id="features" className="border-t border-zinc-100 bg-zinc-50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {sectionHeading('Features', 'Everything you need to ship voice', 'Every component swappable. Change STT, LLM, or TTS providers per flow.')}
            <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="group rounded-xl border border-zinc-200 bg-white p-6 shadow-xs transition hover:-translate-y-0.5 hover:shadow-sm">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100"><f.icon className="size-5" /></div>
                  <h3 className="mt-4 text-base font-semibold text-zinc-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn>
        <section id="pricing" className="border-t border-zinc-100 bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {sectionHeading('Pricing', 'Transparent per-minute pricing', 'One price covers telephony, STT, LLM, and TTS. No hidden fees.')}
            <div className="mt-16 grid gap-8 lg:grid-cols-3">
              {tiers.map((tier) => (
                <div key={tier.name} className={`relative rounded-xl border p-8 ${tier.highlighted ? 'border-zinc-900 bg-zinc-50/50 ring-1 ring-zinc-950/10' : 'border-zinc-200 bg-white'}`}>
                  {tier.highlighted && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white">Most popular</span>}
                  <h3 className="text-lg font-semibold text-zinc-900">{tier.name}</h3>
                  <div className="mt-4"><span className="font-display text-4xl font-bold tracking-tight text-zinc-900">{tier.price}</span>{tier.unit && <span className="ml-1 text-sm text-zinc-400">{tier.unit}</span>}</div>
                  <p className="mt-1 text-xs text-zinc-400">Includes STT + LLM + TTS</p>
                  <ul className="mt-8 space-y-3">
                    {tier.features.map((f) => <li key={f} className="flex items-center gap-3 text-sm text-zinc-500"><Check className="size-4 shrink-0 text-indigo-600" />{f}</li>)}
                  </ul>
                  <Button href={canRegister && tier.highlighted ? register().url : '#contact'} color={tier.highlighted ? 'dark' : 'outline'} className="mt-8 w-full">{tier.cta}</Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn>
        <section id="faq" className="border-t border-zinc-100 bg-zinc-50 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center"><Badge color="indigo">FAQ</Badge><h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-4xl">Frequently asked questions</h2></div>
            <div className="mt-12 space-y-3">
              {faqs.map((faq) => (
                <details key={faq.q} className="group cursor-pointer rounded-xl border border-zinc-200 bg-white p-6 shadow-xs transition hover:border-zinc-300">
                  <summary className="flex items-center justify-between text-base font-semibold text-zinc-900">
                    {faq.q}
                    <svg className="size-5 shrink-0 text-zinc-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-500">{faq.a}</p>
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
            {canRegister && <Button href={register().url} color="white">Get started free <ArrowRight className="ml-1 size-4" /></Button>}
            <a href="#pricing" className="inline-flex items-center gap-2 rounded-lg border border-zinc-600 bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800">View pricing</a>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 bg-white py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
          <a href="/" className="font-display text-xl font-bold tracking-tight text-zinc-900">ZeroVoice</a>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-500">
            {navItems.map((item) => <button key={item} onClick={() => scrollTo(item)} className="transition hover:text-zinc-900">{item}</button>)}
            {canLogin && <a href={login().url} className="transition hover:text-zinc-900">Log in</a>}
          </div>
          <p className="text-sm text-zinc-400">&copy; {new Date().getFullYear()} ZeroVoice. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
