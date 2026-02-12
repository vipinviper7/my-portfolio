import Link from 'next/link'
import {
  Sparkles,
  Layout,
  Type,
  Download,
  Layers,
  Palette,
  Zap,
  ArrowRight,
  Check,
  Star,
  ChevronDown,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Layout,
    title: '12+ Ready Templates',
    description: 'Professional designs for YouTube, podcasts, tech reviews, and more. Just click and customize.',
  },
  {
    icon: Type,
    title: '15+ Google Fonts',
    description: 'Beautiful display and body fonts. Bold headlines, elegant serifs, handwritten styles.',
  },
  {
    icon: Layers,
    title: 'Drag & Drop Editor',
    description: 'Move, resize, rotate any element. Layer management, snap guides, and keyboard shortcuts.',
  },
  {
    icon: Palette,
    title: 'Colors & Gradients',
    description: '30+ solid colors and 15+ gradient presets. Custom color picker and angle control.',
  },
  {
    icon: Download,
    title: 'One-Click Export',
    description: 'Export as high-quality PNG or JPG. Copy to clipboard. Exact pixel dimensions.',
  },
  {
    icon: Zap,
    title: 'Multiple Sizes',
    description: 'YouTube 1280x720, OG Image 1200x630, Instagram, Twitter, LinkedIn, and custom sizes.',
  },
]

