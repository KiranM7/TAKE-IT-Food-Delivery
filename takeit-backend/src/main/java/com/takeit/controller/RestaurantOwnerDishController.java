package com.takeit.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


import com.takeit.dto.DishRequestDTO;
import com.takeit.dto.DishResponseDTO;
import com.takeit.entity.User;
import com.takeit.repository.UserRepository;
import com.takeit.service.DishService;

@RestController
@RequestMapping("/api/owner/restaurants/{restaurantId}/dishes")
@PreAuthorize("hasRole('RESTAURANT_OWNER')")
public class RestaurantOwnerDishController {

    private final DishService dishService;
    private final UserRepository userRepository;

    public RestaurantOwnerDishController(
            DishService dishService,
            UserRepository userRepository) {
        this.dishService = dishService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<DishResponseDTO>> getRestaurantDishes(
            @PathVariable Long restaurantId,
            Authentication authentication) {

        User owner = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("Owner not found"));

        List<DishResponseDTO> dishes =
                dishService.getDishesByRestaurantOwner(
                        restaurantId, owner.getId());

        return ResponseEntity.ok(dishes);
    }

    @PostMapping
    public ResponseEntity<DishResponseDTO> addDish(
            @PathVariable Long restaurantId,
            @RequestBody DishRequestDTO request,
            Authentication authentication) {

        User owner = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("Owner not found"));

        DishResponseDTO createdDish =
                dishService.addDishForRestaurantOwner(
                        restaurantId,
                        owner.getId(),
                        request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(createdDish);
    }
    
    @PutMapping("/{dishId}")
    public ResponseEntity<DishResponseDTO> updateDish(
            @PathVariable Long restaurantId,
            @PathVariable Long dishId,
            @RequestBody DishRequestDTO request,
            Authentication authentication) {

        User owner = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("Owner not found"));

        DishResponseDTO updatedDish =
                dishService.updateDishForRestaurantOwner(
                        restaurantId,
                        dishId,
                        owner.getId(),
                        request);

        return ResponseEntity.ok(updatedDish);
    }
    
    @DeleteMapping("/{dishId}")
    public ResponseEntity<String> deleteDish(
    		@PathVariable Long restaurantId,
    		@PathVariable Long dishId,
    		Authentication authentication){
    	
    	User owner = userRepository.findByEmail(authentication.getName())
    			.orElseThrow(()-> new RuntimeException("Owner not found"));
    	
    	dishService.deleteDishForRestaurantOwner(
    			restaurantId,
    			dishId,
    			owner.getId());
    	
    	return ResponseEntity.ok("Dish deleted successfully");
    }
}