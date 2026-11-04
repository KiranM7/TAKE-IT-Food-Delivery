package com.takeit.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.takeit.dto.DishRequestDTO;
import com.takeit.dto.DishResponseDTO;
import com.takeit.entity.Category;
import com.takeit.entity.Dish;
import com.takeit.entity.Restaurant;
import com.takeit.repository.CategoryRepository;
import com.takeit.repository.DishRepository;
import com.takeit.repository.RestaurantRepository;

@Service
public class DishService {

    private final DishRepository dishRepository;
    private final RestaurantRepository restaurantRepository;
    private final CategoryRepository categoryRepository;

    public DishService(
            DishRepository dishRepository,
            RestaurantRepository restaurantRepository,
            CategoryRepository categoryRepository) {
        this.dishRepository = dishRepository;
        this.restaurantRepository = restaurantRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<Dish> getAllDishes() {
        return dishRepository.findAll();
    }

    public List<Dish> getDishesByRestaurant(Long restaurantId) {
        return dishRepository.findByRestaurantId(restaurantId);
    }

    public List<Dish> getAvailableDishesByRestaurant(Long restaurantId) {
        return dishRepository.findByRestaurantIdAndAvailableTrue(restaurantId);
    }

    public List<Dish> getDishesByCategory(Long categoryId) {
        return dishRepository.findByCategoryId(categoryId);
    }

    public List<Dish> getAvailableDishesByCategory(Long categoryId) {
        return dishRepository.findByCategoryIdAndAvailableTrue(categoryId);
    }

    public Optional<Dish> getDishById(Long id) {
        return dishRepository.findById(id);
    }

    public List<Dish> searchDishes(String name) {
        return dishRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Dish> searchDishesByRestaurant(Long restaurantId, String name) {
        return dishRepository.findByRestaurantIdAndNameContainingIgnoreCase(
                restaurantId, name);
    }

    public boolean dishExists(String name, Long restaurantId) {
        return dishRepository.existsByNameIgnoreCaseAndRestaurantId(
                name, restaurantId);
    }

    public Dish saveDish(Dish dish) {
        return dishRepository.save(dish);
    }

    @Transactional(readOnly = true)
    public List<DishResponseDTO> getDishesByRestaurantOwner(
            Long restaurantId, Long ownerId) {

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() ->
                        new RuntimeException("Restaurant not found"));

        verifyRestaurantOwnership(restaurant, ownerId);

        return dishRepository.findByRestaurantId(restaurantId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public DishResponseDTO addDishForRestaurantOwner(
            Long restaurantId,
            Long ownerId,
            DishRequestDTO request) {

        // Validate the request.
        if (request == null) {
            throw new IllegalArgumentException("Dish request is required");
        }

        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Dish name is required");
        }

        if (request.getPrice() == null
                || request.getPrice().signum() <= 0) {
            throw new IllegalArgumentException("Price must be greater than zero");
        }

        if (request.getDiscountedPrice() != null
                && (request.getDiscountedPrice().signum() < 0
                || request.getDiscountedPrice().compareTo(request.getPrice()) > 0)) {
            throw new IllegalArgumentException(
                    "Discounted price must be zero or greater and cannot exceed the original price");
        }

        if (request.getCategoryId() == null) {
            throw new IllegalArgumentException("Category ID is required");
        }

        // Find the restaurant.
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Restaurant not found"));

        // Ensure this owner controls the restaurant.
        verifyRestaurantOwnership(restaurant, ownerId);

        // Prevent duplicate dish names within the same restaurant.
        if (dishRepository.existsByNameIgnoreCaseAndRestaurantId(
                request.getName().trim(), restaurantId)) {
            throw new IllegalArgumentException(
                    "A dish with this name already exists in this restaurant");
        }

        // Find the category.
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Category not found"));

        // Ensure the category belongs to the selected restaurant.
        if (category.getRestaurant() == null
                || !category.getRestaurant().getId().equals(restaurantId)) {
            throw new IllegalArgumentException(
                    "The selected category does not belong to this restaurant");
        }

        // Build and save the dish.
        Dish dish = new Dish();
        dish.setName(request.getName().trim());
        dish.setDescription(request.getDescription());
        dish.setPrice(request.getPrice());
        dish.setDiscountedPrice(request.getDiscountedPrice());
        dish.setImageUrl(request.getImageUrl());
        dish.setVegetarian(request.isVegetarian());
        dish.setAvailable(request.isAvailable());
        dish.setRestaurant(restaurant);
        dish.setCategory(category);

        Dish savedDish = dishRepository.save(dish);

        return convertToDTO(savedDish);
    }

    private void verifyRestaurantOwnership(
            Restaurant restaurant, Long ownerId) {

        if (restaurant.getOwner() == null
                || !restaurant.getOwner().getId().equals(ownerId)) {
            throw new AccessDeniedException(
                    "You are not allowed to manage dishes for this restaurant");
        }
    }
    
 
    @Transactional
    public DishResponseDTO updateDishForRestaurantOwner(
            Long restaurantId,
            Long dishId,
            Long ownerId,
            DishRequestDTO request) {

        if (request == null) {
            throw new IllegalArgumentException("Dish request is required");
        }

        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Dish name is required");
        }

        if (request.getPrice() == null
                || request.getPrice().signum() <= 0) {
            throw new IllegalArgumentException(
                    "Price must be greater than zero");
        }

        if (request.getDiscountedPrice() != null
                && (request.getDiscountedPrice().signum() < 0
                || request.getDiscountedPrice()
                        .compareTo(request.getPrice()) > 0)) {
            throw new IllegalArgumentException(
                    "Discounted price cannot be negative or exceed the original price");
        }

        if (request.getCategoryId() == null) {
            throw new IllegalArgumentException("Category ID is required");
        }

        // Verify that the restaurant exists.
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Restaurant not found"));

        // Verify restaurant ownership.
        verifyRestaurantOwnership(restaurant, ownerId);

        // Verify that the dish exists.
        Dish dish = dishRepository.findById(dishId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Dish not found"));

        // Ensure the dish belongs to the selected restaurant.
        if (dish.getRestaurant() == null
                || !dish.getRestaurant().getId().equals(restaurantId)) {
            throw new AccessDeniedException(
                    "This dish does not belong to your restaurant");
        }

        // Prevent duplicate dish names within the restaurant.
        if (!dish.getName().equalsIgnoreCase(request.getName().trim())
                && dishRepository.existsByNameIgnoreCaseAndRestaurantId(
                        request.getName().trim(), restaurantId)) {
            throw new IllegalArgumentException(
                    "A dish with this name already exists in this restaurant");
        }

        // Verify that the category belongs to this restaurant.
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Category not found"));

        if (category.getRestaurant() == null
                || !category.getRestaurant().getId().equals(restaurantId)) {
            throw new IllegalArgumentException(
                    "The selected category does not belong to this restaurant");
        }

        // Update the dish fields.
        dish.setName(request.getName().trim());
        dish.setDescription(request.getDescription());
        dish.setPrice(request.getPrice());
        dish.setDiscountedPrice(request.getDiscountedPrice());
        dish.setImageUrl(request.getImageUrl());
        dish.setVegetarian(request.isVegetarian());
        dish.setAvailable(request.isAvailable());
        dish.setCategory(category);

        Dish updatedDish = dishRepository.save(dish);

        return convertToDTO(updatedDish);
    }
    
    @Transactional
    public void deleteDishForRestaurantOwner(
            Long restaurantId,
            Long dishId,
            Long ownerId) {

        // Verify that the restaurant belongs to this owner
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        if (!restaurant.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException(
                    "You are not authorized to manage this restaurant");
        }

        // Find the dish
        Dish dish = dishRepository.findById(dishId)
                .orElseThrow(() -> new RuntimeException("Dish not found"));

        // Ensure that the dish belongs to the specified restaurant
        if (!dish.getRestaurant().getId().equals(restaurantId)) {
            throw new RuntimeException(
                    "This dish does not belong to your restaurant");
        }

        // Delete the dish
        dishRepository.delete(dish);
    }
   

    private DishResponseDTO convertToDTO(Dish dish) {

        Long categoryId = null;
        String categoryName = null;

        if (dish.getCategory() != null) {
            categoryId = dish.getCategory().getId();
            categoryName = dish.getCategory().getName();
        }

        Long restaurantId = null;
        String restaurantName = null;

        if (dish.getRestaurant() != null) {
            restaurantId = dish.getRestaurant().getId();
            restaurantName = dish.getRestaurant().getName();
        }

        return new DishResponseDTO(
                dish.getId(),
                dish.getName(),
                dish.getDescription(),
                dish.getPrice(),
                dish.getDiscountedPrice(),
                dish.getImageUrl(),
                dish.isVegetarian(),
                dish.isAvailable(),
                categoryId,
                categoryName,
                restaurantId,
                restaurantName
        );
    }
}