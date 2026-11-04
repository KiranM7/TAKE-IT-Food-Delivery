package com.takeit.service;

import java.math.BigDecimal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.takeit.entity.CartItem;
import com.takeit.entity.Order;
import com.takeit.entity.OrderItem;
import com.takeit.enums.OrderStatus;
import com.takeit.repository.CartItemRepository;
import com.takeit.repository.OrderItemRepository;
import com.takeit.repository.OrderRepository;
import com.takeit.repository.UserRepository;
import com.takeit.entity.Restaurant;
import com.takeit.repository.RestaurantRepository;

import java.util.LinkedHashMap;
import java.util.Map;
import java.math.RoundingMode;


import org.json.JSONObject;

import com.takeit.service.RazorpayService;

@Service
public class OrderService {
	
	private static final Logger logger =
	        LoggerFactory.getLogger(OrderService.class);
	
	private final OrderRepository orderRepository;
	private final OrderItemRepository orderItemRepository;
	private final CartItemRepository cartItemRepository;
	private final UserRepository userRepository;
	private final CartService cartService;
	private final RestaurantRepository restaurantRepository;
	private final RazorpayService razorpayService;
	
	public OrderService(
	        OrderRepository orderRepository,
	        OrderItemRepository orderItemRepository,
	        CartItemRepository cartItemRepository,
	        UserRepository userRepository,
	        CartService cartService,
	        RestaurantRepository restaurantRepository,
	        RazorpayService razorpayService) {

	    this.orderRepository = orderRepository;
	    this.orderItemRepository = orderItemRepository;
	    this.cartItemRepository = cartItemRepository;
	    this.userRepository = userRepository;
	    this.cartService = cartService;
	    this.restaurantRepository = restaurantRepository;
	    this.razorpayService = razorpayService;
	}
	@Transactional
	public Order createOrder(
			Long userId,
			String paymentMethod,
			String deliveryAddress) {
		
		if (!"COD".equals(paymentMethod)) {
		    throw new IllegalArgumentException(
		            "Use the dedicated payment flow for online payments.");
		}
		
		if(deliveryAddress == null || deliveryAddress.isBlank()) {
			throw new IllegalArgumentException(
					"Delivery address is requried.");
		}
		
		var user = userRepository.findById(userId)
				.orElseThrow(()->
				new IllegalArgumentException("User not found."));
		
		List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
				
				if(cartItems.isEmpty()) {
					throw new IllegalArgumentException(
							"Cannot place an order with an empty cart.");
				}
		BigDecimal total = BigDecimal.ZERO;
		
		for(CartItem cartItem : cartItems) {
			if(!cartItem.getDish().isAvailable()) {
				throw new IllegalArgumentException(
						"Dish is unavailable: "+cartItem.getDish().getName());
			}
			
			BigDecimal unitPrice = 
					cartService.getUnitPrice(cartItem.getDish());
			
			BigDecimal subtotal = unitPrice.multiply(
					BigDecimal.valueOf(cartItem.getQuantity()));
			
			total = total.add(subtotal);
		}
		
		Order order = new Order();
		order.setUser(user);
		order.setTotalAmount(total);
		order.setPaymentMethod(paymentMethod);
		order.setDeliveryAddress(deliveryAddress);
		order.setOrderStatus(OrderStatus.PLACED);
		order.setPaymentStatus("PENDING");

		Order savedOrder = orderRepository.save(order);
		
		for(CartItem cartItem : cartItems) {
			BigDecimal unitPrice =
					cartService.getUnitPrice(cartItem.getDish());
			
			BigDecimal subtotal = unitPrice.multiply(
					BigDecimal.valueOf(cartItem.getQuantity()));
			
			OrderItem orderItem = new OrderItem();
			
			orderItem.setOrder(savedOrder);
			orderItem.setDish(cartItem.getDish());
			orderItem.setQuantity(cartItem.getQuantity());
			orderItem.setUnitPrice(unitPrice);
			orderItem.setSubtotal(subtotal);
			
			orderItemRepository.save(orderItem);
		}
		
		cartItemRepository.deleteByUserId(userId);
		
		return savedOrder;
	}
	
