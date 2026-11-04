
package com.takeit.dto;

public class RestaurantOwnerDashboardResponse {

	private long totalRestaurants;
	private long activeRestaurants;
	private long inactiveRestaurants;
	
	private long totalDishes;
	private long availableDishes;
	private long unavailableDishes;
	
	public RestaurantOwnerDashboardResponse() {
		
	}

	public RestaurantOwnerDashboardResponse(long totalRestaurants, long activeRestaurants, long inactiveRestaurants,
			long totalDishes, long availableDishes, long unavailableDishes) {
		this.totalRestaurants = totalRestaurants;
		this.activeRestaurants = activeRestaurants;
		this.inactiveRestaurants = inactiveRestaurants;
		this.totalDishes = totalDishes;
		this.availableDishes = availableDishes;
		this.unavailableDishes = unavailableDishes;
	}

	public long getTotalRestaurants() {
		return totalRestaurants;
	}

	public void setTotalRestaurants(long totalRestaurants) {
		this.totalRestaurants = totalRestaurants;
	}

	public long getActiveRestaurants() {
		return activeRestaurants;
	}

	public void setActiveRestaurants(long activeRestaurants) {
		this.activeRestaurants = activeRestaurants;
	}

	public long getInactiveRestaurants() {
		return inactiveRestaurants;
	}

	public void setInactiveRestaurants(long inactiveRestaurants) {
		this.inactiveRestaurants = inactiveRestaurants;
	}

	public long getTotalDishes() {
		return totalDishes;
	}

	public void setTotalDishes(long totalDishes) {
		this.totalDishes = totalDishes;
	}

	public long getAvailableDishes() {
		return availableDishes;
	}

	public void setAvailableDishes(long availableDishes) {
		this.availableDishes = availableDishes;
	}

	public long getUnavailableDishes() {
		return unavailableDishes;
	}

	public void setUnavailableDishes(long unavailableDishes) {
		this.unavailableDishes = unavailableDishes;
	}
	
	
	
}
