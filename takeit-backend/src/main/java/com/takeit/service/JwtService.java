package com.takeit.service;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
	
	@Value("${jwt.secret}")
	private String secret;
	
	@Value("${jwt.expiration}")
	private long expiration;
	
	private SecretKey getSigningKey() {
		byte[] keyBytes = Decoders.BASE64.decode(secret);
		return Keys.hmacShaKeyFor(keyBytes);
	}
	
	public String generateToken(String email, String role) {
	    Date now = new Date();
	    Date expiryDate = new Date(now.getTime() + expiration);

	    return Jwts.builder()
	            .subject(email)
	            .claim("role", role)
	            .issuedAt(now)
	            .expiration(expiryDate)
	            .signWith(getSigningKey())
	            .compact();
	}
	
	public String extractEmail(String token) {
		return extractAllClaims(token).getSubject();
	}
	
	public String extractRole(String token) {
		return extractAllClaims(token).get("role", String.class);
	}
	
	private Claims extractAllClaims(String token) {
		return Jwts.parser()
				.verifyWith(getSigningKey())
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}

}
