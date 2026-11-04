package com.takeit.dto;

import java.math.BigDecimal;

public class DishResponseDTO {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal discountedPrice;
    private String imageUrl;
    private boolean vegetarian;
    private boolean available;
    private Long categoryId;
    private String categoryName;
    private Long restaurantId;
    private String restaurantName;

    public DishResponseDTO() {
    }

    public DishResponseDTO(
            Long id,
            String name,
            String description,
            BigDecimal price,
            BigDecimal discountedPrice,
            String imageUrl,
            boolean vegetarian,
            boolean available,
            Long categoryId,
            String categoryName,
            Long restaurantId,
            String restaurantName) {

        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.discountedPrice = discountedPrice;
        this.imageUrl = imageUrl;
        this.vegetarian = vegetarian;
        this.available = available;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.restaurantId = restaurantId;
        this.restaurantName = restaurantName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getDiscountedPrice() {
        return discountedPrice;
    }

    public void setDiscountedPrice(BigDecimal discountedPrice) {
        this.discountedPrice = discountedPrice;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public boolean isVegetarian() {
        return vegetarian;
    }

    public void setVegetarian(boolean vegetarian) {
        this.vegetarian = vegetarian;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Long getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(Long restaurantId) {
        this.restaurantId = restaurantId;
    }

    public String getRestaurantName() {
        return restaurantName;
    }

    public void setRestaurantName(String restaurantName) {
        this.restaurantName = restaurantName;
    }
}