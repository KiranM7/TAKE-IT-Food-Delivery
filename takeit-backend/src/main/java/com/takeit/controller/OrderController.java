
package com.takeit.controller;

import com.takeit.dto.OrderItemResponse;

import com.takeit.dto.OrderResponse;
import com.takeit.entity.Order;
import com.takeit.entity.OrderItem;
import com.takeit.entity.User;
import com.takeit.enums.OrderStatus;
import com.takeit.repository.OrderItemRepository;
import com.takeit.repository.UserRepository;
import com.takeit.service.OrderService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


import java.util.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;

    public OrderController(
            OrderService orderService,
            UserRepository userRepository,
            OrderItemRepository orderItemRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
        this.orderItemRepository = orderItemRepository;
    }

    private Long getCurrentUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalArgumentException("User is not authenticated");
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        return user.getId();
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
        
        User customer = order.getUser();

        if (customer != null) {
            response.setCustomerName(customer.getFullName());
            response.setCustomerEmail(customer.getEmail());
        }

        List<OrderItemResponse> items =
                orderItemRepository.findByOrderId(order.getId())
                        .stream()
                        .map(this::convertItemToResponse)
                        .toList();

        response.setItems(items);

        return response;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestParam String paymentMethod,
            @RequestParam String deliveryAddress,
            Authentication authentication) {

        try {
            Long userId = getCurrentUserId(authentication);

            Order order = orderService.createOrder(
                    userId, paymentMethod, deliveryAddress);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(convertToResponse(order));

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest()
                    .body(exception.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getOrderHistory(
            Authentication authentication) {

        try {
            Long userId = getCurrentUserId(authentication);

            List<OrderResponse> orders =
                    orderService.getOrderHistory(userId)
                            .stream()
                            .map(this::convertToResponse)
                            .toList();

            return ResponseEntity.ok(orders);

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest()
                    .body(exception.getMessage());
        }
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(
            @PathVariable Long orderId,
            Authentication authentication) {

        try {
            Long userId = getCurrentUserId(authentication);

            Order order = orderService.getOrderById(userId, orderId);

            if (order == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Order not found");
            }

            return ResponseEntity.ok(convertToResponse(order));

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest()
                    .body(exception.getMessage());
        }
    }
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status) {
    	
    	try {
    		Order order = orderService.updateOrderStatus(orderId, status);
    		return ResponseEntity.ok(convertToResponse(order));
    	}catch(IllegalArgumentException e) {
    		return ResponseEntity.badRequest().body(e.getMessage());
    	}
    	
    }
    

@PutMapping("/{orderId}/cancel")
@PreAuthorize("hasRole('USER')")
public ResponseEntity<?> cancelOrder(
        @PathVariable Long orderId,
        Authentication authentication) {

    try {
        Long userId = getCurrentUserId(authentication);

        Order order = orderService.cancelOrder(userId, orderId);

        return ResponseEntity.ok(convertToResponse(order));

    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}

@GetMapping("/admin/all")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<List<OrderResponse>> getAllOrders(){
	
	List<OrderResponse> orders = orderService.getAllOrders()
			.stream()
			.map(this::convertToResponse)
			.toList();
	
	return ResponseEntity.ok(orders);
}

@GetMapping("/admin/status")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> getOrdersByStatus(
		@RequestParam OrderStatus status){
	
	try {
		List<OrderResponse> orders = orderService
				.getOrdersByStatus(status)
				.stream()
				.map(this::convertToResponse)
				.toList();
		
		return ResponseEntity.ok(orders);
	


	}catch(IllegalArgumentException e) {
		return ResponseEntity.badRequest().body(e.getMessage());
		}
	}
	
	@GetMapping("/admin/statistics")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<java.util.Map<String, Object>> getOrderStatistics() {
		return ResponseEntity.ok(orderService.getOrderStatistics());
	}
	
	@PostMapping("/razorpay/create")
	public ResponseEntity<?> createRazorpayPaymentOrder(
	        @RequestParam String deliveryAddress,
	        Authentication authentication) {

	    try {
	        Long userId = getCurrentUserId(authentication);

	        Map<String, Object> response =
	                orderService.createRazorpayPaymentOrder(
	                        userId, deliveryAddress);

	        return ResponseEntity.status(HttpStatus.CREATED)
	                .body(response);

	    } catch (IllegalArgumentException e) {
	        return ResponseEntity.badRequest()
	                .body(Map.of("message", e.getMessage()));

	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body(Map.of(
	                        "message",
	                        "Unable to create Razorpay payment order."
	                ));
	    }
	        
	}

	@PostMapping("/razorpay/verify")
	public ResponseEntity<?> verifyRazorpayPayment(
	        @RequestBody Map<String, Object> request,
	        Authentication authentication) {

	    try {
	        Long userId = getCurrentUserId(authentication);

	        Long orderId = Long.valueOf(
	                request.get("orderId").toString());

	        String razorpayPaymentId =
	                request.get("razorpayPaymentId").toString();

	        String razorpaySignature =
	                request.get("razorpaySignature").toString();

	        Order order = orderService.verifyRazorpayPayment(
	                userId,
	                orderId,
	                razorpayPaymentId,
	                razorpaySignature
	        );

	        return ResponseEntity.ok(convertToResponse(order));

	    } catch (IllegalArgumentException e) {
	        return ResponseEntity.badRequest()
	                .body(Map.of("message", e.getMessage()));

	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body(Map.of(
	                        "message",
	                        "Unable to verify Razorpay payment."
	                ));
	    }
	}

}
