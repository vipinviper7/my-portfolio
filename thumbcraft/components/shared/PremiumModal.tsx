'use client'

import { X, Check, Crown, Zap } from 'lucide-react'

interface PremiumModalProps {
  isOpen: boolean
  onClose: () => void
  feature?: string
}

const FREE_FEATURES = [
  '4 free templates',
  'Basic text & shape tools',
  '5 exports per day',
  '10 free fonts',
  'PNG & JPG export',
]

const PRO_FEATURES = [
  'All 12+ premium templates',
  'Unlimited exports',
  'No watermark',
  'All 15+ premium fonts',
  'Priority support',
  'Custom brand colors',
  'High-res export',
]

export default function PremiumModal({ isOpen, onClose, feature }: PremiumModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-surface-950 border border-surface-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-brand-600 to-purple-600 px-6 py-8 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          <Crown className="mx-auto mb-3 text-yellow-300" size={40} />
          <h2 className="text-2xl font-bold text-white">Upgrade to Pro</h2>
          {feature && (
            <p className="text-white/80 mt-2 text-sm">
              {feature} is a Pro feature
            </p>
          )}
        </div>

        {/* Pricing */}
        <div className="px-6 py-6">
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">$9</div>
              <div className="text-surface-400 text-sm">/month</div>
            </div>
            <div className="text-surface-600">or</div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">$79</div>
              <div className="text-surface-400 text-sm">/year</div>
              <div className="text-green-400 text-xs font-medium">Save 27%</div>
            </div>
          </div>

          {/* Features comparison */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-surface-400 text-xs font-semibold uppercase tracking-wider mb-3">Free</h3>
              <ul className="space-y-2">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-surface-400">
                    <Check size={14} className="mt-0.5 text-surface-600 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-brand-400 text-xs font-semibold uppercase tracking-wider mb-3">Pro</h3>
              <ul className="space-y-2">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white">
                    <Check size={14} className="mt-0.5 text-brand-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA */}
          <a
            href="#upgrade"
            className="flex items-center justify-center gap-2 w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors"
          >
            <Zap size={18} />
            Start 7-Day Free Trial
          </a>
          <p className="text-center text-surface-500 text-xs mt-3">
            Cancel anytime. No credit card required to start.
          </p>
        </div>
      </div>
    </div>
  )
}