const FAQS = [
  {
    question: 'Is ThumbCraft really free?',
    answer:
      'Yes! ThumbCraft is free to use with 4 templates, 10 fonts, and 5 exports per day. Upgrade to Pro for unlimited access.',
  },
  {
    question: 'What sizes can I create?',
    answer:
      'YouTube Thumbnails (1280x720), OG Images (1200x630), Instagram Posts (1080x1080), Instagram Stories (1080x1920), Twitter/X Posts (1600x900), Facebook Covers (820x312), LinkedIn Banners (1584x396), and custom sizes.',
  },
  {
    question: 'Do I need design experience?',
    answer:
      'Not at all. Start with a template, customize the text and colors, and export. The drag-and-drop editor makes it easy for anyone.',
  },
  {
    question: 'Can I upload my own images?',
    answer:
      'Yes! Upload images to use as backgrounds or place them on the canvas. Resize, rotate, and adjust opacity.',
  },
  {
    question: 'What export formats are supported?',
    answer:
      'Export as PNG (lossless, best quality) or JPG (with adjustable quality slider). You can also copy the image directly to your clipboard.',
  },
  {
    question: 'Is there a watermark?',
    answer:
      'Free exports include a small "Made with ThumbCraft" watermark in the corner. Pro users get watermark-free exports.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-950">
      {/* Navigation */}
      <nav className="border-b border-surface-800/50 bg-surface-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="text-brand-500" size={24} />
            <span className="text-xl font-bold text-white">ThumbCraft</span>
          </Link>
          <div className="hidden sm:flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-surface-400 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link
              href="/editor"
              className="text-sm bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Open Editor
            </Link>
          </div>
          <Link
            href="/editor"
            className="sm:hidden text-sm bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Open Editor
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/10 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 sm:pt-32 sm:pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-600/10 border border-brand-600/20 rounded-full px-4 py-1.5 mb-6">
            <Zap size={14} className="text-brand-400" />
            <span className="text-sm text-brand-300">100% Free — No sign-up required</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6 max-w-4xl mx-auto">
            Create Stunning Thumbnails{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">
              in Seconds
            </span>{' '}
            — Free
          </h1>
          <p className="text-lg sm:text-xl text-surface-400 max-w-2xl mx-auto mb-10">
            The easiest way to make YouTube thumbnails, OG images, and social media graphics.
            Templates, drag-and-drop, and one-click export.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/editor"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-lg font-semibold px-8 py-4 rounded-xl transition-colors shadow-lg shadow-brand-600/25"
            >
              Start Creating — It&apos;s Free
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-surface-300 hover:text-white text-lg px-6 py-4 transition-colors"
            >
              See Pricing
            </Link>
          </div>

          {/* Editor mockup */}
          <div className="mt-16 sm:mt-20 relative max-w-4xl mx-auto">
            <div className="bg-surface-900 rounded-xl border border-surface-800 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-surface-900 border-b border-surface-800">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="ml-4 text-xs text-surface-500">ThumbCraft Editor</span>
              </div>
              <div className="aspect-video bg-gradient-to-br from-surface-800 to-surface-900 flex items-center justify-center p-8">
                <div className="w-full max-w-lg aspect-video bg-gradient-to-br from-brand-600 to-purple-600 rounded-lg flex flex-col items-center justify-center shadow-xl">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-2">Your Design Here</div>
                  <div className="text-sm text-white/70">1280 × 720 — YouTube Thumbnail</div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-brand-600/10 rounded-full blur-2xl" />
          </div>
        </div>
      </section>

      {/* Ad Placement */}
      {/* Google AdSense: Skyscraper 160x600 - placed in sidebar area */}

      {/* Features */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to create amazing graphics
            </h2>
            <p className="text-lg text-surface-400 max-w-2xl mx-auto">
              Professional tools, beautiful templates, and an intuitive editor — all in your browser.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-surface-900/50 border border-surface-800/50 rounded-xl p-6 hover:border-surface-700 transition-colors"
              >
                <div className="w-10 h-10 bg-brand-600/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon size={20} className="text-brand-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-surface-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Size presets showcase */}
      <section className="py-16 bg-surface-900/30 border-y border-surface-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">One editor, every platform</h2>
          <p className="text-surface-400 mb-10 max-w-xl mx-auto">
            Presets for YouTube, Instagram, Twitter/X, LinkedIn, Facebook, and more. Or set a custom size.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'YouTube 1280×720',
              'OG Image 1200×630',
              'Instagram 1080×1080',
              'Twitter/X 1600×900',
              'Facebook 820×312',
              'LinkedIn 1584×396',
              'Custom Size',
            ].map((size) => (
              <span
                key={size}
                className="bg-surface-800 border border-surface-700 text-surface-300 text-sm px-4 py-2 rounded-lg"
              >
                {size}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Free forever. Pro when you need it.
            </h2>
            <p className="text-lg text-surface-400">
              Start for free. Upgrade to Pro for unlimited access.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="bg-surface-900/50 border border-surface-800 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-white mb-1">Free</h3>
              <div className="text-3xl font-bold text-white mt-2">
                $0<span className="text-base font-normal text-surface-500">/month</span>
              </div>
              <ul className="mt-6 space-y-3">
                {['4 free templates', '10 fonts', '5 exports per day', 'PNG & JPG export', 'Small watermark'].map(
                  (f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-surface-300">
                      <Check size={16} className="text-surface-500 shrink-0" />
                      {f}
                    </li>
                  )
                )}
              </ul>
              <Link
                href="/editor"
                className="mt-8 block text-center w-full py-3 bg-surface-800 hover:bg-surface-700 text-white rounded-xl font-medium transition-colors"
              >
                Get Started Free
              </Link>
            </div>
            {/* Pro */}
            <div className="bg-gradient-to-b from-brand-600/10 to-transparent border border-brand-600/30 rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
                Pro <Star size={18} className="text-yellow-400" />
              </h3>
              <div className="text-3xl font-bold text-white mt-2">
                $9<span className="text-base font-normal text-surface-500">/month</span>
              </div>
              <ul className="mt-6 space-y-3">
                {[
                  'All 12+ templates',
                  'All 15+ fonts',
                  'Unlimited exports',
                  'No watermark',
                  'Priority support',
                  'High-res export',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white">
                    <Check size={16} className="text-brand-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#upgrade"
                className="mt-8 block text-center w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold transition-colors"
              >
                Start 7-Day Free Trial
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-surface-900/30 border-t border-surface-800/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group bg-surface-900/50 border border-surface-800/50 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none">
                  <h3 className="text-white font-medium pr-4">{faq.question}</h3>
                  <ChevronDown
                    size={18}
                    className="text-surface-400 shrink-0 transition-transform group-open:rotate-180"
                  />
                </summary>
                <div className="px-6 pb-4 text-sm text-surface-400 leading-relaxed">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to create something amazing?
          </h2>
          <p className="text-lg text-surface-400 mb-8">
            Join thousands of creators making thumbnails with ThumbCraft. No sign-up. No credit card. Just create.
          </p>
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-lg font-semibold px-8 py-4 rounded-xl transition-colors shadow-lg shadow-brand-600/25"
          >
            Start Creating — It&apos;s Free
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-800/50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="text-brand-500" size={20} />
              <span className="text-lg font-bold text-white">ThumbCraft</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-surface-400">
              <Link href="/editor" className="hover:text-white transition-colors">
                Editor
              </Link>
              <Link href="/pricing" className="hover:text-white transition-colors">
                Pricing
              </Link>
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-surface-600">
            &copy; {new Date().getFullYear()} ThumbCraft. Free thumbnail maker for creators.
          </div>
          {/* Google AdSense: Leaderboard 728x90 */}
          <div className="mt-8 mx-auto max-w-[728px]">
            {/* <!-- Google AdSense: Leaderboard 728x90 --> */}
            <div className="ad-container w-full h-[90px] rounded-lg">
              Ad Space — 728×90
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
