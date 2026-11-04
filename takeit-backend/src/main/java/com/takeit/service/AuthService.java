package com.takeit.service;

import com.takeit.entity.User;
import com.takeit.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
	
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	
	public AuthService(
			UserRepository userRepository,
			PasswordEncoder passwordEncoder){
				this.userRepository = userRepository;
				this.passwordEncoder = passwordEncoder;
			}
			
	public User authenticate(String email, String password) {

	    User user = userRepository.findByEmail(email)
	            .orElseThrow(() ->
	                    new BadCredentialsException("Invalid email or password"));

	    if (!passwordEncoder.matches(password, user.getPassword())) {
	        throw new BadCredentialsException("Invalid email or password");
	    }
			
			
			
	return user;
		}
}

