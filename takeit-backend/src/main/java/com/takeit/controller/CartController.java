
package com.takeit.controller;

import com.takeit.dto.CartItemResponse;
import com.takeit.entity.CartItem;
import com.takeit.entity.Dish;
import com.takeit.repository.UserRepository;
import com.takeit.service.CartService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    public CartController(
            CartService cartService,
            UserRepository userRepository) {
        this.cartService = cartService;
        this.userRepository = userRepository;
    }

    private Long getCurrentUserId(Authentication authentication) {
        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                    new IllegalArgumentException("User not found."))
                .getId();
    }

    private CartItemResponse convertToResponse(CartItem item) {
        Dish dish = item.getDish();

        CartItemResponse response = new CartItemResponse();

        response.setId(item.getId());
        response.setQuantity(item.getQuantity());

        response.setDishId(dish.getId());
        response.setDishName(dish.getName());
        response.setImageUrl(dish.getImageUrl());
        response.setPrice(dish.getPrice());
        response.setDiscountedPrice(dish.getDiscountedPrice());
        response.setAvailable(dish.isAvailable());
        

        response.setRestaurantName(dish.getRestaurant().getName());

        BigDecimal unitPrice = cartService.getUnitPrice(dish);
        BigDecimal itemTotal = unitPrice.multiply(
                BigDecimal.valueOf(item.getQuantity()));

        response.setItemTotal(itemTotal);

        return response;
    }

    @GetMapping
    public ResponseEntity<?> getCart(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);

        List<CartItemResponse> items = cartService.getCartItems(userId)
                .stream()
                .map(this::convertToResponse)
                .toList();

        BigDecimal total = cartService.getCartTotal(userId);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("items", items);
        response.put("total", total);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/items")
    public ResponseEntity<CartItemResponse> addToCart(
            Authentication authentication,
            @RequestParam Long dishId,
            @RequestParam(defaultValue = "1") int quantity) {

        Long userId = getCurrentUserId(authentication);

        CartItem item = cartService.addCart(userId, dishId, quantity);

        return ResponseEntity.ok(convertToResponse(item));
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartItemResponse> updateQuantity(
            Authentication authentication,
            @PathVariable Long cartItemId,
            @RequestParam int quantity) {

        Long userId = getCurrentUserId(authentication);

        CartItem item = cartService.updateQuantity(
                userId, cartItemId, quantity);

        return ResponseEntity.ok(convertToResponse(item));
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<Void> removeFromCart(
            Authentication authentication,
            @PathVariable Long cartItemId) {

        Long userId = getCurrentUserId(authentication);

        cartService.removeFromCart(userId, cartItemId);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(
            Authentication authentication) {

        Long userId = getCurrentUserId(authentication);

        cartService.clearCart(userId);

        return ResponseEntity.noContent().build();
    }
}
