package com.takeit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.takeit.entity.Dish;

@Repository
public interface DishRepository extends JpaRepository<Dish, Long>{
	
	List<Dish> findByRestaurantId(Long restaurantId);
	
	List<Dish> findByRestaurantIdAndAvailableTrue(Long restaurantId);
	
	List<Dish> findByCategoryId(Long categoryId);
	
	List<Dish> findByCategoryIdAndAvailableTrue(Long categoryId);
	
	List<Dish> findByNameContainingIgnoreCase(String name);
	
	List<Dish> findByRestaurantIdAndNameContainingIgnoreCase(
			Long restaurantId,
			String name);
	
	boolean existsByNameIgnoreCaseAndRestaurantId(
			String name,
			Long restaurantId);
	
	long countByRestaurantOwnerId(Long ownerId);
	long countByRestaurantOwnerIdAndAvailableTrue(Long ownerId);
	long countByRestaurantOwnerIdAndAvailableFalse(Long ownerId);

}
