import RestaurantCard from '../restaurant/RestaurantCard'

const filters = ['All', 'Pizza', 'Burgers', 'Biryani', 'Chinese', 'Desserts', 'Healthy', 'South Indian', 'Beverages']

function RestaurantSection({
  restaurants,
  activeCategory,
  onCategoryChange,
  favorites,
  onToggleFavorite,
  onExploreMenu,
  search,
}) {
  return (
    <section id="restaurants" className="py-16 sm:py-20">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[3px] text-[#ff642d]">
              GOOD FOOD IS CALLING
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              {search || activeCategory !== 'All'
                ? 'Your tasty matches'
                : 'Popular near you'}
            </h2>

            <p className="mt-3 text-sm text-stone-500 sm:text-base">
              Handpicked places for your next great meal.
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-2">
          {filters.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              aria-pressed={activeCategory === category}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                activeCategory === category
                  ? 'border-[#ff642d] bg-[#ff642d] text-white'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-orange-300 hover:text-[#ff642d]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {restaurants.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isFavorite={favorites.includes(restaurant.id)}
                onToggleFavorite={onToggleFavorite}
                onExploreMenu={onExploreMenu}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-16 text-center">
            <span className="text-5xl" role="img" aria-label="Food">
              🍽️
            </span>

            <h3 className="mt-4 text-xl font-extrabold">
              No matching restaurants
            </h3>

            <p className="mt-2 text-sm text-stone-500">
              Try a different search or explore all categories.
            </p>

            <button
              type="button"
              onClick={() => onCategoryChange('All')}
              className="mt-5 rounded-xl bg-[#ff642d] px-5 py-3 text-sm font-bold text-white"
            >
              Show all restaurants
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default RestaurantSection