	@Transactional
	public Map<String, Object> createRazorpayPaymentOrder(
	        Long userId,
	        String deliveryAddress) throws Exception {

	    if (deliveryAddress == null || deliveryAddress.isBlank()) {
	        throw new IllegalArgumentException(
	                "Delivery address is required.");
	    }

	    var user = userRepository.findById(userId)
	            .orElseThrow(() ->
	                    new IllegalArgumentException("User not found."));

	    List<CartItem> cartItems =
	            cartItemRepository.findByUserId(userId);

	    if (cartItems.isEmpty()) {
	        throw new IllegalArgumentException(
	                "Cannot place an order with an empty cart.");
	    }

	    BigDecimal total = BigDecimal.ZERO;

	    for (CartItem item : cartItems) {
	        if (!item.getDish().isAvailable()) {
	            throw new IllegalArgumentException(
	                    "Dish is unavailable: "
	                    + item.getDish().getName());
	        }

	        BigDecimal unitPrice =
	                cartService.getUnitPrice(item.getDish());

	        BigDecimal subtotal = unitPrice.multiply(
	                BigDecimal.valueOf(item.getQuantity()));

	        total = total.add(subtotal);
	    }

	    if (total.signum() <= 0) {
	        throw new IllegalArgumentException(
	                "Order total must be greater than zero.");
	    }

	    Order order = new Order();
	    order.setUser(user);
	    order.setTotalAmount(total);
	    order.setPaymentMethod("RAZORPAY");
	    order.setPaymentStatus("PENDING");
	    order.setOrderStatus(OrderStatus.PLACED);
	    order.setDeliveryAddress(deliveryAddress);

	    Order savedOrder = orderRepository.saveAndFlush(order);

	    for (CartItem item : cartItems) {
	        BigDecimal unitPrice =
	                cartService.getUnitPrice(item.getDish());

	        BigDecimal subtotal = unitPrice.multiply(
	                BigDecimal.valueOf(item.getQuantity()));

	        OrderItem orderItem = new OrderItem();
	        orderItem.setOrder(savedOrder);
	        orderItem.setDish(item.getDish());
	        orderItem.setQuantity(item.getQuantity());
	        orderItem.setUnitPrice(unitPrice);
	        orderItem.setSubtotal(subtotal);

	        orderItemRepository.save(orderItem);
	    }

	    long amountInPaise = total
	            .multiply(BigDecimal.valueOf(100))
	            .setScale(0, RoundingMode.UNNECESSARY)
	            .longValueExact();

	    JSONObject razorpayResponse =
	            razorpayService.createRazorpayOrder(
	                    amountInPaise,
	                    savedOrder.getOrderNumber());

	    String razorpayOrderId =
	            razorpayResponse.getString("razorpayOrderId");

	    savedOrder.setRazorpayOrderId(razorpayOrderId);
	    orderRepository.save(savedOrder);

	    Map<String, Object> response = new LinkedHashMap<>();
	    response.put("orderId", savedOrder.getId());
	    response.put("orderNumber", savedOrder.getOrderNumber());
	    response.put("totalAmount", savedOrder.getTotalAmount());
	    response.put("paymentMethod", savedOrder.getPaymentMethod());
	    response.put("paymentStatus", savedOrder.getPaymentStatus());
	    response.put("razorpayOrderId", razorpayOrderId);
	    response.put("amount", razorpayResponse.getLong("amount"));
	    response.put("currency", razorpayResponse.getString("currency"));
	    response.put("keyId", razorpayResponse.getString("keyId"));

	    return response;
	}
	
