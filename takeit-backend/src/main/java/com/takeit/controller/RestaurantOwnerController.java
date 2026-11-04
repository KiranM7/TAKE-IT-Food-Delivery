package com.takeit.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.takeit.dto.RestaurantOwnerDashboardResponse;
import com.takeit.dto.RestaurantResponse;
import com.takeit.entity.Restaurant;
import com.takeit.entity.User;
import com.takeit.repository.UserRepository;
import com.takeit.service.RestaurantService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/owner/restaurants")
@PreAuthorize("hasRole('RESTAURANT_OWNER')")
public class RestaurantOwnerController {

    private final RestaurantService restaurantService;
    private final UserRepository userRepository;

    public RestaurantOwnerController(
            RestaurantService restaurantService,
            UserRepository userRepository) {
        this.restaurantService = restaurantService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<RestaurantResponse>> getMyRestaurants(
            Authentication authentication) {

        String email = authentication.getName();

        User owner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Restaurant owner not found"));

        List<RestaurantResponse> restaurants =
                restaurantService.getRestaurantByOwner(owner.getId())
                .stream()
                .map(this::convertToResponse)
                .toList();
        
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/active")
    public ResponseEntity<List<RestaurantResponse>> getMyActiveRestaurants(
            Authentication authentication) {

        String email = authentication.getName();

        User owner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Restaurant owner not found"));

        List<RestaurantResponse> restaurants =
                restaurantService.getActiveRestaurantsByOwner(owner.getId())
                .stream()
                .map(this::convertToResponse)
                .toList();

        return ResponseEntity.ok(restaurants);
    }
    
    @PostMapping
	  public ResponseEntity<RestaurantResponse> createMyRestaurant(
	          @Valid @RequestBody Restaurant restaurant,
	          Authentication authentication) {

	      String email = authentication.getName();

	      User owner = userRepository.findByEmail(email)
	              .orElseThrow(() ->
	                      new RuntimeException("Restaurant owner not found"));

	      restaurant.setOwner(owner);

	      Restaurant savedRestaurant =
	              restaurantService.saveRestaurant(restaurant);

	      return ResponseEntity.status(HttpStatus.CREATED)
	              .body(convertToResponse(savedRestaurant));
	  }
    
    private RestaurantResponse convertToResponse(Restaurant restaurant) {
    	return new RestaurantResponse(
                restaurant.getId(),
                restaurant.getName(),
                restaurant.getDescription(),
                restaurant.getAddress(),
                restaurant.getCuisineType(),
                restaurant.getImageUrl(),
                restaurant.isActive()
        );
    }
    
    @PutMapping("/{restaurantId}")
    public ResponseEntity<RestaurantResponse> updateMyRestaurant(
            @PathVariable Long restaurantId,
            @Valid @RequestBody Restaurant updatedRestaurant,
            Authentication authentication) {

        String email = authentication.getName();

        User owner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Restaurant owner not found"));

        Restaurant updated = restaurantService.updateRestaurantByOwner(
                restaurantId,
                owner.getId(),
                updatedRestaurant
        );

        RestaurantResponse response = convertToResponse(updated);

        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/{restaurantId}")
    public ResponseEntity<String> deactiveRestaurant(
    		@PathVariable Long restaurantId,
    		Authentication authentication){
    	
    	User owner = userRepository.findByEmail(authentication.getName())
    			.orElseThrow(()-> new RuntimeException("Owner not found"));
    	
    	restaurantService.deactivateRestaurantByOwner(restaurantId, owner.getId());
    	
    	return ResponseEntity.ok("Restaurant deactivated successfully");
    }
    
    @PatchMapping("/{restaurantId}/reactivate")
    public ResponseEntity<String> reactivateRestaurant(
    		@PathVariable Long restaurantId,
    		Authentication authentication){
    	
    	User owner = userRepository.findByEmail(authentication.getName())
    			.orElseThrow(()-> new RuntimeException("Owner not found"));
    	
    	restaurantService.reactiveRestaurantByOwner(restaurantId, owner.getId());
    	
    	return ResponseEntity.ok("Restaurant reactivated successfully");
    	
    }
    
    @GetMapping("/dashboard")
    public ResponseEntity<RestaurantOwnerDashboardResponse> getDashboard(
    		Authentication authentication){
    	
    	User owner = userRepository.findByEmail(authentication.getName())
    			.orElseThrow(()-> new RuntimeException("Owner not found"));
    	
    	RestaurantOwnerDashboardResponse dashboard = 
    			restaurantService.getOwnerDashboard(owner.getId());
    	
    	return ResponseEntity.ok(dashboard);
    }
}
	