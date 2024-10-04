package com.koipond.backend.controller;

import jakarta.validation.Valid;
import com.koipond.backend.dto.AuthResponse;
import com.koipond.backend.dto.LoginRequest;
import com.koipond.backend.dto.RegisterRequest;
import com.koipond.backend.exception.AuthenticationException;
import com.koipond.backend.service.UserService;
import com.koipond.backend.security.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "API for authentication operations")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    public AuthController(UserService userService, JwtTokenProvider jwtTokenProvider) {
        this.userService = userService;
        this.jwtTokenProvider = jwtTokenProvider;
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
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse authResponse = userService.authenticateUser(loginRequest.getUsername(), loginRequest.getPassword());
            return ResponseEntity.ok(authResponse);
        } catch (AuthenticationException e) {
            log.warn("Authentication failed: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            if (e.getMessage().contains("User account is blocked")) {
                errorResponse.put("message", "Account is blocked. Please contact the administrator.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            } else {
                errorResponse.put("message", "Authentication failed: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }
        }
    }


    @PostMapping("/logout")
    @Operation(summary = "Logout user", description = "Invalidate the user's JWT token")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String token) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                String jwtToken = token.substring(7);
                jwtTokenProvider.invalidateToken(jwtToken);
                return ResponseEntity.ok().body("Logged out successfully");
            } else {
                return ResponseEntity.badRequest().body("Invalid token format");
            }
        } catch (Exception e) {
            log.error("Error during logout", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred during logout");
        }
    }
}

    // Các phương thức khác đã được comment out
