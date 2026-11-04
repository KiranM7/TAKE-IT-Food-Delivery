import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, ChevronRight, Flame, Sparkles } from 'lucide-react'

const slides = [
  {
    eyebrow: 'THE GOOD FOOD CLUB',
    title: 'Your cravings.\nOur kind of magic.',
    description: 'Find the comfort food you love and discover something new around the corner.',
    action: 'Explore restaurants',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=85',
    tone: 'from-[#32170e] via-[#542414] to-[#a4441d]',
  },
  {
    eyebrow: 'A LITTLE EXTRA DELICIOUS',
    title: 'Big flavours.\nBetter moments.',
    description: 'From cheesy pizza to spicy biryani, your next favourite bite is waiting.',
    action: 'Browse categories',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1400&q=85',
    tone: 'from-[#251b18] via-[#71321d] to-[#d05b2c]',
  },
  {
    eyebrow: 'MADE FOR YOUR MOOD',
    title: 'Make today\ntaste amazing.',
    description: 'Explore local restaurants, handpicked dishes, and delicious new finds.',
    action: 'Find your meal',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1400&q=85',
    tone: 'from-[#201b18] via-[#4d2c20] to-[#9b4827]',
  },
]

function HomeCarousel() {
  const [active, setActive] = useState(0)
  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 5500)
    return () => window.clearInterval(timer)
  }, [])

  const slide = slides[active]
  function explore() {
    document.getElementById(active === 1 ? 'categories' : 'restaurants')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section aria-label="Featured food offers" className="bg-[#fffaf5] px-4 pb-5 pt-5 sm:px-6 lg:px-8">
      <div className={`relative mx-auto max-w-[1280px] overflow-hidden rounded-[28px] bg-gradient-to-r ${slide.tone} shadow-xl shadow-orange-950/10`}>
        <img key={slide.image} src={slide.image} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-35 transition-opacity duration-700" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
        <div className="relative grid min-h-[330px] items-center gap-8 px-6 py-10 sm:min-h-[370px] sm:px-10 md:grid-cols-[1fr_auto] md:px-14 lg:min-h-[410px] lg:px-16">
          <div className="max-w-2xl text-white">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-extrabold tracking-[2px] backdrop-blur sm:text-xs"><Sparkles size={14} className="text-orange-300" /> {slide.eyebrow}</span>
            <h2 className="mt-5 whitespace-pre-line text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">{slide.title}</h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-white/80 sm:text-base sm:leading-7">{slide.description}</p>
            <button type="button" onClick={explore} className="mt-7 inline-flex items-center gap-3 rounded-xl bg-[#ff642d] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#ef5120]">
              {slide.action} <ChevronRight size={18} />
            </button>
          </div>
          <div className="flex items-center justify-start gap-3 md:flex-col md:justify-center">
            <button type="button" aria-label="Previous slide" onClick={() => setActive((active + slides.length - 1) % slides.length)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"><ArrowLeft size={18} /></button>
            <div className="flex items-center gap-2 md:flex-col">
              {slides.map((item, index) => <button key={item.eyebrow} type="button" aria-label={`Show slide ${index + 1}`} aria-pressed={active === index} onClick={() => setActive(index)} className={`h-2 rounded-full transition-all ${active === index ? 'w-8 bg-[#ff7847]' : 'w-2 bg-white/60 hover:bg-white'}`} />)}
            </div>
            <button type="button" aria-label="Next slide" onClick={() => setActive((active + 1) % slides.length)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"><ArrowRight size={18} /></button>
          </div>
        </div>
      </div>
    </section>
  )
}
export default HomeCarousel
