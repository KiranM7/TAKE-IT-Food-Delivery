package com.takeit.controller;

import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
	
	@GetMapping("/dashboard")
	@PreAuthorize("hasRole('ADMIN')")
	public Map<String, String> getAdminDashboard(){
		
		return Map.of(
				"message", "Welcome to the TAKE IT Admin Dashboard!",
				"access", "ADMIN"
				);
	}

}
