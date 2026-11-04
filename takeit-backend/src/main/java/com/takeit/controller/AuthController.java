package com.takeit.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.takeit.dto.LoginRequest;
import com.takeit.dto.RegisterRequest;
import com.takeit.entity.User;
import com.takeit.service.AuthService;
import com.takeit.service.UserService;
import com.takeit.dto.LoginResponse;
import com.takeit.service.JwtService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("api/auth")
public class AuthController {
	
	private final UserService userService;
	private final AuthService authService;
	private final JwtService jwtService;
	
	public AuthController(UserService userService,
						AuthService authService,
						JwtService jwtService) {
		this.userService = userService;
		this.authService = authService;
		this.jwtService = jwtService;
	}
	@PostMapping("/register")
	public ResponseEntity<String> register(
			@Valid @RequestBody RegisterRequest request){
		User user = new User(); 
		user.setFullName(request.getFullName());
		user.setEmail(request.getEmail());
		user.setPassword(request.getPassword());
		user.setPhone(request.getPhone());
		user.setAddress(request.getAddress());
		user.setDateOfBirth(request.getDateOfBirth());
		
		userService.registerUser(user);
		
		return ResponseEntity
				.status(HttpStatus.CREATED)
				.body("User registered successfully!");
	}
	@PostMapping("/login")
	public ResponseEntity<LoginResponse> login(
	        @Valid @RequestBody LoginRequest request) {

	    User user =authService.authenticate(
	            request.getEmail(),
	            request.getPassword()
	    );
	    
	    String token = jwtService.generateToken(
	    		user.getEmail(),
	    		user.getRole()
	    );
	    LoginResponse response = new LoginResponse(
	    		"Login successful!",
	    		token,
	    		user.getEmail(),
	    		user.getRole()
	    );

	    return ResponseEntity.ok(response);
	}
}