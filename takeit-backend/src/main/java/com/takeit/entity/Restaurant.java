package com.takeit.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "restaurants")
public class Restaurant {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "owner_id")
	private User owner;
	
	@Column(nullable = false, length = 150)
	private String name;
	
	@Column(length = 1000)
	private String description;
	
	@Column(nullable = false, length =255)
	private String address;
	
	@Column(length = 100)
	private String cuisineType;
	
	@Column(length = 500)
	private String imageUrl;
	
	@Column(nullable = false)
	private boolean active = true;
	
	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;
	
	@PrePersist
	private void onCreate() {
		createdAt = LocalDateTime.now();
	}

	public Restaurant() {
		
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

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
	
	public User getOwner() {
	    return owner;
	}

	public void setOwner(User owner) {
	    this.owner = owner;
	}
	
	
	
}
