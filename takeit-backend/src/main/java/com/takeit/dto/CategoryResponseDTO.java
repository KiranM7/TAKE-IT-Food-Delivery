package com.takeit.dto;

public class CategoryResponseDTO {

    private Long id;
    private String name;
    private String description;
    private boolean active;
    private Long restaurantId;
    private String restaurantName;

    public CategoryResponseDTO() {
    }

    public CategoryResponseDTO(
            Long id,
            String name,
            String description,
            boolean active,
            Long restaurantId,
            String restaurantName) {

        this.id = id;
        this.name = name;
        this.description = description;
        this.active = active;
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

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
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