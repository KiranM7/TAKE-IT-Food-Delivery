package com.takeit.repository;

import org.springframework.stereotype.Repository;

import com.takeit.entity.User;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface UserRepository extends JpaRepository<User, Long>{

	 Optional<User> findByEmail(String email);

	    boolean existsByEmail(String email);
}
