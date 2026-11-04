import { Link } from 'react-router-dom'
import {
  ArrowUp,
  // Instagram,
  Globe,
  Utensils,
  Heart,
  Mail,
  MapPin,
  Phone
} from 'lucide-react'

function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#201a17] text-white">
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:px-8 lg:py-16">
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff7a45] to-[#ed481b]"><Utensils size={21} /></span>
            <span className="text-2xl font-black tracking-tight">TAKE<span className="text-[#ff7544]">IT.</span></span>
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-7 text-stone-400">Good food, great mood. Discover neighbourhood favourites and bring something delicious to your table.</p>
          <div className="mt-6 flex gap-3">
             <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-stone-300 transition hover:border-orange-400 hover:bg-orange-500 hover:text-white"></a>
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-stone-300 transition hover:border-orange-400 hover:bg-orange-500 hover:text-white"></a> 
          </div>
        </div>
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-[2px] text-orange-300">Explore</h3>
          <div className="mt-5 flex flex-col gap-3 text-sm text-stone-400">
            <Link to="/" className="transition hover:translate-x-1 hover:text-white">Home</Link>
            <a href="/#restaurants" className="transition hover:translate-x-1 hover:text-white">Restaurants</a>
            <a href="/#categories" className="transition hover:translate-x-1 hover:text-white">Food categories</a>
            <Link to="/cart" className="transition hover:translate-x-1 hover:text-white">Your cart</Link>
          </div>
        </div>
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-[2px] text-orange-300">Help & account</h3>
          <div className="mt-5 flex flex-col gap-3 text-sm text-stone-400">
            <Link to="/login" className="transition hover:text-white">Sign in</Link>
            <Link to="/register" className="transition hover:text-white">Create account</Link>
            <Link to="/checkout" className="transition hover:text-white">Checkout</Link>
            <a href="mailto:support@takeit.example" className="transition hover:text-white">Contact support</a>
          </div>
        </div>
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-[2px] text-orange-300">Stay connected</h3>
          <p className="mt-5 text-sm leading-6 text-stone-400">A little inspiration for your next meal, delivered with care.</p>
          <p className="mt-4 flex items-center gap-2 text-sm text-stone-300"><MapPin size={16} className="text-orange-400" /> Kalyan, Maharashtra</p>
          <p className="mt-3 flex items-center gap-2 text-sm text-stone-300"><Mail size={16} className="text-orange-400" /> support@takeit.example</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-5 py-5 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} TAKE IT. All rights reserved.</p>
          <p className="inline-flex items-center gap-1.5">Made for food lovers with <Heart size={13} className="fill-orange-500 text-orange-500" /> in India</p>
          <a href="#home" className="inline-flex items-center gap-2 font-bold text-stone-300 transition hover:text-orange-300">Back to top <ArrowUp size={14} /></a>
        </div>
      </div>
    </footer>
  )
}
export default Footer
