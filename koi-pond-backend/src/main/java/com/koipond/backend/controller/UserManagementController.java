package com.koipond.backend.controller;

import com.koipond.backend.dto.UserDTO;
import com.koipond.backend.service.UserService;
import com.koipond.backend.exception.UserNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager/users")
@PreAuthorize("hasAuthority('ROLE_1')")
@Tag(name = "User Management", description = "APIs for managing users")
public class UserManagementController {

    private static final Logger logger = LoggerFactory.getLogger(UserManagementController.class);

    @Autowired
    private UserService userService;

    @GetMapping
    @Operation(summary = "Get all users", description = "Retrieves a list of all users. Can be filtered by role.")
    public ResponseEntity<List<UserDTO>> getAllUsers(@RequestParam(required = false) String role) {
        logger.info("Fetching users with role filter: {}", role);
        List<UserDTO> users;
        if (role != null) {
            users = userService.getUsersByRole(role);
            logger.info("Retrieved {} users with role {}", users.size(), role);
        } else {
            users = userService.getAllUsers();
            logger.info("Retrieved {} users", users.size());
        }
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieves a user by their ID")
    public ResponseEntity<UserDTO> getUserById(@PathVariable String id) {
        logger.info("Fetching user with id: {}", id);
        try {
            UserDTO user = userService.getUserById(id);
            logger.info("Retrieved user: {}", user.getUsername());
            return ResponseEntity.ok(user);
        } catch (UserNotFoundException e) {
            logger.warn("User not found with id: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @Operation(summary = "Create new user", description = "Creates a new user")
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO userDTO) {
        logger.info("Creating new user: {}", userDTO.getUsername());
        UserDTO createdUser = userService.createUser(userDTO);
        logger.info("User created successfully: {}", createdUser.getUsername());
        return ResponseEntity.ok(createdUser);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user", description = "Updates an existing user")
    public ResponseEntity<UserDTO> updateUser(@PathVariable String id, @RequestBody UserDTO userDTO) {
        logger.info("Updating user with id: {}", id);
        try {
            UserDTO updatedUser = userService.updateUser(id, userDTO);
            logger.info("User updated successfully: {}", updatedUser.getUsername());
            return ResponseEntity.ok(updatedUser);
        } catch (UserNotFoundException e) {
            logger.warn("User not found with id: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/block")
    @Operation(summary = "Block user", description = "Blocks a user by their ID")
    public ResponseEntity<UserDTO> blockUser(@PathVariable String id) {
        logger.info("Blocking user with id: {}", id);
        try {
            UserDTO blockedUser = userService.blockUser(id);
            logger.info("User blocked successfully: {}", blockedUser.getUsername());
            return ResponseEntity.ok(blockedUser);
        } catch (UserNotFoundException e) {
            logger.warn("User not found with id: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/unblock")
    @Operation(summary = "Unblock user", description = "Unblocks a user by their ID")
    public ResponseEntity<UserDTO> unblockUser(@PathVariable String id) {
        logger.info("Unblocking user with id: {}", id);
        try {
            UserDTO unblockedUser = userService.unblockUser(id);
            logger.info("User unblocked successfully: {}", unblockedUser.getUsername());
            return ResponseEntity.ok(unblockedUser);
        } catch (UserNotFoundException e) {
            logger.warn("User not found with id: {}", id);
            return ResponseEntity.notFound().build();
        }
    }
}
