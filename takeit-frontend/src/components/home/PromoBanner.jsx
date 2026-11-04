import { ArrowRight, Flame } from 'lucide-react'

function PromoBanner() {
  function exploreRestaurants() {
    document
      .getElementById('restaurants')
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="px-5 pb-16 lg:px-8">
      <div className="relative mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-8 overflow-hidden rounded-[28px] bg-[#242424] px-7 py-10 text-white sm:px-12 sm:py-14 lg:flex-row lg:items-center">
        <div className="absolute -right-10 -top-24 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />

        <div className="relative max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-orange-300">
            <Flame size={15} />
            GOOD THINGS ARE COOKING
          </span>

          <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
            Your next favourite
            <br />
            meal is waiting.
          </h2>

          <p className="mt-4 text-sm leading-6 text-stone-300 sm:text-base">
            Explore delicious food, discover local restaurants, and make every
            meal a little more special.
          </p>
        </div>

        <button
          type="button"
          onClick={exploreRestaurants}
          className="relative flex shrink-0 items-center gap-3 rounded-xl bg-[#ff642d] px-6 py-4 text-sm font-extrabold text-white transition hover:bg-[#e9521d]"
        >
          Explore restaurants <ArrowRight size={18} />
        </button>
      </div>
    </section>
  )
}

export default PromoBanner