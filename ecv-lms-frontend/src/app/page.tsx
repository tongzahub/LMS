import Link from 'next/link';
import {
  BookOpen,
  Users,
  Award,
  GraduationCap,
  ArrowRight,
  CheckCircle,
  Play,
  Target,
  BarChart3,
  Globe,
  Shield,
  Zap,
  ChevronRight,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Landing page — no authentication required
// ---------------------------------------------------------------------------

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Course Management',
    description:
      'Create and manage rich course content — videos, quizzes, assignments — fully synced with Moodle for seamless content delivery.',
    accent: 'from-brand-500 to-blue-600',
    accentBg: 'bg-brand-50',
    accentText: 'text-brand-600',
    border: 'border-brand-100',
  },
  {
    icon: Target,
    title: 'Learning Plans',
    description:
      'Assign personalised competency-based learning paths. Track mastery across skills with granular progress analytics in real time.',
    accent: 'from-emerald-500 to-teal-600',
    accentBg: 'bg-emerald-50',
    accentText: 'text-emerald-600',
    border: 'border-emerald-100',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description:
      'Real-time dashboards for students, teachers, and administrators. Monitor engagement, completion, and at-risk learners.',
    accent: 'from-violet-500 to-purple-600',
    accentBg: 'bg-violet-50',
    accentText: 'text-violet-600',
    border: 'border-violet-100',
  },
  {
    icon: Award,
    title: 'Certification',
    description:
      'Automatically issue verifiable digital certificates. Manage competency frameworks and professional credentials with ease.',
    accent: 'from-amber-500 to-orange-600',
    accentBg: 'bg-amber-50',
    accentText: 'text-amber-600',
    border: 'border-amber-100',
  },
] as const;

const STATS = [
  { value: '1,200+', label: 'Active Students', icon: Users },
  { value: '48', label: 'Courses Available', icon: BookOpen },
  { value: '85', label: 'Expert Instructors', icon: GraduationCap },
  { value: '95%', label: 'Satisfaction Rate', icon: Award },
] as const;

const STEPS = [
  {
    step: '01',
    title: 'Create Your Account',
    description: 'Sign up in seconds with email or social login. Multi-factor authentication keeps your account secure.',
    icon: Zap,
  },
  {
    step: '02',
    title: 'Explore & Enroll',
    description: 'Browse the course catalog, filter by topic or difficulty, and enroll in courses that match your goals.',
    icon: BookOpen,
  },
  {
    step: '03',
    title: 'Learn & Achieve',
    description: 'Complete activities, track progress, earn certificates, and build competencies recognized by your organization.',
    icon: GraduationCap,
  },
] as const;

const CAPABILITIES = [
  { icon: Globe, text: 'Multi-language (EN / TH)' },
  { icon: Shield, text: 'AWS Cognito SSO & MFA' },
  { icon: CheckCircle, text: 'Moodle 4.x Integration' },
  { icon: Zap, text: 'Real-time Sync' },
  { icon: Users, text: 'Role-based Access Control' },
  { icon: BarChart3, text: 'Advanced Analytics' },
] as const;

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center shadow-md shadow-brand-600/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">
              ECV<span className="text-brand-600"> Learning</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center text-sm font-medium text-gray-600 hover:text-brand-700 transition-colors px-3 py-2 rounded-lg hover:bg-brand-50"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg shadow-sm transition-all duration-150 active:scale-[0.98]"
            >
              เข้าสู่ระบบ
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 overflow-hidden">
        {/* Deep gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-[#0f1d3d] to-[#0a0f1e]" />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        {/* Gradient orbs */}
        <div className="absolute top-20 -left-32 w-[480px] h-[480px] rounded-full bg-brand-600/20 blur-[120px]" />
        <div className="absolute bottom-10 right-0 w-[360px] h-[360px] rounded-full bg-indigo-500/15 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-36 sm:pt-32 sm:pb-44 lg:pt-40 lg:pb-52">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-1.5 text-xs font-medium text-brand-200 mb-8">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Trusted by educational institutions across Thailand
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              ECV Learning{' '}
              <span className="bg-gradient-to-r from-brand-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                Solutions
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl">
              A modern, enterprise-grade Learning Management System built on Moodle — with beautiful analytics,
              competency-based learning plans, and an experience your learners will actually enjoy.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 rounded-xl bg-white text-brand-700 font-semibold text-base px-7 py-3.5 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-brand-500/20 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <Play className="w-4 h-4" fill="currentColor" />
                เข้าสู่ระบบ / Sign In
                <ChevronRight className="w-4 h-4 opacity-50 -ml-0.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm text-white font-medium text-base px-7 py-3.5 hover:bg-white/10 transition-all duration-200"
              >
                Create Account
                <ArrowRight className="w-4 h-4 opacity-60" />
              </Link>
            </div>

            {/* Social proof micro-strip */}
            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {(
                  [
                    { bg: 'bg-brand-400', initial: 'S' },
                    { bg: 'bg-emerald-400', initial: 'N' },
                    { bg: 'bg-violet-400', initial: 'P' },
                    { bg: 'bg-amber-400', initial: 'K' },
                  ] as const
                ).map(({ bg, initial }) => (
                  <div
                    key={initial}
                    className={`w-8 h-8 rounded-full ${bg} ring-2 ring-brand-900 flex items-center justify-center text-[10px] font-bold text-white`}
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <span className="text-white font-semibold">1,200+ learners</span>
                <span className="text-gray-400 ml-1">already onboard</span>
              </div>
            </div>
          </div>

          {/* Decorative floating card cluster (large screens only) */}
          <div className="hidden lg:block absolute top-32 right-8 xl:right-16 w-[360px]">
            <div className="relative bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-2xl shadow-black/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Advanced Data Science</p>
                  <p className="text-xs text-gray-400">12 modules &middot; 24 hours</p>
                </div>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-[72%] bg-gradient-to-r from-brand-400 to-emerald-400 rounded-full" />
              </div>
              <p className="text-xs text-gray-400 mt-2">72% complete</p>
            </div>

            <div className="absolute -bottom-14 -left-10 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-xl shadow-black/20 w-52">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Certificate Earned</p>
                  <p className="text-[11px] text-emerald-300">Thai Literature 101</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 inset-x-0">
          <svg viewBox="0 0 1440 56" fill="none" className="w-full h-auto" aria-hidden="true">
            <path d="M0 56h1440V28C1220 0 960 0 720 28S220 56 0 28v28z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">Platform Features</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Everything you need to{' '}
              <span className="text-brand-600">deliver learning</span>
            </h2>
            <p className="mt-4 text-gray-500 text-lg leading-relaxed">
              Built on Moodle&apos;s robust engine with a modern interface that makes managing and consuming education a pleasure.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`group relative bg-white rounded-2xl border ${f.border} p-6 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300 hover:-translate-y-1`}
              >
                <div className={`w-11 h-11 rounded-xl ${f.accentBg} flex items-center justify-center mb-5`}>
                  <f.icon className={`w-5 h-5 ${f.accentText}`} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
                {/* Hover accent line */}
                <div
                  className={`absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r ${f.accent} rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 bg-gradient-to-br from-brand-900 via-brand-800 to-[#0f1d3d] overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
                  <s.icon className="w-5 h-5 text-brand-300" />
                </div>
                <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{s.value}</p>
                <p className="mt-1 text-sm text-brand-200">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 sm:py-32 bg-gray-50/70">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">Getting Started</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Up and running in{' '}
              <span className="text-brand-600">three steps</span>
            </h2>
            <p className="mt-4 text-gray-500 text-lg leading-relaxed">
              No complicated setup. Sign up, pick your courses, and start learning immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {STEPS.map((s, i) => (
              <div key={s.step} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-14 left-[calc(50%+44px)] w-[calc(100%-88px)] h-px bg-gradient-to-r from-brand-200 to-brand-100" />
                )}
                <div className="relative text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white border-2 border-brand-100 shadow-sm mb-5">
                    <s.icon className="w-6 h-6 text-brand-600" />
                  </div>
                  <p className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-2">{s.step}</p>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{s.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-xl bg-brand-600 text-white font-semibold text-base px-8 py-3.5 shadow-lg shadow-brand-600/25 hover:bg-brand-700 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              เข้าสู่ระบบ / Sign In
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Capabilities strip */}
      <section className="py-14 border-y border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4 text-sm text-gray-400 font-medium">
            {CAPABILITIES.map((item) => (
              <div key={item.text} className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-brand-300" aria-hidden="true" />
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_55%)]" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 mb-6">
            <Shield className="w-7 h-7 text-brand-200" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to elevate your learning experience?
          </h2>
          <p className="mt-4 text-lg text-brand-100 leading-relaxed max-w-xl mx-auto">
            Join over 1,200 students already learning on ECV LMS. Your journey to professional growth starts here.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-xl bg-white text-brand-700 font-semibold text-base px-8 py-3.5 shadow-xl shadow-black/15 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]"
            >
              เข้าสู่ระบบ / Sign In
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 text-white font-medium text-base px-8 py-3.5 hover:bg-white/10 transition-all duration-200"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-300">ECV Learning Solutions</span>
            </div>
            <p className="text-xs text-gray-600 text-center">
              Powered by Moodle &middot; Hosted on AWS &middot; &copy; {new Date().getFullYear()} ECV Thailand
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link href="/register" className="hover:text-white transition-colors">Register</Link>
              <Link href="/forgot-password" className="hover:text-white transition-colors">Help</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
