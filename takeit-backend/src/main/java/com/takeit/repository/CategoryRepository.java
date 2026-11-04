package com.takeit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.takeit.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long>{

	List<Category> findByRestaurantId(Long restaurantId);

    List<Category> findByRestaurantIdAndActiveTrue(Long restaurantId);
	
	 boolean existsByNameIgnoreCaseAndRestaurantId(String name, Long restaurantId);
}
