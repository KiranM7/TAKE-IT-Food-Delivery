import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ChevronDown,
  MapPin,
  Menu,
  ShoppingBag,
  Utensils,
  X,
  Search,
  UserRound,
  ClipboardList,
  LogOut,
} from 'lucide-react'

function Navbar({ cartCount = 0, location = 'Kalyan, Maharashtra' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [locationOpen, setLocationOpen] = useState(false)
  const [locationInput, setLocationInput] = useState('')
  const [currentLocation, setCurrentLocation] = useState(location)
  const route = useLocation()
  const isHome = route.pathname === '/'

  const token = localStorage.getItem('token')
  const isLoggedIn = Boolean(token)

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    localStorage.removeItem('role')

    setMenuOpen(false)
    window.location.href = '/'
  }

  function saveLocation(event) {
    event.preventDefault()
    if (locationInput.trim()) {
      setCurrentLocation(locationInput.trim())
      setLocationInput('')
      setLocationOpen(false)
    }
  }

  const links = [
    { label: 'Home', href: '/', section: 'home' },
    { label: 'Restaurants', href: '/#restaurants', section: 'restaurants' },
    { label: 'Categories', href: '/#categories', section: 'categories' },
  ]

  function closeMenu() { setMenuOpen(false) }

  return (
    <header className="sticky top-0 z-50 border-b border-orange-100/80 bg-white/95 shadow-sm shadow-stone-200/30 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[76px] max-w-[1280px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" onClick={closeMenu} className="group flex shrink-0 items-center gap-2.5" aria-label="TAKE IT home">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff7a45] to-[#ed481b] text-white shadow-lg shadow-orange-200/70 transition group-hover:-rotate-3">
            <Utensils size={22} strokeWidth={2.5} />
          </span>
          <span className="text-[25px] font-black tracking-[-1.5px] text-stone-900">TAKE<span className="text-[#ff642d]">IT.</span></span>
        </Link>

        <button type="button" onClick={() => setLocationOpen(!locationOpen)}
          aria-expanded={locationOpen}
          className="hidden items-center gap-2 rounded-2xl px-3 py-2 text-left transition hover:bg-orange-50 lg:flex">
          <MapPin size={21} className="shrink-0 text-[#ff642d]" />
          <span className="max-w-[170px]">
            <span className="block text-[10px] font-extrabold uppercase tracking-[1.5px] text-stone-400">Deliver to</span>
            <span className="flex items-center gap-1 truncate text-sm font-bold text-stone-800">{currentLocation}<ChevronDown size={14} /></span>
          </span>
        </button>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a key={link.section} href={link.href}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${isHome && ((link.section === 'home' && route.hash === '') || route.hash === `#${link.section}`) ? 'bg-orange-50 text-[#f15a2a]' : 'text-stone-600 hover:bg-orange-50 hover:text-[#f15a2a]'}`}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {isHome && <button type="button" aria-label="Jump to food search" onClick={() => document.getElementById('food-search')?.focus()}
            className="hidden h-11 w-11 items-center justify-center rounded-xl border border-stone-200 text-stone-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 sm:flex"><Search size={19} /></button>}
          <Link to="/cart" aria-label={`Open cart${cartCount ? `, ${cartCount} items` : ''}`}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 text-stone-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600">
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff642d] px-1 text-[10px] font-extrabold text-white">{cartCount}</span>}
          </Link>
          {isLoggedIn ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/orders"
                className="inline-flex items-center gap-2 rounded-xl border border-orange-200 px-4 py-2  text-sm font-bold text-orange-600 transition hover:bg-orange-50"
              >
                <ClipboardList size={17} />
                My Orders
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff713d] to-[#f05224] px-4 py-3 text-sm font-extrabold text-white shadow-md shadow-orange-200/60 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff713d] to-[#f05224] px-4 py-3 text-sm font-extrabold text-white shadow-md shadow-orange-200/60 transition hover:-translate-y-0.5 hover:shadow-lg sm:inline-flex"
            >
              <UserRound size={17} />
              Sign in
            </Link>
          )}
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 text-stone-700 md:hidden">
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {locationOpen && <form onSubmit={saveLocation} className="mx-auto flex max-w-[1280px] gap-2 px-4 pb-4 sm:px-6 lg:px-8">
        <input value={locationInput} onChange={(event) => setLocationInput(event.target.value)} placeholder="Enter your delivery area" aria-label="Delivery location"
          className="min-w-0 flex-1 rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" />
        <button type="submit" className="rounded-xl bg-[#ff642d] px-5 py-3 text-sm font-bold text-white hover:bg-[#e9521d]">Save location</button>
      </form>}

      {menuOpen && <nav aria-label="Mobile navigation" className="border-t border-stone-100 bg-white px-4 py-4 shadow-lg md:hidden">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-1">
          {links.map((link) => <a key={link.section} href={link.href} onClick={closeMenu} className="rounded-xl px-4 py-3 text-sm font-bold text-stone-700 hover:bg-orange-50 hover:text-orange-600">{link.label}</a>)}
          <Link
            to="/cart"
            onClick={closeMenu}
            className="rounded-xl px-4 py-3 text-sm font-bold text-stone-700 hover:bg-orange-50"
          >
            Your cart
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                to="/orders"
                onClick={closeMenu}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-stone-700 hover:bg-orange-50"
              >
                <ClipboardList size={18} />
                My Orders
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 mt-3 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={closeMenu}
              className="rounded-xl bg-orange-500 px-4 py-3 mt-3 text-center text-sm font-bold text-white"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>}
    </header>
  )
}

export default Navbar
