import { useEffect, useMemo, useState } from 'react'

import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

import HeroSection from '../components/home/HeroSection'
import CategorySection from '../components/home/CategorySection'
import RestaurantSection from '../components/home/RestaurantSection'
import PromoBanner from '../components/home/PromoBanner'
import HomeCarousel from '../components/home/HomeCarousel'

import { restaurantService } from '../services/restaurantService'
import { useNavigate } from 'react-router-dom'

function HomePage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [favorites, setFavorites] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const location = 'Kalyan, Maharashtra'

  // Food categories displayed on the homepage
  const categories = [
    { name: 'All', emoji: '🍽️' },
    { name: 'Pizza', emoji: '🍕' },
    { name: 'Burgers', emoji: '🍔' },
    { name: 'Biryani', emoji: '🍛' },
    { name: 'Chinese', emoji: '🥡' },
    { name: 'Desserts', emoji: '🍰' },
    { name: 'Healthy', emoji: '🥗' },
    { name: 'South Indian', emoji: '🥞' },
    { name: 'Beverages', emoji: '🥤' },
  ]

  // Fetch restaurants from the Spring Boot backend
  useEffect(() => {
    let cancelled = false

    async function loadRestaurants() {
      try {
        setLoading(true)
        setError('')

        const data = await restaurantService.getAll()

        if (!cancelled) {
          setRestaurants(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              'Unable to load restaurants. Please try again.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadRestaurants()

    return () => {
      cancelled = true
    }
  }, [])

  // Filter restaurants by search term and cuisine
  const filteredRestaurants = useMemo(() => {
    const query = search.trim().toLowerCase()

    return restaurants.filter((restaurant) => {
      const name = restaurant.name || ''
      const cuisine = restaurant.cuisineType || restaurant.cuisine || restaurant.cuisines || ''
      const description = restaurant.description || ''
      const categoryName = restaurant.category?.name || restaurant.category || ''
      const address = restaurant.address || restaurant.location || ''

      const matchesSearch =
        !query ||
        name.toLowerCase().includes(query) ||
        String(cuisine).toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        String(categoryName).toLowerCase().includes(query) ||
        String(address).toLowerCase().includes(query)

      const matchesCategory =
        activeCategory === 'All' ||
        String(cuisine).toLowerCase().includes(activeCategory.toLowerCase()) ||
        name.toLowerCase().includes(activeCategory.toLowerCase()) ||
        description.toLowerCase().includes(activeCategory.toLowerCase()) ||
        String(categoryName).toLowerCase().includes(activeCategory.toLowerCase())

      return matchesSearch && matchesCategory
    })
  }, [restaurants, search, activeCategory])

  // Add or remove a restaurant from favorites
  function toggleFavorite(restaurantId) {
    setFavorites((currentFavorites) =>
      currentFavorites.includes(restaurantId)
        ? currentFavorites.filter((id) => id !== restaurantId)
        : [...currentFavorites, restaurantId],
    )
  }

  function handleExploreMenu(restaurant) {
  navigate(`/restaurant/${restaurant.id}`)
}

  return (
    <>
      <Navbar location={location} />

      <main>
        <HeroSection
          search={search}
          onSearch={setSearch}
          location={location}
        />

        <HomeCarousel />

        <CategorySection
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {loading ? (
          <section className="px-6 py-16 text-center">
            <div
              className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"
              role="status"
              aria-label="Loading restaurants"
            />

            <p className="mt-4 text-stone-600">
              Finding the best restaurants for you...
            </p>
          </section>
        ) : error ? (
          <section className="px-6 py-16 text-center">
            <p className="font-medium text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-orange-500 px-5 py-2.5 font-semibold text-white transition hover:bg-orange-600"
            >
              Try Again
            </button>
          </section>
        ) : (
          <RestaurantSection
            restaurants={filteredRestaurants}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onExploreMenu={handleExploreMenu}
            search={search}
          />
        )}

        {!loading && !error && filteredRestaurants.length === 0 && (
          <section className="px-6 pb-16 text-center">
            <p className="text-lg font-semibold text-stone-800">
              No restaurants found
            </p>

            <p className="mt-2 text-stone-500">
              Try another search or select a different category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch('')
                setActiveCategory('All')
              }}
              className="mt-4 rounded-xl bg-orange-500 px-5 py-2.5 font-semibold text-white transition hover:bg-orange-600"
            >
              Clear Filters
            </button>
          </section>
        )}

        <PromoBanner />
      </main>

      <Footer />
    </>
  )
}

export default HomePage