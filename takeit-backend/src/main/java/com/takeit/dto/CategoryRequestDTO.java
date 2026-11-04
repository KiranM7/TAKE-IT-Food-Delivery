package com.takeit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CategoryRequestDTO {

	@NotBlank(message = "Category name is requried")
	@Size(max = 100, message = "Category name cannot exceed 100 characters")
	private String name;
	
	public CategoryRequestDTO() {
		
	}
	
	   public String getName() {
	        return name;
	    }

	    public void setName(String name) {
	        this.name = name;
	    }
}
