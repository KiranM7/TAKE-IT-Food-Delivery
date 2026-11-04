
package com.takeit.repository;

import com.takeit.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByUserId(Long userId);

    Optional<CartItem> findByUserIdAndDishId(Long userId, Long dishId);

    Optional<CartItem> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndDishId(Long userId, Long dishId);

    void deleteByUserId(Long userId);
}
