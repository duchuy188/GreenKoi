package com.koipond.backend.service;

import com.koipond.backend.dto.AuthResponse;
import com.koipond.backend.dto.UpdateProfileRequest;
import com.koipond.backend.dto.RegisterRequest;
import com.koipond.backend.dto.UserDTO;
import com.koipond.backend.exception.AuthenticationException;
import com.koipond.backend.exception.UserNotFoundException;
import com.koipond.backend.model.User;
import com.koipond.backend.repository.UserRepository;
import com.koipond.backend.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public enum UserRole {
        MANAGER("1"),
        CONSULTING_STAFF("2"),
        DESIGN_STAFF("3"),
        CONSTRUCTION_STAFF("4"),
        CUSTOMER("5");

        private final String id;

        UserRole(String id) {
            this.id = id;
        }

        public String getId() {
            return id;
        }

        public static UserRole fromId(String id) {
            for (UserRole role : values()) {
                if (role.getId().equals(id)) {
                    return role;
                }
            }
            throw new IllegalArgumentException("Invalid UserRole id: " + id);
        }
    }

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        log.info("UserService initialized");
    }

    public AuthResponse authenticateUser(String username, String password) {
        log.info("Attempting to authenticate user: {}", username);
        try {
            User user = findByUsername(username);

            if (!user.isActive()) {
                log.warn("Login failed: User account is blocked: {}", username);
                throw new AuthenticationException("User account is blocked");
            }

            if (passwordEncoder.matches(password, user.getPassword())) {
                log.info("Password authentication successful for user: {}", username);
                String token = jwtTokenProvider.createToken(user.getUsername(), user.getRoleId());
                log.info("JWT token generated for user: {}", username);
                return new AuthResponse(token, user.getId(), user.getUsername(), user.getRoleId());
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
                    return new UserNotFoundException("User not found with username: " + username);
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
        user.setEmail(updateRequest.getEmail());

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
        newUser.setRoleId(UserRole.CUSTOMER.getId());
        newUser.setActive(true);

        log.info("Registering new user: {}", newUser);
        try {
            User savedUser = userRepository.save(newUser);
            String token = jwtTokenProvider.createToken(savedUser.getUsername(), savedUser.getRoleId());
            log.info("User registered successfully: {}", savedUser.getUsername());
            return new AuthResponse(token, savedUser.getId(), savedUser.getUsername(), savedUser.getRoleId());
        } catch (Exception e) {
            log.error("Error registering new user: {}", e.getMessage());
            throw new RuntimeException("Failed to register user", e);
        }
    }

    public List<UserDTO> getAllUsers() {
        log.info("Fetching all users");
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(String id) {
        log.info("Fetching user by id: {}", id);
        return convertToDTO(findUserById(id));
    }

    public UserDTO blockUser(String id) {
        log.info("Blocking user with id: {}", id);
        return updateUserActiveStatus(id, false);
    }

    public UserDTO unblockUser(String id) {
        log.info("Unblocking user with id: {}", id);
        return updateUserActiveStatus(id, true);
    }

    public UserDTO createUser(UserDTO userDTO) {
        log.info("Creating new user: {}", userDTO.getUsername());

        if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
            log.warn("User creation failed: Email already exists: {}", userDTO.getEmail());
            throw new AuthenticationException("Email already exists");
        }

        if (userRepository.findByUsername(userDTO.getUsername()).isPresent()) {
            log.warn("User creation failed: Username already exists: {}", userDTO.getUsername());
            throw new AuthenticationException("Username already exists");
        }

        User newUser = new User();
        newUser.setId(UUID.randomUUID().toString());
        newUser.setEmail(userDTO.getEmail());
        newUser.setUsername(userDTO.getUsername());
        newUser.setPassword(passwordEncoder.encode(userDTO.getPassword())); // Assume password is provided in DTO
        newUser.setFullName(userDTO.getFullName());
        newUser.setPhone(userDTO.getPhone());
        newUser.setAddress(userDTO.getAddress());
        newUser.setRoleId(userDTO.getRoleId());
        newUser.setActive(true);

        User savedUser = userRepository.save(newUser);
        log.info("User created successfully: {}", savedUser.getUsername());
        return convertToDTO(savedUser);
    }

    public UserDTO updateUser(String id, UserDTO userDTO) {
        log.info("Updating user with id: {}", id);
        User user = findUserById(id);

        user.setEmail(userDTO.getEmail());
        user.setFullName(userDTO.getFullName());
        user.setPhone(userDTO.getPhone());
        user.setAddress(userDTO.getAddress());
        user.setRoleId(userDTO.getRoleId());
        // Don't update password here, create a separate endpoint for password changes

        User updatedUser = userRepository.save(user);
        log.info("User updated successfully: {}", updatedUser.getUsername());
        return convertToDTO(updatedUser);
    }

    private User findUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("User not found with id: {}", id);
                    return new UserNotFoundException("User not found with id: " + id);
                });
    }

    private UserDTO updateUserActiveStatus(String id, boolean active) {
        User user = findUserById(id);
        user.setActive(active);
        User updatedUser = userRepository.save(user);
        log.info("User {} status updated to {}: {}", active ? "unblocked" : "blocked", active, updatedUser.getUsername());
        return convertToDTO(updatedUser);
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setFullName(user.getFullName());
        dto.setRoleId(user.getRoleId());
        dto.setActive(user.isActive());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setAddress(user.getAddress());
        return dto;
    }
}