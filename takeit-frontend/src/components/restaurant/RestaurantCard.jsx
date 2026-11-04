import { ArrowRight, Clock3, Heart, Star } from 'lucide-react'

function RestaurantCard({
  restaurant,
  isFavorite,
  onToggleFavorite,
  onExploreMenu,
}) {
  const cuisineText = restaurant.cuisineType || restaurant.cuisine || restaurant.cuisines || 'Delicious food'
  const imageUrl = restaurant.imageUrl || restaurant.image || '/restaurant-placeholder.svg'
  const rating = restaurant.rating ?? restaurant.averageRating ?? 'New'
  const deliveryTime = restaurant.time || restaurant.deliveryTime || '30–40 min'
  const priceText = restaurant.price || (restaurant.costForTwo ? `₹${restaurant.costForTwo} for two` : 'Great value')

  return (
    <article className="group overflow-hidden rounded-[22px] border border-stone-100 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-200/60">
      <div className="relative overflow-hidden">
        <img
          src={imageUrl}
          alt={restaurant.name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/restaurant-placeholder.svg";
          }}
          className="h-full w-full object-cover"
        />

        <span className="absolute left-4 top-4 rounded-lg bg-[#ff642d] px-3 py-2 text-[10px] font-black tracking-wider text-white shadow-lg">
          {restaurant.offer || restaurant.offerText || 'POPULAR'}
        </span>

        <button
          type="button"
          onClick={() => onToggleFavorite(restaurant.id)}
          aria-label={
            isFavorite
              ? `Remove ${restaurant.name} from favorites`
              : `Add ${restaurant.name} to favorites`
          }
          aria-pressed={isFavorite}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:scale-110"
        >
          <Heart
            size={19}
            fill={isFavorite ? '#ff642d' : 'none'}
            className={isFavorite ? 'text-[#ff642d]' : 'text-stone-600'}
          />
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-extrabold tracking-tight">
              {restaurant.name}
            </h3>
            <p className="mt-1.5 text-xs text-stone-500 sm:text-sm">
              {cuisineText}
            </p>
          </div>

          <span className="flex shrink-0 items-center gap-1 rounded-lg bg-green-600 px-2 py-1.5 text-xs font-extrabold text-white">
            <Star size={12} fill="white" />
            {rating}
          </span>
        </div>

        <div className="my-4 border-t border-dashed border-stone-200" />

        <div className="flex items-center justify-between gap-2 text-xs text-stone-500 sm:text-sm">
          <span className="flex items-center gap-1.5">
            <Clock3 size={15} />
            {deliveryTime}
          </span>
          <span>{priceText}</span>
        </div>

        <button
          type="button"
          onClick={() => onExploreMenu(restaurant)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 py-3 text-sm font-bold text-[#e9521d] transition hover:border-[#ff642d] hover:bg-[#ff642d] hover:text-white"
        >
          Explore menu <ArrowRight size={16} />
        </button>
      </div>
    </article>
  )
}

export default RestaurantCard