package com.takeit.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.takeit.entity.Order;
import com.takeit.entity.User;
import com.takeit.repository.UserRepository;
import com.takeit.service.OrderService;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    public PaymentController(
            OrderService orderService,
            UserRepository userRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    private Long getCurrentUserId(Authentication authentication) {

        if (authentication == null
                || authentication.getName() == null) {
            throw new IllegalArgumentException(
                    "User is not authenticated.");
        }

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found."));

        return user.getId();
    }

    @PostMapping("/razorpay/create-order")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createRazorpayOrder(
            @RequestParam String deliveryAddress,
            Authentication authentication) {

        try {
            Long userId = getCurrentUserId(authentication);

            Map<String, Object> response =
                    orderService.createRazorpayPaymentOrder(
                            userId, deliveryAddress);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message", "Unable to create the payment order.",
                            "error", e.getMessage() == null
                                    ? "No error message available."
                                    : e.getMessage()
                    ));
        }
    }

    @PostMapping("/razorpay/verify")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> verifyRazorpayPayment(
            @RequestBody PaymentVerificationRequest request,
            Authentication authentication) {

        try {
            if (request == null
                    || request.orderId() == null
                    || request.razorpayPaymentId() == null
                    || request.razorpaySignature() == null) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Order ID, payment ID and signature are required."));
            }

            Long userId = getCurrentUserId(authentication);

            Order order = orderService.verifyRazorpayPayment(
                    userId,
                    request.orderId(),
                    request.razorpayPaymentId(),
                    request.razorpaySignature());

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("message", "Payment verified successfully.");
            response.put("orderId", order.getId());
            response.put("orderNumber", order.getOrderNumber());
            response.put("paymentStatus", order.getPaymentStatus());
            response.put("orderStatus", order.getOrderStatus().name());
            response.put("totalAmount", order.getTotalAmount());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Unable to verify the payment."));
        }
    }

    public record PaymentVerificationRequest(
            Long orderId,
            String razorpayPaymentId,
            String razorpaySignature) {
    }
}
