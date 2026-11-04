import { apiRequest } from "./api";

export const cartService = {
  // Get the logged-in user's cart
  getCart: () => apiRequest("/cart"),

  // Add a dish to the cart
  addItem: (dishId, quantity = 1) =>
    apiRequest(
      `/cart/items?dishId=${dishId}&quantity=${quantity}`,
      { method: "POST" }
    ),

  // Update a cart item's quantity
  updateQuantity: (cartItemId, quantity) =>
    apiRequest(
      `/cart/items/${cartItemId}?quantity=${quantity}`,
      { method: "PUT" }
    ),

  // Remove an item from the cart
  removeItem: (cartItemId) =>
    apiRequest(`/cart/items/${cartItemId}`, {
      method: "DELETE",
    }),

  // Clear the cart
  clearCart: () =>
    apiRequest("/cart", {
      method: "DELETE",
    }),
};