	@Transactional
	public Order verifyRazorpayPayment(
	        Long userId,
	        Long orderId,
	        String razorpayPaymentId,
	        String razorpaySignature) throws Exception {

	    // 1. Find the order belonging to the current user
	    Order order = orderRepository.findById(orderId)
	            .filter(existing ->
	                    existing.getUser().getId().equals(userId))
	            .orElseThrow(() ->
	                    new IllegalArgumentException(
	                            "Order not found for this user."));

	    // 2. Validate the payment method
	    if (!"RAZORPAY".equals(order.getPaymentMethod())) {
	        throw new IllegalArgumentException(
	                "This order does not use Razorpay.");
	    }

	    // 3. Validate the stored Razorpay order ID
	    String storedRazorpayOrderId = order.getRazorpayOrderId();

	    if (storedRazorpayOrderId == null
	            || storedRazorpayOrderId.isBlank()) {
	        throw new IllegalArgumentException(
	                "Razorpay order ID is missing.");
	    }

	    // 4. If already paid, return the existing order
	    if ("PAID".equals(order.getPaymentStatus())) {
	        return order;
	    }

	    // 5. Check payment status
	    if (!"PENDING".equals(order.getPaymentStatus())) {
	        throw new IllegalArgumentException(
	                "This order is not awaiting payment.");
	    }

	    // 6. Validate the payment details
	    if (razorpayPaymentId == null
	            || razorpayPaymentId.isBlank()
	            || razorpaySignature == null
	            || razorpaySignature.isBlank()) {
	        throw new IllegalArgumentException(
	                "Payment ID and signature are required.");
	    }

	    // 7. Debug: compare the order ID used for verification
	    System.out.println("========== RAZORPAY VERIFICATION ==========");
	    System.out.println("Internal Order ID: " + order.getId());
	    System.out.println(
	            "Stored Razorpay Order ID: " + storedRazorpayOrderId);
	    System.out.println(
	            "Received Payment ID: " + razorpayPaymentId);

	    // 8. Verify the Razorpay signature
	    boolean valid;

	    try {
	        valid = razorpayService.verifyPaymentSignature(
	                storedRazorpayOrderId,
	                razorpayPaymentId,
	                razorpaySignature);

	    } catch (Exception e) {
	        System.err.println(
	                "Signature verification exception: "
	                + e.getClass().getSimpleName());

	        // Do not log secrets or the complete signature
	        throw new IllegalArgumentException(
	                "Unable to verify Razorpay payment. "
	                + "Check the server configuration.");
	    }

	    System.out.println(
	            "Signature verification result: " + valid);
	    System.out.println("============================================");

	    // 9. Reject invalid signatures
	    if (!valid) {
	        throw new IllegalArgumentException(
	                "Payment verification failed.");
	    }

	 // 10. Verify that Razorpay confirms the payment was captured.
	    long expectedAmountInPaise = order.getTotalAmount()
	            .multiply(BigDecimal.valueOf(100))
	            .setScale(0, RoundingMode.UNNECESSARY)
	            .longValueExact();

	    boolean captured;

	    try {
	        captured = razorpayService.verifyCapturedPayment(
	                razorpayPaymentId,
	                storedRazorpayOrderId,
	                expectedAmountInPaise
	        );
	    } catch (Exception e) {
	        throw new IllegalArgumentException(
	                "Unable to confirm payment with Razorpay. Please try again."
	        );
	    }

	    if (!captured) {
	        throw new IllegalArgumentException(
	                "Payment has not been captured or payment details do not match."
	        );
	    }

	    // 11. Mark the payment as successful only after both verifications.
	    order.setPaymentStatus("PAID");

	    Order savedOrder = orderRepository.save(order);

	    // 12. Clear the user's cart after successful verification.
	    cartItemRepository.deleteByUserId(userId);

	    return savedOrder;
	}
	
	@Transactional(readOnly = true)
	public List<Order> getOrderHistory(Long userId){
		return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
		
	}
	
	@Transactional(readOnly = true)
	public Order getOrderById(Long userId, Long orderId) {
		return orderRepository.findById(orderId)
				.filter(order ->
				order.getUser().getId().equals(userId))
				.orElseThrow(()->
				new IllegalArgumentException(
						"Order not found for this user."));
	}
	

@Transactional
public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {

    Order order = orderRepository.findById(orderId)
            .orElseThrow(() ->
                    new IllegalArgumentException("Order not found"));

    if (newStatus == null) {
        throw new IllegalArgumentException(
                "Order status is required");
    }

    OrderStatus currentStatus = order.getOrderStatus();
    
 // Prevent unpaid Razorpay orders from being processed.
    if ("RAZORPAY".equalsIgnoreCase(order.getPaymentMethod())
            && !"PAID".equalsIgnoreCase(order.getPaymentStatus())
            && newStatus != OrderStatus.CANCELLED) {

        throw new IllegalArgumentException(
                "Razorpay payment must be completed before processing this order."
        );
    }

    if (currentStatus == OrderStatus.DELIVERED
            || currentStatus == OrderStatus.CANCELLED) {
        throw new IllegalArgumentException(
                "Delivered or cancelled orders cannot be changed");
    }

    boolean validTransition = switch (currentStatus) {
        case PLACED ->
                newStatus == OrderStatus.CONFIRMED
                || newStatus == OrderStatus.CANCELLED;

        case CONFIRMED ->
                newStatus == OrderStatus.PREPARING
                || newStatus == OrderStatus.CANCELLED;

        case PREPARING ->
                newStatus == OrderStatus.OUT_FOR_DELIVERY
                || newStatus == OrderStatus.CANCELLED;

        case OUT_FOR_DELIVERY ->
                newStatus == OrderStatus.DELIVERED;

        case DELIVERED, CANCELLED -> false;
    };

    if (!validTransition) {
        throw new IllegalArgumentException(
                "Invalid order status transition from "
                + currentStatus + " to " + newStatus);
    }

    order.setOrderStatus(newStatus);

    return orderRepository.save(order);
}


@Transactional
public Order cancelOrder(Long userId, Long orderId) {

    Order order = orderRepository.findById(orderId)
            .filter(existingOrder ->
                    existingOrder.getUser().getId().equals(userId))
            .orElseThrow(() ->
                    new IllegalArgumentException(
                            "Order not found for this user"));

    if (order.getOrderStatus() != OrderStatus.PLACED) {
        throw new IllegalArgumentException(
                "Only orders with PLACED status can be cancelled");
    }

    order.setOrderStatus(OrderStatus.CANCELLED);

    return orderRepository.save(order);
}


@Transactional(readOnly = true)
public List<Order> getAllOrders() {
    return orderRepository.findAll(
            org.springframework.data.domain.Sort
                    .by(org.springframework.data.domain.Sort.Direction.DESC,
                            "createdAt")
    );
}

