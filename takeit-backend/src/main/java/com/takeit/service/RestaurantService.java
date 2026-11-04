package com.takeit.service;

import java.util.List;
import java.util.Optional;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.takeit.dto.RestaurantOwnerDashboardResponse;
import com.takeit.entity.Restaurant;
import com.takeit.repository.DishRepository;
import com.takeit.repository.RestaurantRepository;

@Service
public class RestaurantService {
	
	private final RestaurantRepository restaurantRepository;
	private final DishRepository dishRepository;
	
	public RestaurantService(
	        RestaurantRepository restaurantRepository,
	        DishRepository dishRepository) {
	    this.restaurantRepository = restaurantRepository;
	    this.dishRepository = dishRepository;
	}
	
	public List<Restaurant> getAllRestaurants(){
		return restaurantRepository.findAll();
		}
	
	public List<Restaurant> getActiveRestaurants(){
		return restaurantRepository.findByActiveTrue();
	}
	
	public Optional<Restaurant> getRestaurantById(Long id){
		return restaurantRepository.findById(id);
	}
	
	public List<Restaurant> searchRestaurants(String name){
		return restaurantRepository.findByNameContainingIgnoreCase(name);
	}
		
	public List<Restaurant> getRestaurantsByCuisine (String cuisineType){
		return restaurantRepository.findByCuisineTypeIgnoreCase(cuisineType);
		
	}
	public Restaurant saveRestaurant(Restaurant restaurant) {
		return restaurantRepository.save(restaurant);
		
	}
	@Transactional(readOnly = true)
	public List<Restaurant> getRestaurantByOwner(Long ownerId){
	return restaurantRepository.findByOwnerId(ownerId);
	
	}
	
	@Transactional(readOnly = true)
	public List<Restaurant> getActiveRestaurantsByOwner(Long ownerId){
		return restaurantRepository.findByOwnerIdAndActiveTrue(ownerId);
	}
	
	@Transactional
	public Restaurant updateRestaurantByOwner(
	        Long restaurantId,
	        Long ownerId,
	        Restaurant updatedRestaurant) {

	    Restaurant existingRestaurant = restaurantRepository
	            .findById(restaurantId)
	            .orElseThrow(() ->
	                    new RuntimeException("Restaurant not found"));


	    if (existingRestaurant.getOwner() == null
	            || !existingRestaurant.getOwner().getId().equals(ownerId)) {
	        throw new AccessDeniedException(
	                "You are not allowed to update this restaurant");
	    }


	    existingRestaurant.setName(updatedRestaurant.getName());
	    existingRestaurant.setDescription(updatedRestaurant.getDescription());
	    existingRestaurant.setAddress(updatedRestaurant.getAddress());
	    existingRestaurant.setCuisineType(updatedRestaurant.getCuisineType());
	    existingRestaurant.setImageUrl(updatedRestaurant.getImageUrl());

	    return restaurantRepository.save(existingRestaurant);
	}
	
	public void deactivateRestaurantByOwner(Long restaurantId, Long ownderId) {
	
		Restaurant restaurant = restaurantRepository.findById(restaurantId)
			.orElseThrow(()-> new RuntimeException("Restaurant not found"));
	
	if(restaurant.getOwner() == null
		|| !restaurant.getOwner().getId().equals(ownderId)) {
		throw new org.springframework.security.access.AccessDeniedException(
				"You are not allowed to deactivate this restaurant");
	
	}

	restaurant.setActive(false);
	restaurantRepository.save(restaurant);
	}
	
	@Transactional
	public void reactiveRestaurantByOwner(Long restaurantId, Long ownerId) {
		
		Restaurant restaurant = restaurantRepository.findById(restaurantId)
				.orElseThrow(()-> new RuntimeException("Restaurant not found"));
		
		if(restaurant.getOwner() == null
				|| !restaurant.getOwner().getId().equals(ownerId)) {
			throw new org.springframework.security.access.AccessDeniedException(
					"You are not allowed to reactive this restaurant");
		}
		
		restaurant.setActive(true);
		restaurantRepository.save(restaurant);
	}
	
	@Transactional(readOnly = true)
	public RestaurantOwnerDashboardResponse getOwnerDashboard(Long ownerId) {

	    long totalRestaurants =
	            restaurantRepository.countByOwnerId(ownerId);

	    long activeRestaurants =
	            restaurantRepository.countByOwnerIdAndActiveTrue(ownerId);

	    long inactiveRestaurants =
	            totalRestaurants - activeRestaurants;

	    long totalDishes =
	            dishRepository.countByRestaurantOwnerId(ownerId);

	    long availableDishes =
	            dishRepository.countByRestaurantOwnerIdAndAvailableTrue(ownerId);

	    long unavailableDishes =
	            dishRepository.countByRestaurantOwnerIdAndAvailableFalse(ownerId);

	    return new RestaurantOwnerDashboardResponse(
	            totalRestaurants,
	            activeRestaurants,
	            inactiveRestaurants,
	            totalDishes,
	            availableDishes,
	            unavailableDishes
	    );
	}
 
}
