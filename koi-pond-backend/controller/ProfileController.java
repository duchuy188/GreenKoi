package com.koipond.backend.controller;

import jakarta.validation.Valid;
import com.koipond.backend.dto.UpdateProfileRequest;
import com.koipond.backend.dto.UserProfileResponse;
import com.koipond.backend.model.User;
import com.koipond.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/profile")
@Tag(name = "Profile", description = "API for user profile operations")
public class ProfileController {

    private final UserService userService;
    private static final Logger log = LoggerFactory.getLogger(ProfileController.class);

    @Autowired
    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "Get user profile", description = "Retrieve the profile of the authenticated user")
    public ResponseEntity<UserProfileResponse> getProfile(Authentication authentication) {
        if (authentication == null) {
            log.error("Authentication is null");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = authentication.getName();
        try {
            log.info("Attempting to get profile for user: {}", username);
            User user = userService.findByUsername(username);
            if (user == null) {
                log.error("User not found: {}", username);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            UserProfileResponse response = mapUserToResponse(user);
            log.info("Successfully retrieved profile for user: {}", username);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error retrieving profile for user: {}", username, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping
    @Operation(summary = "Update user profile", description = "Update the profile of the authenticated user")
    public ResponseEntity<UserProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        if (authentication == null) {
            log.error("Authentication is null");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = authentication.getName();
        try {
            log.info("Attempting to update profile for user: {}", username);
            User updatedUser = userService.updateUserProfile(username, request);
            UserProfileResponse response = mapUserToResponse(updatedUser);
            log.info("Successfully updated profile for user: {}", username);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating profile for user: {}", username, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private UserProfileResponse mapUserToResponse(User user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setUsername(user.getUsername()); // Sử dụng username thực sự
        response.setRoleId(user.getRoleId());
        response.setActive(user.isActive());
        response.setAddress(user.getAddress()); // Thêm address
        return response;
    }
}