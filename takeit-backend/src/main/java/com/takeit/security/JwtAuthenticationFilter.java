package com.takeit.security;

import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.takeit.service.JwtService;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter{
	
	private static final Logger logger =
	        LoggerFactory.getLogger(JwtAuthenticationFilter.class);

	private final JwtService jwtService;
	
	public JwtAuthenticationFilter(JwtService jwtService) {
		this.jwtService = jwtService;
	}
	
	@Override
	protected void doFilterInternal(
			HttpServletRequest request,
			HttpServletResponse response,
			FilterChain filterChain)
			throws ServletException, IOException{
		
		String authHeader = request.getHeader("Authorization");
		
		logger.info("Request URI: {}", request.getRequestURI());
		logger.info("Authorization header present: {}", authHeader != null);
		logger.info("Bearer token present: {}",
		        authHeader != null && authHeader.startsWith("Bearer "));

		if (authHeader == null || !authHeader.startsWith("Bearer ")) {
		    var authentication =
		            SecurityContextHolder.getContext().getAuthentication();

		    logger.info("No Bearer token. Current authentication: {}",
		            authentication);

		    filterChain.doFilter(request, response);
		    return;
		}

		String token = authHeader.substring(7);

		try {
		    String email = jwtService.extractEmail(token);
		    String role = jwtService.extractRole(token);
		    logger.info("JWT validated successfully for email: {}", email);
		    logger.info("Role extracted from JWT: {}", role);

			
			if(email != null
					&& role != null
					&& SecurityContextHolder.getContext()
					.getAuthentication() == null) {
				  UsernamePasswordAuthenticationToken authentication =
	                        new UsernamePasswordAuthenticationToken(
	                                email,
	                                null,
	                                java.util.List.of(
	                                        new SimpleGrantedAuthority("ROLE_" + role)
	                                )
	                        );
				     SecurityContextHolder.getContext()
                     .setAuthentication(authentication);
				     logger.info(
				    		    "Authentication set: {}, authorities: {}",
				    		    authentication.isAuthenticated(),
				    		    authentication.getAuthorities()
				    		);
			}
			
		} catch (JwtException | IllegalArgumentException ex) {
		    logger.warn("JWT validation failed: {}", ex.getMessage());

		    SecurityContextHolder.clearContext();

		    response.sendError(
		        HttpServletResponse.SC_UNAUTHORIZED,
		        "Invalid or expired JWT token"
		    );
		    return;
		}
		var authentication =
		        SecurityContextHolder.getContext().getAuthentication();

		logger.info("Before continuing filter chain - Authentication: {}",
		        authentication);

		logger.info("Before continuing filter chain - Authorities: {}",
		        authentication != null ? authentication.getAuthorities() : "none");

		filterChain.doFilter(request, response);
	}
}
		
	

