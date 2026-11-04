package com.takeit.controller;

import java.util.List;

import com.takeit.entity.Category;
import com.takeit.service.CategoryService;
import com.takeit.service.RestaurantService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import java.math.BigDecimal;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.takeit.entity.Dish;
import com.takeit.service.DishService;

@RestController
@RequestMapping("/api/dishes")
public class DishController {
	
	private final DishService dishService;
	private final RestaurantService restaurantService;
	private final CategoryService categoryService;
	
	public DishController(
	        DishService dishService,
	        RestaurantService restaurantService,
	        CategoryService categoryService) {
	    this.dishService = dishService;
	    this.restaurantService = restaurantService;
	    this.categoryService = categoryService;
	}
	
	@GetMapping("/restaurant/{restaurantId}")
	public ResponseEntity<List<Dish>> getDishesByRestaurant(
			@PathVariable Long restaurantId){
		
		List<Dish> dishes = dishService.getAvailableDishesByRestaurant(restaurantId);
		
		return ResponseEntity.ok(dishes);
	}
	
	@GetMapping("/category/{categoryId}")
	public ResponseEntity<List<Dish>> getDishesByCategory(
			@PathVariable Long categoryId){
		
		List<Dish> dishes = 
				dishService.getAvailableDishesByCategory(categoryId);
		
		return ResponseEntity.ok(dishes);
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<Dish> getDishById(@PathVariable Long id){
		
		return dishService.getDishById(id)
				.filter(Dish::isAvailable)
				.map(ResponseEntity::ok)
				.orElseGet(()-> ResponseEntity.notFound().build());
	}
	
	@GetMapping("/search")
	public ResponseEntity<List<Dish>> searchDishes(@RequestParam String name){
		List<Dish> dishes = dishService.searchDishes(name)
				.stream()
				.filter(Dish::isAvailable)
				.toList();
		return ResponseEntity.ok(dishes);
	}
	
	@PostMapping
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> createDish(@Valid @RequestBody Dish dish,
			@RequestParam Long restaurantId,
			@RequestParam Long categoryId){
		
		var restaurantOptional =
				restaurantService.getRestaurantById(restaurantId);
		
		if(restaurantOptional.isEmpty() || !restaurantOptional.get().isActive()) {
			return ResponseEntity.notFound().build();
		}
		
		var categoryOptional = categoryService.getCategoryById(categoryId);
		
		if(categoryOptional.isEmpty() || !categoryOptional.get().isActive()) {
			return ResponseEntity.badRequest()
					.body("Category not found or inactive.");
		}
		
		Category category = categoryOptional.get();
		
		if(!category.getRestaurant().getId().equals(restaurantId)) {
			return ResponseEntity.badRequest()
					.body("The category does not belong to this restaurant.");
		}
		
		if(dish.getName() == null || dish.getName().isBlank()) {
			return ResponseEntity.badRequest()
					.body("Dish name is required");
		}
		
		if(dish.getPrice() == null || dish.getPrice().compareTo(BigDecimal.ZERO)<= 0) {
			return ResponseEntity.badRequest()
					.body("Dish price must be greater then zero.");
		}
		
		if(dish.getDiscountedPrice() != null
				&& (dish.getDiscountedPrice().compareTo(BigDecimal.ZERO)<= 0
				|| dish.getDiscountedPrice().compareTo(dish.getPrice())>= 0)) {
			return ResponseEntity.badRequest()
					.body("Discounted price must be positive and lower than the original price.");
		}
		
		dish.setId(null);
		dish.setRestaurant(restaurantOptional.get());
		dish.setCategory(category);
		
		Dish savedDish = dishService.saveDish(dish);
		
		return ResponseEntity.status(HttpStatus.CREATED).body(savedDish);
			
	}
}
