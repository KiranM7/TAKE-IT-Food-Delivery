package com.takeit.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import com.takeit.exception.DuplicateEmailException;

@RestControllerAdvice
public class GlobalExceptionHandler {
	
	@ExceptionHandler(DuplicateEmailException.class)
	public ResponseEntity<Map<String, String>> handleDuplicateEmail(
	        DuplicateEmailException ex) {

	    return ResponseEntity
	            .status(HttpStatus.CONFLICT)
	            .body(Map.of("message", ex.getMessage()));
	}
	
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, String>> handleValidationErrors(
			MethodArgumentNotValidException ex){
		
		String message = ex.getBindingResult()
				.getFieldErrors()
				.stream()
				.findFirst()
				.map(error -> error.getDefaultMessage())
				.orElse("Invalid request data");
		
		return ResponseEntity
				.badRequest()
				.body(Map.of("message", message));
	}

}
