package com.takeit.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.takeit.entity.Category;
import com.takeit.entity.Restaurant;
import com.takeit.repository.CategoryRepository;
import com.takeit.repository.RestaurantRepository;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final RestaurantRepository restaurantRepository;

    public CategoryService(
            CategoryRepository categoryRepository,
            RestaurantRepository restaurantRepository) {
        this.categoryRepository = categoryRepository;
        this.restaurantRepository = restaurantRepository;
    }

    // Get all categories for a restaurant
    public List<Category> getCategoriesByRestaurant(Long restaurantId) {
        return categoryRepository.findByRestaurantId(restaurantId);
    }

    // Get active categories for a restaurant
    public List<Category> getActiveCategoryByRestsurant(Long restaurantId) {
        return categoryRepository
                .findByRestaurantIdAndActiveTrue(restaurantId);
    }

    // Find category by ID
    public java.util.Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    // Save a category
    public Category saveCategory(Category category) {
        return categoryRepository.save(category);
    }

    // Check for duplicate category names
    public boolean categoryExists(String name, Long restaurantId) {
        return categoryRepository
                .existsByNameIgnoreCaseAndRestaurantId(name, restaurantId);
    }

    // Verify that the restaurant belongs to the owner
    private Restaurant verifyRestaurantOwnership(
            Long restaurantId, Long ownerId) {

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() ->
                        new RuntimeException("Restaurant not found"));

        if (restaurant.getOwner() == null
                || !restaurant.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException(
                    "You are not authorized to manage this restaurant");
        }

        return restaurant;
    }

    // Get categories for a restaurant owner
    public List<Category> getCategoriesForOwner(
            Long restaurantId, Long ownerId) {

        verifyRestaurantOwnership(restaurantId, ownerId);

        return getCategoriesByRestaurant(restaurantId);
    }

    // Create a category for a restaurant owner
    @Transactional
    public Category createCategoryForOwner(
            Long restaurantId, Long ownerId, String name) {

        Restaurant restaurant =
                verifyRestaurantOwnership(restaurantId, ownerId);

        if (name == null || name.isBlank()) {
            throw new RuntimeException("Category name is required");
        }

        String categoryName = name.trim();

        if (categoryExists(categoryName, restaurantId)) {
            throw new RuntimeException(
                    "Category already exists in this restaurant");
        }

        Category category = new Category();
        category.setName(categoryName);
        category.setRestaurant(restaurant);
        category.setActive(true);

        return categoryRepository.save(category);
    }

    // Update a category
    @Transactional
    public Category updateCategoryForOwner(
            Long restaurantId,
            Long categoryId,
            Long ownerId,
            String name) {

        verifyRestaurantOwnership(restaurantId, ownerId);

        if (name == null || name.isBlank()) {
            throw new RuntimeException("Category name is required");
        }

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new RuntimeException("Category not found"));

        if (category.getRestaurant() == null
                || !category.getRestaurant().getId().equals(restaurantId)) {
            throw new RuntimeException(
                    "Category does not belong to this restaurant");
        }

        String categoryName = name.trim();

        if (!category.getName().equalsIgnoreCase(categoryName)
                && categoryExists(categoryName, restaurantId)) {
            throw new RuntimeException(
                    "Category already exists in this restaurant");
        }

        category.setName(categoryName);

        return categoryRepository.save(category);
    }

    // Deactivate a category instead of permanently deleting it
    @Transactional
    public Category deactivateCategoryForOwner(
            Long restaurantId, Long categoryId, Long ownerId) {

        verifyRestaurantOwnership(restaurantId, ownerId);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new RuntimeException("Category not found"));

        if (category.getRestaurant() == null
                || !category.getRestaurant().getId().equals(restaurantId)) {
            throw new RuntimeException(
                    "Category does not belong to this restaurant");
        }

        category.setActive(false);

        return categoryRepository.save(category);
    }
}