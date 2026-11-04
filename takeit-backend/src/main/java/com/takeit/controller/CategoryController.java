package com.takeit.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.takeit.service.RestaurantService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;

import com.takeit.entity.Category;
import com.takeit.service.CategoryService;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

	private final CategoryService categoryService;
	private final RestaurantService restaurantService;
	
	public CategoryController(
			CategoryService categoryService,
			RestaurantService restaurantService) {
		this.categoryService = categoryService;
		this.restaurantService = restaurantService;
	}
	
	@GetMapping("/restaurant/{restaurantId}")
	public ResponseEntity<List<Category>> getCategoriesByRestaurant(@PathVariable Long restaurantId){
		List<Category> categories = categoryService.getActiveCategoryByRestsurant(restaurantId);
		return ResponseEntity.ok(categories);
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<Category> getCategoryById(@PathVariable Long id){
		return categoryService.getCategoryById(id)
				.filter(Category::isActive)
				.map(ResponseEntity::ok)
				.orElseGet(()-> ResponseEntity.notFound().build());
	}
	

    // Create a category (ADMIN only)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCategory(
            @Valid @RequestBody Category category,
            @RequestParam Long restaurantId) {

        var restaurantOptional =
                restaurantService.getRestaurantById(restaurantId);

        if (restaurantOptional.isEmpty()
                || !restaurantOptional.get().isActive()) {
            return ResponseEntity.notFound().build();
        }

        if (categoryService.categoryExists(
                category.getName(), restaurantId)) {
            return ResponseEntity.badRequest()
                    .body("This category already exists for this restaurant.");
        }

        category.setId(null);
        category.setRestaurant(restaurantOptional.get());

        Category savedCategory = categoryService.saveCategory(category);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedCategory);
    }

	
}
