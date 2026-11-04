package com.takeit.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.takeit.entity.CartItem;
import com.takeit.entity.Dish;
import com.takeit.entity.User;
import com.takeit.repository.CartItemRepository;
import com.takeit.repository.DishRepository;
import com.takeit.repository.UserRepository;

@Service
public class CartService {
	
	private final CartItemRepository cartItemRepository;
	private final DishRepository dishRepository;
	private final UserRepository userRepository;
	private static final int MAX_CART_QUANTITY = 15;
	
	public CartService(CartItemRepository cartItemRepository,
			DishRepository dishRepository,
			UserRepository userRepository) {
		this.cartItemRepository = cartItemRepository;
		this.dishRepository = dishRepository;
		this.userRepository = userRepository;
	}
	
	@Transactional(readOnly = true)
	public List<CartItem> getCartItems(Long userId){
		return cartItemRepository.findByUserId(userId);
	}
	
	public CartItem addCart(Long userId, Long dishId, int quantity) {
		
		if(quantity <= 0) {
			throw new IllegalArgumentException(
					"Quantity must be greater then zero.");
		}
		if (quantity > MAX_CART_QUANTITY) {
		    throw new IllegalArgumentException(
		        "Maximum quantity allowed per request is 15."
		    );
		}
		
		User user = userRepository.findById(userId)
				.orElseThrow(()->
				new IllegalArgumentException("User not found."));
		
		Dish dish = dishRepository.findById(dishId)
				.orElseThrow(()->
				new IllegalArgumentException(
						"Dish not found."));
		
		if(!dish.isAvailable()) {
			throw new IllegalArgumentException(
					"This dish is currently unavailable");
		}
		
		var existingItem = cartItemRepository
				.findByUserIdAndDishId(userId, dishId);
		
		CartItem cartItem;
		
		if (existingItem.isPresent()) {
		    cartItem = existingItem.get();

		    if (cartItem.getQuantity() + quantity > MAX_CART_QUANTITY) {
		        throw new IllegalArgumentException(
		            "Maximum quantity allowed per dish is 15."
		        );
		    }

		    cartItem.setQuantity(cartItem.getQuantity() + quantity);
		} else {
		    cartItem = new CartItem();
		    cartItem.setUser(user);
		    cartItem.setDish(dish);
		    cartItem.setQuantity(quantity);
		}
		
		return cartItemRepository.save(cartItem);
	}
	
	@Transactional
	public CartItem updateQuantity(Long userId, Long cartItemId, int quantity) {

	    if (quantity <= 0) {
	        throw new IllegalArgumentException(
	            "Quantity must be greater than zero."
	        );
	    }
	    
	    if (quantity > MAX_CART_QUANTITY) {
	        throw new IllegalArgumentException(
	            "Maximum quantity allowed per request is 15."
	        );
	    }

	    CartItem cartItem = cartItemRepository
	        .findByIdAndUserId(cartItemId, userId)
	        .orElseThrow(() -> new IllegalArgumentException(
	            "Cart item not found for this user."
	        ));

	    if (!cartItem.getDish().isAvailable()) {
	        throw new IllegalArgumentException(
	            "This dish is currently unavailable."
	        );
	    }

	    cartItem.setQuantity(quantity);

	    return cartItemRepository.save(cartItem);
	}
	
	public void removeFromCart(Long userId, Long cartItemId) {
		
		CartItem cartItem = cartItemRepository.findById(cartItemId)
				.filter(item -> item.getUser().getId().equals(userId))
				.orElseThrow(() ->
				new IllegalArgumentException(
						"Cart item not found."));
		
		cartItemRepository.delete(cartItem);
	}
	
	@Transactional
	public void clearCart(Long userId) {
		cartItemRepository.deleteByUserId(userId);
	}
	
	public BigDecimal getUnitPrice(Dish dish) {
		BigDecimal discountedPrice = dish.getDiscountedPrice();
		
		if(discountedPrice != null
				&& discountedPrice.compareTo(BigDecimal.ZERO) > 0
				&& discountedPrice.compareTo(dish.getPrice()) < 0) {
			return discountedPrice;
		}
		return dish.getPrice();
	}
	
	public BigDecimal getItemTotal(CartItem item) {
		return getUnitPrice(item.getDish())
				.multiply(BigDecimal.valueOf(item.getQuantity()));
	}
	
	 @Transactional(readOnly = true)
	    public BigDecimal getCartTotal(Long userId) {
	        return getCartItems(userId).stream()
	                .map(this::getItemTotal)
	                .reduce(BigDecimal.ZERO, BigDecimal::add);
	    }
	
}
