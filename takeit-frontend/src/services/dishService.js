import { apiRequest } from './api';

export const dishService = {
  getByRestaurant: (restaurantId) =>
    apiRequest(`/dishes/restaurant/${restaurantId}`),

  getByCategory: (categoryId) =>
    apiRequest(`/dishes/category/${categoryId}`),

  getById: (dishId) =>
    apiRequest(`/dishes/${dishId}`),

  search: (name) =>
    apiRequest(`/dishes/search?name=${encodeURIComponent(name)}`),
};