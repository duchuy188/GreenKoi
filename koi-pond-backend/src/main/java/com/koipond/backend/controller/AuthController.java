package com.koipond.backend.controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.koipond.backend.dto.AuthResponse;
import com.koipond.backend.dto.LoginRequest;
import com.koipond.backend.dto.RegisterRequest;
import com.koipond.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "API for authentication operations")
public class AuthController {

    @Autowired
    private FirebaseAuth firebaseAuth;

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Create a new user account and return JWT token")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            UserRecord.CreateRequest createRequest = new UserRecord.CreateRequest()
                    .setEmail(request.getEmail())
                    .setPassword(request.getPassword())
                    .setDisplayName(request.getName());

            UserRecord userRecord = firebaseAuth.createUser(createRequest);
            String token = userService.generateToken(userRecord);

            return ResponseEntity.ok(new AuthResponse(token, userRecord.getUid()));
        } catch (FirebaseAuthException e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticate user and return JWT token")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            String token = userService.authenticateUser(request.getEmail(), request.getPassword());
            UserRecord userRecord = firebaseAuth.getUserByEmail(request.getEmail());
            return ResponseEntity.ok(new AuthResponse(token, userRecord.getUid()));
        } catch (FirebaseAuthException e) {
            return ResponseEntity.badRequest().body("Login failed: " + e.getMessage());
        }
    }
}