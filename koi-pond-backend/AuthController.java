package com.koipond.backend.controller;

import jakarta.validation.Valid;
import com.koipond.backend.dto.AuthResponse;
import com.koipond.backend.dto.LoginRequest;
import com.koipond.backend.dto.RegisterRequest;
import com.koipond.backend.exception.AuthenticationException;
import com.koipond.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "API for authentication operations")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final UserService userService;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register user", description = "Register a new user and return JWT token")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse authResponse = userService.registerUser(request);
            return ResponseEntity.ok(authResponse);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error while registering user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticate user and return JWT token")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse authResponse = userService.authenticateUser(loginRequest.getUsername(), loginRequest.getPassword());
            return ResponseEntity.ok(authResponse);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication failed: " + e.getMessage());
        }
    }

    // Các phương thức khác đã được comment out
}