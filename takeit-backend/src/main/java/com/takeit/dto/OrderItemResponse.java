package com.takeit.dto;

import java.math.BigDecimal;

public class OrderItemResponse {

	private Long dishId;
	private String dishName;
	private Integer quantity;
	private BigDecimal unitPrice;
	private BigDecimal subtotal;
	private String restaurantName;
	
	public OrderItemResponse() {
		
	}
	
	 public Long getDishId() {
	        return dishId;
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

	    public Integer getQuantity() {
	        return quantity;
	    }

	    public void setQuantity(Integer quantity) {
	        this.quantity = quantity;
	    }

	    public BigDecimal getUnitPrice() {
	        return unitPrice;
	    }

	    public void setUnitPrice(BigDecimal unitPrice) {
	        this.unitPrice = unitPrice;
	    }

	    public BigDecimal getSubtotal() {
	        return subtotal;
	    }

	    public void setSubtotal(BigDecimal subtotal) {
	        this.subtotal = subtotal;
	    }

	    public String getRestaurantName() {
	        return restaurantName;
	    }

	    public void setRestaurantName(String restaurantName) {
	        this.restaurantName = restaurantName;
	    }
}
