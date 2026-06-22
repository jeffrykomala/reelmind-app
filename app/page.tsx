import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-rose-50">
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <span className="text-xl font-bold text-orange-600">ReelMind</span>
        <div className="flex gap-3">
          <Link href="/login" className={buttonVariants({ variant: 'ghost' })}>
            Log in
          </Link>
          <Link href="/register" className={cn(buttonVariants(), 'bg-orange-600 hover:bg-orange-700 text-white')}>
            Get started free
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-8 pt-24 pb-32 text-center">
        <div className="inline-block bg-orange-100 text-orange-700 text-sm font-medium px-4 py-1 rounded-full mb-6">
          For food & hotel review creators
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Plan viral reels.<br />
          <span className="text-orange-600">Stop guessing what works.</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          AI-powered content briefs, hooks, and captions for Instagram, TikTok, and YouTube Shorts.
          Track your performance and find patterns that grow your account.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className={cn(buttonVariants({ size: 'lg' }), 'bg-orange-600 hover:bg-orange-700 text-white px-8')}
          >
            Start for free
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ size: 'lg', variant: 'outline' })}
          >
            I have an account
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-3 gap-8 text-left">
          {[
            { icon: '✍️', title: 'AI Content Briefs', desc: 'Full scripts and storylines tailored for food or hotel reviews. Two different templates, built for short-form pacing.' },
            { icon: '🎣', title: 'Hook Generator', desc: '5 hook styles per reel — curiosity gap, bold claim, question — so you always nail the first 3 seconds.' },
            { icon: '📊', title: 'Performance Tracker', desc: 'Log views, likes, shares, and reposts. Spot which content types and posting days drive the most engagement.' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
