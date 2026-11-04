package com.takeit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.takeit.entity.Restaurant;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long>{

	List<Restaurant> findByActiveTrue();
	
	List<Restaurant> findByCuisineTypeIgnoreCase(String cuisineType);
	
	List<Restaurant> findByNameContainingIgnoreCase(String name);
	
	List<Restaurant> findByOwnerId(Long ownerId);
	
	List<Restaurant> findByOwnerIdAndActiveTrue(Long ownerId);
	
	long countByOwnerId(Long ownerId);

	long countByOwnerIdAndActiveTrue(Long ownerId);
}
