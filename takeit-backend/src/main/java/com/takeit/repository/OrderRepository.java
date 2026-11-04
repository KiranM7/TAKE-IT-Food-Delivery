package com.takeit.repository;

import java.util.List;
import com.takeit.entity.OrderItem;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.takeit.entity.Order;
import com.takeit.enums.OrderStatus;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>{

	Optional<Order> findByOrderNumber(String orderNumber);
	
	Optional<Order> findByRazorpayOrderId(String razorpayOrderId);
	
	List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
	
	List<Order> findByOrderStatus(OrderStatus orderStatus);
	
	boolean existsByOrderNumber(String orderNumber);
	
	long countByOrderStatus(OrderStatus orderStatus);
	long countByPaymentStatus(String paymentStatus);
	
	@Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.orderStatus = :status")
	BigDecimal sumTotalAmountByOrderStatus(@Param("status") OrderStatus status);
	
	@Query("""
		    SELECT DISTINCT o
		    FROM Order o
		    JOIN OrderItem oi ON oi.order.id = o.id
		    JOIN oi.dish d
		    WHERE d.restaurant.id = :restaurantId
		    ORDER BY o.createdAt DESC
		    """)
		List<Order> findOrdersByRestaurantId(
		        @Param("restaurantId") Long restaurantId);


		@Query("""
		    SELECT DISTINCT o
		    FROM Order o
		    JOIN OrderItem oi ON oi.order.id = o.id
		    JOIN oi.dish d
		    WHERE d.restaurant.id = :restaurantId
		      AND o.orderStatus = :status
		    ORDER BY o.createdAt DESC
		    """)
		List<Order> findOrdersByRestaurantIdAndStatus(
		        @Param("restaurantId") Long restaurantId,
		        @Param("status") OrderStatus status);


		@Query("""
		    SELECT COUNT(DISTINCT o.id)
		    FROM Order o
		    JOIN OrderItem oi ON oi.order.id = o.id
		    JOIN oi.dish d
		    WHERE d.restaurant.id = :restaurantId
		    """)
		long countOrdersByRestaurantId(
		        @Param("restaurantId") Long restaurantId);
}
