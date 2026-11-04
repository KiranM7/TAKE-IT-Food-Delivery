import { Plus, Minus, ShoppingCart, Leaf, Drumstick } from 'lucide-react'

function FoodCard({ dish, quantity = 0, onAdd, onRemove }) {
  const price = Number(dish.discountedPrice ?? dish.price)
  const originalPrice = Number(dish.price)

  return (
    <article className="group flex gap-4 rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-orange-200 hover:shadow-lg sm:p-5">
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`inline-flex h-5 w-5 items-center justify-center rounded border ${
              dish.vegetarian
                ? 'border-green-600'
                : 'border-red-600'
            }`}
            title={dish.vegetarian ? 'Vegetarian' : 'Non-vegetarian'}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                dish.vegetarian ? 'bg-green-600' : 'bg-red-600'
              }`}
            />
          </span>

          {dish.category?.name && (
            <span className="text-xs font-medium text-stone-500">
              {dish.category.name}
            </span>
          )}
        </div>

        <h3 className="text-base font-bold text-stone-900 sm:text-lg">
          {dish.name}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="font-bold text-stone-900">
            ₹{price.toFixed(2)}
          </span>

          {dish.discountedPrice != null && (
            <span className="text-sm text-stone-400 line-through">
              ₹{originalPrice.toFixed(2)}
            </span>
          )}

          {dish.discountedPrice != null && originalPrice > 0 && (
            <span className="rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
              {Math.round(
                ((originalPrice - price) / originalPrice) * 100,
              )}
              % OFF
            </span>
          )}
        </div>

        {dish.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-500">
            {dish.description}
          </p>
        )}

        <div className="mt-4">
          {quantity === 0 ? (
            <button
              type="button"
              onClick={() => onAdd(dish)}
              className="inline-flex items-center gap-2 rounded-xl border border-orange-500 px-4 py-2 text-sm font-bold text-orange-600 transition hover:bg-orange-500 hover:text-white"
            >
              <Plus size={16} />
              Add
            </button>
          ) : (
            <div className="inline-flex items-center gap-4 rounded-xl border border-orange-200 px-3 py-2">
              <button
                type="button"
                onClick={() => onRemove(dish.id)}
                aria-label={`Remove one ${dish.name}`}
                className="text-orange-600 hover:text-orange-800"
              >
                <Minus size={16} />
              </button>

              <span className="min-w-4 text-center font-bold">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => onAdd(dish)}
                aria-label={`Add one ${dish.name}`}
                className="text-orange-600 hover:text-orange-800"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:h-36 sm:w-36">
        {dish.imageUrl ? (
          <img
            src={dish.imageUrl}
            alt={dish.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">
            🍽️
          </div>
        )}

        <div className="absolute bottom-2 right-2 rounded-full bg-white/90 p-1.5 text-orange-600 shadow">
          <ShoppingCart size={15} />
        </div>
      </div>
    </article>
  )
}

export default FoodCard