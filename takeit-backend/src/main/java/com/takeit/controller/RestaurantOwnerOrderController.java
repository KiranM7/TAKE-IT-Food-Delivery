package com.takeit.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.takeit.dto.OrderItemResponse;
import com.takeit.dto.OrderResponse;
import com.takeit.entity.Order;
import com.takeit.entity.OrderItem;
import com.takeit.entity.User;
import com.takeit.enums.OrderStatus;
import com.takeit.repository.OrderItemRepository;
import com.takeit.repository.UserRepository;
import com.takeit.service.OrderService;

@RestController
@RequestMapping("/api/owner/restaurants/{restaurantId}/orders")
@PreAuthorize("hasRole('RESTAURANT_OWNER')")
public class RestaurantOwnerOrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;

    public RestaurantOwnerOrderController(
            OrderService orderService,
            UserRepository userRepository,
            OrderItemRepository orderItemRepository) {

        this.orderService = orderService;
        this.userRepository = userRepository;
        this.orderItemRepository = orderItemRepository;
    }

    private Long getCurrentOwnerId(Authentication authentication) {

        if (authentication == null
                || authentication.getName() == null) {
            throw new IllegalArgumentException(
                    "User is not authenticated");
        }

        User owner = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException("Owner not found"));

        return owner.getId();
    }

    private OrderItemResponse convertItemToResponse(OrderItem item) {

        OrderItemResponse response = new OrderItemResponse();

        response.setDishId(item.getDish().getId());
        response.setDishName(item.getDish().getName());
        response.setQuantity(item.getQuantity());
        response.setUnitPrice(item.getUnitPrice());
        response.setSubtotal(item.getSubtotal());

        if (item.getDish().getRestaurant() != null) {
            response.setRestaurantName(
                    item.getDish().getRestaurant().getName());
        }

        return response;
    }

    private OrderResponse convertToResponse(Order order) {

        OrderResponse response = new OrderResponse();

        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        response.setTotalAmount(order.getTotalAmount());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setPaymentStatus(order.getPaymentStatus());
        response.setOrderStatus(order.getOrderStatus().name());
        response.setDeliveryAddress(order.getDeliveryAddress());
        response.setCreatedAt(order.getCreatedAt());

        List<OrderItemResponse> items =
                orderItemRepository.findByOrderId(order.getId())
                        .stream()
                        .map(this::convertItemToResponse)
                        .toList();

        response.setItems(items);

        return response;
    }

    @GetMapping
    public ResponseEntity<?> getRestaurantOrders(
            @PathVariable Long restaurantId,
            Authentication authentication) {

        try {
            Long ownerId = getCurrentOwnerId(authentication);

            List<OrderResponse> orders =
                    orderService.getOrdersForRestaurantOwner(
                            restaurantId, ownerId)
                            .stream()
                            .map(this::convertToResponse)
                            .toList();

            return ResponseEntity.ok(orders);

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest()
                    .body(exception.getMessage());
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getOrdersByStatus(
            @PathVariable Long restaurantId,
            @RequestParam OrderStatus status,
            Authentication authentication) {

        try {
            Long ownerId = getCurrentOwnerId(authentication);

            List<OrderResponse> orders =
                    orderService.getOrdersForRestaurantOwnerByStatus(
                            restaurantId, ownerId, status)
                            .stream()
                            .map(this::convertToResponse)
                            .toList();

            return ResponseEntity.ok(orders);

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest()
                    .body(exception.getMessage());
        }
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long restaurantId,
            @PathVariable Long orderId,
            @RequestParam OrderStatus status,
            Authentication authentication) {

        try {
            Long ownerId = getCurrentOwnerId(authentication);

            Order order =
                    orderService.updateOrderStatusForRestaurantOwner(
                            restaurantId, ownerId, orderId, status);

            return ResponseEntity.ok(convertToResponse(order));

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest()
                    .body(exception.getMessage());
        }
    }
}