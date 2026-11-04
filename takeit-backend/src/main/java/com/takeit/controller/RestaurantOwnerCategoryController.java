package com.takeit.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.takeit.dto.CategoryRequestDTO;
import com.takeit.dto.CategoryResponseDTO;
import com.takeit.entity.Category;
import com.takeit.entity.User;
import com.takeit.repository.UserRepository;
import com.takeit.service.CategoryService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/owner/restaurants/{restaurantId}/categories")
@PreAuthorize("hasRole('RESTAURANT_OWNER')")
public class RestaurantOwnerCategoryController {

    private final CategoryService categoryService;
    private final UserRepository userRepository;

    public RestaurantOwnerCategoryController(
            CategoryService categoryService,
            UserRepository userRepository) {
        this.categoryService = categoryService;
        this.userRepository = userRepository;
    }

    // GET: View restaurant categories
    @GetMapping
    public ResponseEntity<List<CategoryResponseDTO>> getCategories(
            @PathVariable Long restaurantId,
            Authentication authentication) {

        User owner = getAuthenticatedOwner(authentication);

        List<CategoryResponseDTO> categories =
                categoryService.getCategoriesForOwner(
                        restaurantId, owner.getId())
                .stream()
                .map(this::convertToResponse)
                .toList();

        return ResponseEntity.ok(categories);
    }

    // POST: Create a category
    @PostMapping
    public ResponseEntity<CategoryResponseDTO> createCategory(
            @PathVariable Long restaurantId,
            @Valid @RequestBody CategoryRequestDTO request,
            Authentication authentication) {

        User owner = getAuthenticatedOwner(authentication);

        Category category = categoryService.createCategoryForOwner(
                restaurantId, owner.getId(), request.getName());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(convertToResponse(category));
    }

    // PUT: Update a category
    @PutMapping("/{categoryId}")
    public ResponseEntity<CategoryResponseDTO> updateCategory(
            @PathVariable Long restaurantId,
            @PathVariable Long categoryId,
            @Valid @RequestBody CategoryRequestDTO request,
            Authentication authentication) {

        User owner = getAuthenticatedOwner(authentication);

        Category category = categoryService.updateCategoryForOwner(
                restaurantId,
                categoryId,
                owner.getId(),
                request.getName());

        return ResponseEntity.ok(convertToResponse(category));
    }

    // DELETE: Deactivate a category
    @DeleteMapping("/{categoryId}")
    public ResponseEntity<String> deactivateCategory(
            @PathVariable Long restaurantId,
            @PathVariable Long categoryId,
            Authentication authentication) {

        User owner = getAuthenticatedOwner(authentication);

        categoryService.deactivateCategoryForOwner(
                restaurantId, categoryId, owner.getId());

        return ResponseEntity.ok("Category deactivated successfully");
    }

    // Get authenticated restaurant owner
    private User getAuthenticatedOwner(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("Restaurant owner not found"));
    }

    // Convert Category entity into a safe response DTO
    private CategoryResponseDTO convertToResponse(Category category) {

        Long restaurantId = category.getRestaurant() != null
                ? category.getRestaurant().getId()
                : null;

        String restaurantName = category.getRestaurant() != null
                ? category.getRestaurant().getName()
                : null;

        return new CategoryResponseDTO(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.isActive(),
                restaurantId,
                restaurantName
        );
    }
}