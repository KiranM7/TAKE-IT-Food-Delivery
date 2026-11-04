package com.takeit.entity;

import java.math.BigDecimal;

import jakarta.persistence.*;


@Entity
@Table(name = "order_items")
public class OrderItem {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne(fetch =FetchType.LAZY)
	@JoinColumn(name = "order_id", nullable = false)
	private Order order;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "dish_id", nullable = false)
	private Dish dish;
	
	@Column(nullable = false)
	private int quantity;
	
	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal unitPrice;
	
	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal subtotal;
	
	public OrderItem() {
		
	}
	 public Long getId() {
	        return id;
	    }

	    public Order getOrder() {
	        return order;
	    }

	    public void setOrder(Order order) {
	        this.order = order;
	    }

	    public Dish getDish() {
	        return dish;
	    }

	    public void setDish(Dish dish) {
	        this.dish = dish;
	    }

	    public int getQuantity() {
	        return quantity;
	    }

	    public void setQuantity(int quantity) {
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

}
