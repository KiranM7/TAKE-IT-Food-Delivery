import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import RestaurantMenuPage from "./pages/RestaurantMenuPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import RestaurantOwnerDashboard from "./pages/RestaurantOwnerDashboard";
import OwnerRestaurantsPage from "./pages/OwnerRestaurantsPage";
import OwnerDishesPage from "./pages/OwnerDishesPage";
import OwnerOrdersPage from "./pages/OwnerOrdersPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import OwnerEditDishPage from "./pages/OwnerEditDishPage";




function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/restaurant/:restaurantId"
          element={<RestaurantMenuPage />}
        />

        <Route
          path="/owner/orders"
          element={<OwnerOrdersPage />}
        />

        <Route
          path="/owner/dishes"
          element={<OwnerDishesPage />}
        />

        <Route
          path="/owner/dashboard"
          element={<RestaurantOwnerDashboard />}
        />

        <Route
          path="/owner/restaurants"
          element={<OwnerRestaurantsPage />}
        />

        <Route path="/cart" element={<CartPage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        <Route path="/register" element={<RegisterPage />} />

        <Route path="/checkout" element={<CheckoutPage />} />

        <Route path="/orders" element={<OrdersPage />} />

        <Route path="/orders/:orderId" element={<OrderDetailsPage />} />

        <Route path="/admin/orders" element={<AdminOrdersPage />} />

        <Route path="/owner/dishes/edit" element={<OwnerEditDishPage />} />


        <Route
          path="*"
          element={
            <main className="flex min-h-screen items-center justify-center bg-stone-50 p-6">
              <div className="text-center">
                <h1 className="text-4xl font-black text-stone-900">
                  Page not found
                </h1>

                <a
                  href="/"
                  className="mt-5 inline-block rounded-xl bg-orange-500 px-5 py-3 font-bold text-white"
                >
                  Back to home
                </a>
              </div>
            </main>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
