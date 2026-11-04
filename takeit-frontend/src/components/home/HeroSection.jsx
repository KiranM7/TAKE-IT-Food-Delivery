import { Bike, Clock3, Flame, MapPin, Search, Star } from 'lucide-react'

function HeroSection({ search, onSearch, location = 'Kalyan, Maharashtra' }) {
  function handleSubmit(event) {
    event.preventDefault()

    document
      .getElementById('restaurants')
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="home" className="overflow-hidden bg-[#fffaf5]">
      <div className="mx-auto grid max-w-[1240px] items-center gap-10 px-5 py-14 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-xs font-bold text-[#e9521d] sm:text-sm">
            <Flame size={16} />
            GOOD FOOD. GREAT MOOD.
          </div>

          <h1 className="max-w-[650px] text-[46px] font-black leading-[1.08] tracking-[-2.7px] sm:text-6xl lg:text-[72px]">
            Cravings?
            <br />
            We deliver
            <br />
            <span className="relative inline-block text-[#ff642d]">
              happiness.
              <svg
                viewBox="0 0 320 16"
                className="absolute -bottom-2 left-0 w-full"
                aria-hidden="true"
              >
                <path
                  d="M4 10 Q160 -2 315 8"
                  fill="none"
                  stroke="#ffb69a"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-7 max-w-[480px] text-base leading-7 text-stone-500 sm:text-lg">
            Discover your next favourite meal. From local legends to delicious
            new finds, your perfect bite is just a few clicks away.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex max-w-[530px] items-center gap-3 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl shadow-stone-200/60"
          >
            <Search size={22} className="ml-3 shrink-0 text-[#ff642d]" />

            <input
              id="food-search"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Pizza, biryani, burgers..."
              aria-label="Search restaurants and cuisines"
              className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-stone-400 sm:text-base"
            />

            <button
              type="submit"
              className="rounded-xl bg-[#ff642d] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#e9521d] sm:px-6"
            >
              Find food
            </button>
          </form>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-stone-500">
            <span className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-50 text-green-600">
                ✓
              </span>
              Freshly prepared
            </span>

            <span className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-50 text-[#ff642d]">
                <Bike size={16} />
              </span>
              Doorstep delivery
            </span>
          </div>

          <p className="mt-5 flex items-center gap-2 text-xs text-stone-400">
            <MapPin size={14} />
            Exploring food around {location}
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none">
          <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-orange-100/80 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-amber-100/80 blur-3xl" />

          <div className="relative overflow-hidden rounded-[32px] bg-[#f7e6d8] p-3 shadow-2xl shadow-orange-100">
            <img
              src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1100&q=90"
              alt="A delicious spread of freshly prepared food"
              className="h-[340px] w-full rounded-[25px] object-cover sm:h-[430px]"
            />

            <div className="absolute bottom-8 left-7 flex items-center gap-3 rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur-sm sm:left-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-[#ff642d]">
                <Clock3 size={24} />
              </div>

              <div>
                <p className="text-sm font-extrabold">Hungry? Sorted.</p>
                <p className="mt-1 text-xs text-stone-500">
                  Great food, delivered to you
                </p>
              </div>
            </div>

            <div className="absolute right-6 top-6 flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-lg">
              <Star size={17} fill="#ffb323" className="text-[#ffb323]" />
              <span className="text-sm font-extrabold">Made with love</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection