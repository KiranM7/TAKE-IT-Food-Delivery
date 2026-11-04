package com.takeit.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.*;

//DTO(Data Transfer Object)
public class RegisterRequest {
	
	@NotBlank(message = "Full name is required")
	@Size(max = 100, message = "Full name must not exceed 100 characters")
	private String fullName;
	
	@NotBlank(message = "Email is required")
	@Email(message = "Enter a valid email address")
	@Size(max = 100, message = "Email must not exceed 150 characters")
	private String email;
	
	@NotBlank(message = "Password is required")
	@Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
	private String password;
	
	@Pattern(
			regexp = "^$|^[0-9]{10}$",
			message = "Phone must contain exactly 10 digits")
	private String phone;
	
	@Size(max = 255, message = "Address must not exceed 255 characters")
	private String address;
	
	@NotNull(message = "Date of birth is required")
	@Past(message = "Date of birth must be in the past")
	private LocalDate dateOfBirth;
	
	public RegisterRequest() {
		
	}

	
	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public LocalDate getDateOfBirth() {
		return dateOfBirth;
	}

	public void setDateOfBirth(LocalDate dateOfBirth) {
		this.dateOfBirth = dateOfBirth;
	}

}
