package com.takeit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.takeit.entity.OrderItem;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long>{

	List<OrderItem> findByOrderId(Long orderId);
	
	List<OrderItem> findByDishId(Long dishId);
}
