import { apiRequest } from "./api";

export const orderService = {
  // Cash on Delivery
  createOrder: (paymentMethod, deliveryAddress) => {
    const params = new URLSearchParams({
      paymentMethod,
      deliveryAddress,
    });

    return apiRequest(`/orders?${params.toString()}`, {
      method: "POST",
    });
  },

  // Create an order for Razorpay Checkout
  createRazorpayOrder: (deliveryAddress) => {
    const params = new URLSearchParams({ deliveryAddress });

    return apiRequest(`/orders/razorpay/create?${params.toString()}`, {
      method: "POST",
    });
  },

  // Verify payment on the backend
  verifyRazorpayPayment: (payload) => {
    return apiRequest("/orders/razorpay/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },

  // Order history and details
  getOrderHistory: () => apiRequest("/orders"),

  getOrderById: (orderId) => apiRequest(`/orders/${orderId}`),
};