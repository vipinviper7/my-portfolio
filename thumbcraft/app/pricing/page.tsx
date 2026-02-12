import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, Check, Star, Zap, ArrowRight, X } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing — ThumbCraft | Free & Pro Plans',
  description:
    'ThumbCraft is free to use. Upgrade to Pro for unlimited exports, no watermark, all templates, and premium fonts. Starting at $9/month.',
  openGraph: {
    title: 'ThumbCraft Pricing — Free & Pro Plans',
    description: 'Start free. Upgrade to Pro for $9/month.',
  },
}

const COMPARISON = [
  { feature: 'Templates', free: '4 templates', pro: '12+ templates' },
  { feature: 'Fonts', free: '10 fonts', pro: '15+ fonts' },
  { feature: 'Exports per day', free: '5 / day', pro: 'Unlimited' },
  { feature: 'Export formats', free: 'PNG, JPG', pro: 'PNG, JPG' },
  { feature: 'Watermark', free: 'Yes', pro: 'No watermark' },
  { feature: 'Custom sizes', free: true, pro: true },
  { feature: 'Background gradients', free: true, pro: true },
  { feature: 'Image upload', free: true, pro: true },
  { feature: 'Shape tools', free: true, pro: true },
  { feature: 'Text effects (shadow, stroke)', free: true, pro: true },
  { feature: 'Premium templates', free: false, pro: true },
  { feature: 'Premium fonts', free: false, pro: true },
  { feature: 'High-res export', free: false, pro: true },
  { feature: 'Priority support', free: false, pro: true },
  { feature: 'Custom brand colors', free: false, pro: true },
]

function FeatureCell({ value }: { value: boolean | string }) {
  if (typeof value === 'string') return <span>{value}</span>
  if (value) return <Check size={18} className="text-green-400 mx-auto" />
  return <X size={18} className="text-surface-600 mx-auto" />
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-surface-950">
      {/* Navigation */}
      <nav className="border-b border-surface-800/50 bg-surface-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="text-brand-500" size={24} />
            <span className="text-xl font-bold text-white">ThumbCraft</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/editor" className="text-sm text-surface-400 hover:text-white transition-colors">
              Editor
            </Link>
            <Link
              href="/editor"
              className="text-sm bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Open Editor
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-surface-400">
            Start free. Upgrade when you need more power.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {/* Free */}
            <div className="bg-surface-900/50 border border-surface-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-1">Free</h2>
              <p className="text-sm text-surface-400 mb-4">For casual creators</p>
              <div className="text-4xl font-bold text-white mb-6">
                $0<span className="text-base font-normal text-surface-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  '4 free templates',
                  '10 Google Fonts',
                  '5 exports per day',
                  'PNG & JPG export',
                  'All basic tools',
                  'Small watermark on exports',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-surface-300">
                    <Check size={16} className="text-surface-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/editor"
                className="block text-center w-full py-3 bg-surface-800 hover:bg-surface-700 text-white rounded-xl font-medium transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-gradient-to-b from-brand-600/10 to-transparent border border-brand-600/30 rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <Star size={12} /> Most Popular
              </div>
              <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                Pro <Zap size={20} className="text-yellow-400" />
              </h2>
              <p className="text-sm text-surface-400 mb-4">For serious creators</p>
              <div className="flex items-baseline gap-4 mb-6">
                <div>
                  <span className="text-4xl font-bold text-white">$9</span>
                  <span className="text-base font-normal text-surface-500">/month</span>
                </div>
                <div className="text-sm text-surface-400">
                  or <span className="text-white font-medium">$79</span>/year{' '}
                  <span className="text-green-400 text-xs">(save 27%)</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'All 12+ premium templates',
                  'All 15+ premium fonts',
                  'Unlimited exports',
                  'No watermark',
                  'High-res export',
                  'Priority support',
                  'Custom brand colors',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white">
                    <Check size={16} className="text-brand-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#upgrade"
                className="block text-center w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold transition-colors"
              >
                Start 7-Day Free Trial
              </a>
              <p className="text-center text-xs text-surface-500 mt-3">
                No credit card required
              </p>
            </div>
          </div>

          {/* Comparison table */}
          <div className="bg-surface-900/50 border border-surface-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-surface-800">
              <h3 className="text-lg font-semibold text-white">Feature Comparison</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-800">
                    <th className="text-left text-sm font-medium text-surface-400 px-6 py-3">Feature</th>
                    <th className="text-center text-sm font-medium text-surface-400 px-6 py-3 w-32">Free</th>
                    <th className="text-center text-sm font-medium text-brand-400 px-6 py-3 w-32">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => (
                    <tr key={row.feature} className="border-b border-surface-800/50 last:border-0">
                      <td className="text-sm text-surface-300 px-6 py-3">{row.feature}</td>
                      <td className="text-sm text-surface-400 text-center px-6 py-3">
                        <FeatureCell value={row.free} />
                      </td>
                      <td className="text-sm text-white text-center px-6 py-3">
                        <FeatureCell value={row.pro} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-surface-800/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to start creating?</h2>
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Open the Editor
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-800/50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-brand-500" size={18} />
            <span className="font-bold text-white">ThumbCraft</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-surface-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/editor" className="hover:text-white transition-colors">Editor</Link>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
