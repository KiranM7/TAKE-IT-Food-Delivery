package com.takeit.dto;

import java.math.BigDecimal;

public class CartItemResponse {

	private Long id;
	private int quantity;
	
	private Long dishId;
	private String dishName;
	private BigDecimal price;
	private BigDecimal discountedPrice;
	private BigDecimal itemTotal;
	private boolean available;
	private String imageUrl;
	
	private String restaurantName;
	
	public CartItemResponse() {
		
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public int getQuantity() {
		return quantity;
	}

	public void setQuantity(int quantity) {
		this.quantity = quantity;
	}

	public Long getDishId() {
		return dishId;
	}
	
	public BigDecimal getItemTotal() {
	    return itemTotal;
	}

	public void setDishId(Long dishId) {
		this.dishId = dishId;
	}

	public String getDishName() {
		return dishName;
	}

	public void setDishName(String dishName) {
		this.dishName = dishName;
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

	public boolean isAvailable() {
		return available;
	}

	public void setAvailable(boolean available) {
		this.available = available;
	}

	public String getRestaurantName() {
		return restaurantName;
	}

	public void setRestaurantName(String restaurantName) {
		this.restaurantName = restaurantName;
	}
	
	public void setItemTotal(BigDecimal itemTotal) {
	    this.itemTotal = itemTotal;
	}
	
	public String getImageUrl() {
	    return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
	    this.imageUrl = imageUrl;
	}
	
	
	
}
