import { ArrowRight } from 'lucide-react'

function CategorySection({
  categories,
  activeCategory,
  onCategoryChange,
}) {
  return (
    <section
      id="categories"
      className="border-y border-stone-100 bg-white py-14 sm:py-16"
    >
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[3px] text-[#ff642d]">
              WHAT ARE YOU CRAVING?
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Explore categories
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onCategoryChange('All')}
            className="flex items-center gap-2 text-sm font-bold text-[#ff642d] hover:text-[#d84614]"
          >
            View all <ArrowRight size={17} />
          </button>
        </div>

        <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((category) => (
            <button
              key={category.name}
              type="button"
              onClick={() =>
                onCategoryChange(
                  activeCategory === category.name ? 'All' : category.name,
                )
              }
              aria-pressed={activeCategory === category.name}
              className={`group rounded-2xl border p-4 text-center transition duration-200 hover:-translate-y-1 hover:shadow-lg ${
                activeCategory === category.name
                  ? 'border-[#ff642d] bg-orange-50 shadow-md shadow-orange-100'
                  : 'border-stone-100 bg-[#fffdf9] hover:border-orange-200'
              }`}
            >
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[36px] shadow-sm transition group-hover:scale-105">
                {category.emoji}
              </span>

              <span className="mt-3 block text-xs font-bold sm:text-sm">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CategorySection