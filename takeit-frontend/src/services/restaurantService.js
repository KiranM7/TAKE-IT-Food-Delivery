import { apiRequest } from './api'

export const restaurantService = {
  getAll: () => apiRequest('/restaurants'),

  getById: (id) => apiRequest(`/restaurants/${id}`),

  search: (name) =>
    apiRequest(`/restaurants/search?name=${encodeURIComponent(name)}`),

  getByCuisine: (type) =>
    apiRequest(`/restaurants/cuisine?type=${encodeURIComponent(type)}`),
}