import { useEffect, useState, useRef, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import { login, register } from '@/routes';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import {
  GitBranch, Mic, Radio, MessageCircle, FileText, BarChart3,
  Check, ArrowRight, Menu, X, Rocket, Eye, Layers, Building2,
  Store, Sparkles, Shield, Zap, Globe, Cpu, ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

function Waveform() {
  return (
    <svg className="absolute inset-0 h-full w-full opacity-[0.03]" viewBox="0 0 1200 400" preserveAspectRatio="none">
      <defs>
        <linearGradient id="wave-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.path
          key={i}
          d={`M0,200 Q${1200 / 12 * i * 2},${100 + i * 20} ${1200},200`}
          fill="none"
          stroke="url(#wave-grad)"
          strokeWidth={1.5 - i * 0.2}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.15 + i * 0.04 }}
          transition={{ duration: 3, delay: i * 0.4, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  );
}

function GlowCard({ children, className = '' }) {
  return (
    <div className={`group relative rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.06] ${className}`}>
      <div className="absolute inset-0 -z-10 rounded-2xl bg-[radial-gradient(circle_at_30%_0%,oklch(0.511_0.262_276.966/0.06),transparent_70%)] opacity-0 transition duration-500 group-hover:opacity-100" />
      {children}
    </div>
  );
}

const navItems = ['Platform', 'How It Works', 'Features', 'Pricing', 'FAQ'];
const sectionIds = {
  platform: 'platform', 'how it works': 'how-it-works', features: 'features',
  pricing: 'pricing', faq: 'faq',
};

const platformCards = [
  { icon: Layers, title: 'SaaS Teams', text: 'Embed voice AI into your product. REST API, embeddable widgets, usage-based pricing. Ship voice features without hiring VoIP engineers.', tags: ['REST API', 'Embeddable widget', 'Usage-based pricing', 'Multi-tenant'] },
  { icon: Building2, title: 'Enterprise', text: 'White-label everything — domains, branding, voice personality. Visual flow builder, CRM integration, enterprise compliance.', tags: ['White-label', 'Custom domain', 'SLA 99.9%', 'SOC 2 / HIPAA'] },
  { icon: Store, title: 'SMB', text: 'Launch an AI phone agent in minutes. No telephony infrastructure needed. Connect your number, pick a flow template, go live.', tags: ['Quick setup', 'Flow templates', 'Pay-as-you-go', 'Email support'] },
];

const steps = [
  { icon: GitBranch, title: 'Build Flow', text: 'Drag and drop steps in the visual editor — say, ask, LLM, condition, transfer. Mustache templates for dynamic context.' },
  { icon: Rocket, title: 'Deploy', text: 'Connect a Twilio number or SIP trunk in one click. WebSocket streaming, audio codec conversion, and call tracking.' },
  { icon: Eye, title: 'Monitor', text: 'Watch calls live with streaming transcripts. Post-call analytics, quality scoring, and full audit trail.' },
];

const features = [
  { icon: GitBranch, title: 'Visual Flow Builder', text: 'Drag-and-drop step editor with real-time validation, versioned configs, and publish workflow.' },
  { icon: Mic, title: 'AI Voice Synthesis', text: 'ElevenLabs ultra-realistic voices with sub-300ms streaming latency. Per-flow voice configuration.' },
  { icon: Radio, title: 'Real-time Monitoring', text: 'Live call tracking via Reverb WebSockets. Streaming transcripts and agent state visibility.' },
  { icon: MessageCircle, title: 'SMS + WhatsApp', text: 'Multi-channel messaging on the same platform. Trigger flows from SMS, send follow-ups.' },
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
  { q: 'Can I use my own LLM?', a: 'Yes. Supports OpenAI GPT-4o by default, plus any OpenAI-compatible provider — Anthropic Claude, Llama, others. Configurable per flow with custom system prompts.' },
  { q: 'Is it white-label?', a: 'Enterprise plans include custom domains, branding (logo, colors, favicon), and isolated auth per tenant. Your clients see your brand, not ours.' },
  { q: 'How fast can I deploy?', a: 'Basic voice agent live in minutes via Quickstart. Production with custom flows typically takes 2–4 weeks.' },
  { q: 'Do you offer on-premise?', a: 'Yes — available for Enterprise plans. Deploy behind your firewall with full data isolation and air-gapped operation.' },
  { q: 'What compliance certifications?', a: 'SOC 2 Type II in progress. HIPAA-ready architecture. BAA for Enterprise. GDPR-compliant by design.' },
];

const stats = [
  { icon: Zap, value: '99.9%', label: 'Uptime SLA' },
  { icon: Globe, value: '30+', label: 'Countries' },
  { icon: Shield, value: 'SOC 2', label: 'In Progress' },
  { icon: Cpu, value: '<300ms', label: 'Voice Latency' },
];

function SectionHeading({ label, title, subtitle }) {
  return (
    <motion.div className="mx-auto max-w-2xl text-center" variants={itemVariants}>
      <Badge color="indigo">{label}</Badge>
      <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-zinc-400">{subtitle}</p>}
    </motion.div>
  );
}

export default function Welcome({ canLogin, canRegister }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = useCallback((label) => {
    setMobileOpen(false);
    const id = sectionIds[label.toLowerCase()];
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-indigo-500/30">
      <Head title="ZeroVoice — White-label Voice AI for BPOs and SaaS Teams" />
      <Waveform />

      <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? 'border-b border-white/10 bg-zinc-950/80 shadow-lg shadow-black/20 backdrop-blur-2xl' : 'border-transparent bg-transparent'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <motion.a
            href="/"
            className="font-display text-2xl font-bold tracking-tight"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">Zero</span>
            <span className="text-white">Voice</span>
          </motion.a>

          <motion.div
            className="hidden items-center gap-8 lg:flex"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item)}
                className="text-sm text-zinc-400 transition hover:text-white"
              >
                {item}
              </button>
            ))}
            {canLogin && (
              <Button href={login().url} plain className="text-sm text-zinc-400 hover:text-white">
                Log in
              </Button>
            )}
            {canRegister && (
              <Button href={register().url} color="dark">
                Start building
              </Button>
            )}
          </motion.div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 lg:hidden">
            {mobileOpen ? <X className="h-6 w-6 text-zinc-400" /> : <Menu className="h-6 w-6 text-zinc-400" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-white/10 bg-zinc-950/95 backdrop-blur-xl"
            >
              <div className="flex flex-col gap-3 px-4 pb-6 pt-4">
                {navItems.map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollTo(item)}
                    className="text-left text-sm text-zinc-400"
                  >
                    {item}
                  </button>
                ))}
                {canLogin && (
                  <Button href={login().url} plain className="justify-start text-sm text-zinc-400">
                    Log in
                  </Button>
                )}
                {canRegister && (
                  <Button href={register().url} color="dark" className="justify-center">
                    Start building
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <motion.section
        className="relative overflow-hidden pt-36 pb-28 sm:pt-44 sm:pb-36"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.511_0.262_276.966/0.07),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,oklch(0.647_0.217_24.74/0.04),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div className="mx-auto max-w-4xl text-center" variants={containerVariants}>
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-zinc-400 shadow-lg shadow-black/10 backdrop-blur-sm">
                <span className="flex items-center gap-1">
                  <span className="inline-flex h-2 w-2">
                    <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                  </span>
                  B2B Voice AI Platform
                </span>
              </span>
            </motion.div>

            <motion.h1
              className="mt-6 font-display text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl"
              variants={itemVariants}
            >
              <span className="bg-gradient-to-b from-white via-white to-zinc-400 bg-clip-text text-transparent">
                White-label voice AI for
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                BPOs and SaaS teams
              </span>
            </motion.h1>

            <motion.p
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400"
              variants={itemVariants}
            >
              Deploy intelligent voice agents under your brand. Connect any phone number,
              build flows visually, and go live in days — not months.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-wrap justify-center gap-4"
              variants={itemVariants}
            >
              {canRegister && (
                <Button href={register().url} color="dark">
                  Start Free <ArrowRight className="ml-2 size-4" />
                </Button>
              )}
              <Button href="#pricing" outline>
                View Pricing
              </Button>
            </motion.div>

            <motion.p
              className="mt-6 text-xs text-zinc-500"
              variants={itemVariants}
            >
              No credit card required · Zero to live call in minutes
            </motion.p>

            <motion.div
              className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4"
              variants={itemVariants}
            >
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                    <s.icon className="size-5" />
                  </div>
                  <div className="mt-2 font-display text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-zinc-500">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="platform"
        className="relative border-t border-white/5 py-24 sm:py-32"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,oklch(0.511_0.262_276.966/0.04),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="Platform"
            title="Built for every team"
            subtitle="Whether you're embedding voice into your SaaS, running BPO operations, or just getting started."
          />
          <motion.div className="mt-16 grid gap-6 lg:grid-cols-3" variants={containerVariants}>
            {platformCards.map((p) => (
              <motion.div key={p.title} variants={fadeUp}>
                <GlowCard>
                  <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                    <p.icon className="size-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{p.text}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {p.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-xs text-zinc-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="how-it-works"
        className="relative border-t border-white/5 py-24 sm:py-32"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
      >
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="How It Works"
            title="From zero to live call"
            subtitle="No telephony experience needed. Just connect, configure, and deploy."
          />
          <motion.div className="mt-16 grid gap-8 sm:grid-cols-3" variants={containerVariants}>
            {steps.map((s, i) => (
              <motion.div key={s.title} className="relative text-center" variants={fadeUp}>
                {i < steps.length - 1 && (
                  <div className="absolute left-[calc(50%+3rem)] top-8 hidden h-px w-[calc(100%-7rem)] bg-gradient-to-r from-indigo-500/50 to-transparent lg:block" />
                )}
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 shadow-lg shadow-indigo-500/5">
                  <s.icon className="size-7" />
                </div>
                <div className="mt-4 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-300">
                  {i + 1}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="features"
        className="relative border-t border-white/5 py-24 sm:py-32"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.511_0.262_276.966/0.03),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="Features"
            title="Everything you need to ship voice"
            subtitle="Every component swappable. Change STT, LLM, or TTS providers per flow."
          />
          <motion.div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" variants={containerVariants}>
            {features.map((f) => (
              <motion.div key={f.title} variants={scaleIn}>
                <GlowCard className="h-full">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 transition group-hover:bg-indigo-500/20">
                    <f.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.text}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-indigo-400 opacity-0 transition group-hover:opacity-100">
                    Learn more <ArrowRight className="size-3" />
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="pricing"
        className="relative border-t border-white/5 py-24 sm:py-32"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
      >
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="Pricing"
            title="Transparent per-minute pricing"
            subtitle="One price covers telephony, STT, LLM, and TTS. No hidden fees."
          />
          <motion.div className="mt-16 grid gap-8 lg:grid-cols-3" variants={containerVariants}>
            {tiers.map((tier) => (
              <motion.div key={tier.name} variants={fadeUp}>
                <div
                  className={`relative rounded-2xl border p-8 backdrop-blur-sm ${
                    tier.highlighted
                      ? 'border-indigo-500/40 bg-indigo-500/[0.04] shadow-xl shadow-indigo-500/10'
                      : 'border-white/10 bg-white/[0.02]'
                  }`}
                >
                  {tier.highlighted && (
                    <>
                      <div className="absolute -inset-px -z-10 rounded-2xl bg-gradient-to-b from-indigo-500/20 via-transparent to-transparent opacity-50" />
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25">
                        Most popular
                      </span>
                    </>
                  )}
                  <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                  <div className="mt-4">
                    <span className="font-display text-4xl font-bold tracking-tight text-white">
                      {tier.price}
                    </span>
                    {tier.unit && <span className="ml-1 text-sm text-zinc-500">{tier.unit}</span>}
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">Includes STT + LLM + TTS</p>
                  <ul className="mt-8 space-y-3">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm text-zinc-400">
                        <Check className="size-4 shrink-0 text-indigo-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    href={canRegister && tier.highlighted ? register().url : '#contact'}
                    color={tier.highlighted ? 'dark' : 'outline'}
                    className="mt-8 w-full"
                  >
                    {tier.cta}
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="faq"
        className="relative border-t border-white/5 py-24 sm:py-32"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
      >
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center" variants={itemVariants}>
            <Badge color="indigo">FAQ</Badge>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
              Frequently asked questions
            </h2>
          </motion.div>
          <motion.div className="mt-12 space-y-3" variants={containerVariants}>
            {faqs.map((faq) => (
              <motion.div key={faq.q} variants={itemVariants}>
                <button
                  onClick={() => setOpenFaq(openFaq === faq.q ? null : faq.q)}
                  className={`w-full rounded-xl border p-6 text-left backdrop-blur-sm transition ${
                    openFaq === faq.q
                      ? 'border-indigo-500/30 bg-indigo-500/[0.03]'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-base font-semibold text-white">{faq.q}</span>
                    <ChevronDown
                      className={`size-5 shrink-0 text-zinc-500 transition duration-300 ${
                        openFaq === faq.q ? 'rotate-180 text-indigo-400' : ''
                      }`}
                    />
                  </div>
                  <AnimatePresence>
                    {openFaq === faq.q && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 overflow-hidden text-sm leading-relaxed text-zinc-400"
                      >
                        {faq.a}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="relative overflow-hidden py-24 sm:py-32"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-indigo-950/20 to-zinc-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.511_0.262_276.966/0.06),transparent_70%)]" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <motion.h2
            className="font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl"
            variants={itemVariants}
          >
            Ready to deploy your{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              first voice agent
            </span>
            ?
          </motion.h2>
          <motion.p className="mt-4 text-zinc-400" variants={itemVariants}>
            No credit card required. Zero to live call in minutes.
          </motion.p>
          <motion.div className="mt-10 flex flex-wrap justify-center gap-4" variants={itemVariants}>
            {canRegister && (
              <Button href={register().url} color="dark">
                Get started free <ArrowRight className="ml-2 size-4" />
              </Button>
            )}
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-zinc-300 shadow-lg backdrop-blur-sm transition hover:border-white/20 hover:text-white"
            >
              View pricing
            </a>
          </motion.div>
        </div>
      </motion.section>

      <footer className="relative border-t border-white/5 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
          <a href="/" className="font-display text-xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">Zero</span>
            <span className="text-white">Voice</span>
          </a>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-500">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item)}
                className="transition hover:text-zinc-300"
              >
                {item}
              </button>
            ))}
            {canLogin && (
              <a href={login().url} className="transition hover:text-zinc-300">
                Log in
              </a>
            )}
          </div>
          <p className="text-sm text-zinc-600">&copy; {new Date().getFullYear()} ZeroVoice. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
