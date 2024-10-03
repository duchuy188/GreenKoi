package com.koipond.backend.service;

import com.koipond.backend.dto.AuthResponse;
import com.koipond.backend.dto.UpdateProfileRequest;
import com.koipond.backend.dto.RegisterRequest;
import com.koipond.backend.exception.AuthenticationException;
import com.koipond.backend.model.User;
import com.koipond.backend.repository.UserRepository;
import com.koipond.backend.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public AuthResponse authenticateUser(String username, String password) {
        log.info("Attempting to authenticate user: {}", username);
        try {
            User user = findByUsername(username);

            if (passwordEncoder.matches(password, user.getPassword())) {
                log.info("Password authentication successful for user: {}", username);
                String token = jwtTokenProvider.createToken(user.getUsername());
                log.info("JWT token generated for user: {}", username);
                return new AuthResponse(token, user.getId());
            } else {
                log.warn("Login failed: Incorrect password for user: {}", username);
                throw new AuthenticationException("Incorrect password");
            }
        } catch (AuthenticationException e) {
            log.error("Login failed for user: {}. Reason: {}", username, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during login for user: {}. Error: {}", username, e.getMessage());
            throw new RuntimeException("An unexpected error occurred during login", e);
        }
    }

    public User findByUsername(String username) {
        log.info("Finding user by username: {}", username);
        return userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("User not found with username: {}", username);
                    return new AuthenticationException("User not found");
                });
    }

    public User getUserProfile(String username) {
        log.info("Fetching user profile for username: {}", username);
        return findByUsername(username);
    }

    public User updateUserProfile(String username, UpdateProfileRequest updateRequest) {
        User user = findByUsername(username);
        user.setFullName(updateRequest.getFullName());
        user.setPhone(updateRequest.getPhone());
        user.setAddress(updateRequest.getAddress());
        user.setEmail(updateRequest.getEmail()); // Thêm dòng này
        
        log.debug("Updating user - fullName: {}, phone: {}, address: {}, email: {}", 
                  updateRequest.getFullName(), updateRequest.getPhone(), 
                  updateRequest.getAddress(), updateRequest.getEmail());
        
        return userRepository.save(user);
    }

    public AuthResponse registerUser(RegisterRequest request) {
        log.info("Attempting to register new user with username: {}", request.getUsername());

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            log.warn("Registration failed: Email already exists: {}", request.getEmail());
            throw new AuthenticationException("Email already exists");
        }

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            log.warn("Registration failed: Username already exists: {}", request.getUsername());
            throw new AuthenticationException("Username already exists");
        }

        User newUser = new User();
        newUser.setId(UUID.randomUUID().toString());
        newUser.setEmail(request.getEmail());
        newUser.setUsername(request.getUsername());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setFullName(request.getFullName());
        newUser.setPhone(request.getPhoneNumber());
        newUser.setAddress(request.getAddress());
        newUser.setRoleId("5"); // Giả sử 5 là role cho khách hàng

        log.info("Registering new user: {}", newUser);
        try {
            User savedUser = userRepository.save(newUser);
            String token = jwtTokenProvider.createToken(savedUser.getUsername());
            log.info("User registered successfully: {}", savedUser.getUsername());
            return new AuthResponse(token, savedUser.getId());
        } catch (Exception e) {
            log.error("Error registering new user: {}", e.getMessage());
            throw new RuntimeException("Failed to register user", e);
        }
    }
}
