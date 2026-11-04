
package com.takeit.controller;

import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class UserController {

	@GetMapping("/me")
	public Map<String, String> getCurrentUser(
	        Authentication authentication) {

	    return Map.of(
	        "email", authentication.getName(),
	        "role", authentication.getAuthorities()
	                .iterator()
	                .next()
	                .getAuthority()
	    );
	}
}
