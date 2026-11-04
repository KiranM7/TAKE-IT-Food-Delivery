package com.takeit.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.takeit.dto.RestaurantResponse;
import com.takeit.entity.Restaurant;
import com.takeit.service.RestaurantService;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    private final RestaurantService restaurantService;

    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
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

    // Get all active restaurants
    @GetMapping
    public ResponseEntity<List<RestaurantResponse>> getAllRestaurants() {

        List<RestaurantResponse> restaurants =
                restaurantService.getActiveRestaurants()
                        .stream()
                        .map(this::convertToResponse)
                        .toList();

        return ResponseEntity.ok(restaurants);
    }


    @GetMapping("/{id}")
    public ResponseEntity<RestaurantResponse> getRestaurantById(
            @PathVariable Long id) {

        return restaurantService.getRestaurantById(id)
                .filter(Restaurant::isActive)
                .map(this::convertToResponse)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }


    @GetMapping("/search")
    public ResponseEntity<List<RestaurantResponse>> searchRestaurants(
            @RequestParam String name) {

        List<RestaurantResponse> restaurants =
                restaurantService.searchRestaurants(name)
                        .stream()
                        .filter(Restaurant::isActive)
                        .map(this::convertToResponse)
                        .toList();

        return ResponseEntity.ok(restaurants);
    }


    @GetMapping("/cuisine")
    public ResponseEntity<List<RestaurantResponse>> getRestaurantsByCuisine(
            @RequestParam String type) {

        List<RestaurantResponse> restaurants =
                restaurantService.getRestaurantsByCuisine(type)
                        .stream()
                        .filter(Restaurant::isActive)
                        .map(this::convertToResponse)
                        .toList();

        return ResponseEntity.ok(restaurants);
    }


    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RestaurantResponse> createRestaurant(
            @Valid @RequestBody Restaurant restaurant) {

        Restaurant savedRestaurant =
                restaurantService.saveRestaurant(restaurant);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(convertToResponse(savedRestaurant));
    }
}