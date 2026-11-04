import { apiRequest } from "./api";

export const authService = {
  register: async (userData) => {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials) => {
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (!response?.token) {
      throw new Error("Login succeeded, but the server did not return a token.");
    }

    localStorage.setItem("token", response.token);
    localStorage.setItem("userEmail", response.email);
    localStorage.setItem("userRole", response.role);

    return response;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
  },

  isLoggedIn: () => Boolean(localStorage.getItem("token")),
};
