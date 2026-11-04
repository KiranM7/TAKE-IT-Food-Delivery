package com.takeit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TakeitBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(TakeitBackendApplication.class, args);
		System.out.println("Working...");
	}

}
