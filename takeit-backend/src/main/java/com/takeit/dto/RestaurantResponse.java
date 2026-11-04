package com.takeit.dto;

public class RestaurantResponse {

    private Long id;
    private String name;
    private String description;
    private String address;
    private String cuisineType;
    private String imageUrl;
    private boolean active;

    public RestaurantResponse() {
    }

    public RestaurantResponse(
            Long id,
            String name,
            String description,
            String address,
            String cuisineType,
            String imageUrl,
            boolean active) {

        this.id = id;
        this.name = name;
        this.description = description;
        this.address = address;
        this.cuisineType = cuisineType;
        this.imageUrl = imageUrl;
        this.active = active;
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCuisineType() {
        return cuisineType;
    }

    public void setCuisineType(String cuisineType) {
        this.cuisineType = cuisineType;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}