	@Transactional(readOnly = true)
	public List<Order> getOrdersByStatus(OrderStatus status){
		if(status == null) {
			throw new IllegalArgumentException("Order status is rquired.");
		}
		return orderRepository.findByOrderStatus(status);
	}
	
	@Transactional(readOnly = true)
	public java.util.Map<String, Object> getOrderStatistics() {

	    java.util.Map<String, Object> statistics =
	            new java.util.LinkedHashMap<>();

	    statistics.put("totalOrders", orderRepository.count());

	    statistics.put("placedOrders",
	            orderRepository.countByOrderStatus(OrderStatus.PLACED));

	    statistics.put("confirmedOrders",
	            orderRepository.countByOrderStatus(OrderStatus.CONFIRMED));

	    statistics.put("preparingOrders",
	            orderRepository.countByOrderStatus(OrderStatus.PREPARING));

	    statistics.put("outForDeliveryOrders",
	            orderRepository.countByOrderStatus(OrderStatus.OUT_FOR_DELIVERY));

	    statistics.put("deliveredOrders",
	            orderRepository.countByOrderStatus(OrderStatus.DELIVERED));

	    statistics.put("cancelledOrders",
	            orderRepository.countByOrderStatus(OrderStatus.CANCELLED));

	    statistics.put("pendingPayments",
	            orderRepository.countByPaymentStatus("PENDING"));

	    statistics.put("paidPayments",
	            orderRepository.countByPaymentStatus("PAID"));

	    BigDecimal revenue = orderRepository.sumTotalAmountByOrderStatus(
	            OrderStatus.DELIVERED
	    );

	    statistics.put(
	            "totalRevenue",
	            revenue != null ? revenue : BigDecimal.ZERO
	    );

	    return statistics;
	    
	    
	}

	private Restaurant verifyRestaurantOwnership(
	        Long restaurantId, Long ownerId) {

	    Restaurant restaurant = restaurantRepository.findById(restaurantId)
	            .orElseThrow(() ->
	                    new IllegalArgumentException("Restaurant not found"));

	    if (restaurant.getOwner() == null
	            || !restaurant.getOwner().getId().equals(ownerId)) {
	        throw new IllegalArgumentException(
	                "You do not own this restaurant");
	    }

	    return restaurant;
	}


	@Transactional(readOnly = true)
	public List<Order> getOrdersForRestaurantOwner(
	        Long restaurantId, Long ownerId) {

	    verifyRestaurantOwnership(restaurantId, ownerId);

	    return orderRepository.findOrdersByRestaurantId(restaurantId);
	}


	@Transactional(readOnly = true)
	public List<Order> getOrdersForRestaurantOwnerByStatus(
	        Long restaurantId,
	        Long ownerId,
	        OrderStatus status) {

	    verifyRestaurantOwnership(restaurantId, ownerId);

	    if (status == null) {
	        throw new IllegalArgumentException(
	                "Order status is required");
	    }

	    return orderRepository.findOrdersByRestaurantIdAndStatus(
	            restaurantId, status);
	}


	@Transactional
	public Order updateOrderStatusForRestaurantOwner(
	        Long restaurantId,
	        Long ownerId,
	        Long orderId,
	        OrderStatus newStatus) {

	    verifyRestaurantOwnership(restaurantId, ownerId);

	    if (newStatus == null) {
	        throw new IllegalArgumentException(
	                "Order status is required");
	    }

	    Order order = orderRepository.findById(orderId)
	            .orElseThrow(() ->
	                    new IllegalArgumentException("Order not found"));

	    boolean orderBelongsToRestaurant =
	            orderItemRepository.findByOrderId(orderId)
	                    .stream()
	                    .anyMatch(item ->
	                            item.getDish().getRestaurant() != null
	                            && item.getDish().getRestaurant()
	                                    .getId().equals(restaurantId));

	    if (!orderBelongsToRestaurant) {
	        throw new IllegalArgumentException(
	                "This order does not contain dishes from your restaurant");
	    }

	    return updateOrderStatus(orderId, newStatus);
	}
	
	
}

