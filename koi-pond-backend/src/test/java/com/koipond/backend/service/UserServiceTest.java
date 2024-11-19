package com.koipond.backend.service;

import com.koipond.backend.dto.AuthResponse;
import com.koipond.backend.dto.RegisterRequest;
import com.koipond.backend.dto.UserDTO;
import com.koipond.backend.dto.UpdateProfileRequest;
import com.koipond.backend.exception.AuthenticationException;
import com.koipond.backend.exception.UserNotFoundException;
import com.koipond.backend.model.User;
import com.koipond.backend.repository.UserRepository;
import com.koipond.backend.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SuppressWarnings("resource")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void authenticateUser_SuccessfulLogin() {
        // Arrange
        String username = "testuser";
        String password = "password";
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setUsername(username);
        user.setPassword("encodedPassword");
        user.setActive(true);
        user.setRoleId("5");

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(password, user.getPassword())).thenReturn(true);
        when(jwtTokenProvider.createToken(username, user.getRoleId())).thenReturn("jwt-token");

        // Act
        AuthResponse response = userService.authenticateUser(username, password);

        // Assert
        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals(user.getId(), response.getUserId());
        assertEquals(username, response.getUsername());
        assertEquals("5", response.getRoleId());
    }

    @Test
    void authenticateUser_UserNotFound() {
        // Arrange
        String username = "nonexistentuser";
        String password = "password";
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UserNotFoundException.class, () -> userService.authenticateUser(username, password));
    }

    @Test
    void authenticateUser_IncorrectPassword() {
        // Arrange
        String username = "testuser";
        String password = "wrongpassword";
        User user = new User();
        user.setUsername(username);
        user.setPassword("encodedPassword");
        user.setActive(true);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(password, user.getPassword())).thenReturn(false);

        // Act & Assert
        assertThrows(AuthenticationException.class, () -> userService.authenticateUser(username, password));
    }

    @Test
    void authenticateUser_BlockedAccount() {
        // Arrange
        String username = "blockeduser";
        String password = "password";
        User user = new User();
        user.setUsername(username);
        user.setPassword("encodedPassword");
        user.setActive(false);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));

        // Act & Assert
        assertThrows(AuthenticationException.class, () -> userService.authenticateUser(username, password));
    }

    @Test
    void registerUser_SuccessfulRegistration() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("newuser@example.com");
        request.setPassword("password");
        request.setFullName("New User");
        request.setPhoneNumber("1234567890");
        request.setAddress("123 New St");

        User savedUser = new User();
        savedUser.setId(UUID.randomUUID().toString());
        savedUser.setUsername(request.getUsername());
        savedUser.setEmail(request.getEmail());
        savedUser.setFullName(request.getFullName());
        savedUser.setPhone(request.getPhoneNumber());
        savedUser.setAddress(request.getAddress());
        savedUser.setRoleId(UserService.UserRole.CUSTOMER.getId());
        savedUser.setActive(true);

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());
        when(userRepository.findByUsername(request.getUsername())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtTokenProvider.createToken(savedUser.getUsername(), savedUser.getRoleId())).thenReturn("jwt-token");

        // Act
        AuthResponse response = userService.registerUser(request);

        // Assert
        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals(savedUser.getId(), response.getUserId());
        assertEquals(request.getUsername(), response.getUsername());
        assertEquals(UserService.UserRole.CUSTOMER.getId(), response.getRoleId());

        verify(userRepository).save(any(User.class));
    }

    @Test
    void registerUser_EmailAlreadyExists() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("existing@example.com");
        request.setPassword("password");
        // Set other fields...

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(new User()));

        // Act & Assert
        assertThrows(AuthenticationException.class, () -> userService.registerUser(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void getUserById_ExistingUser() {
        // Arrange
        String userId = UUID.randomUUID().toString();
        User user = new User();
        user.setId(userId);
        user.setUsername("testuser");
        user.setEmail("test@example.com");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // Act
        UserDTO result = userService.getUserById(userId);

        // Assert
        assertNotNull(result);
        assertEquals(userId, result.getId());
        assertEquals("testuser", result.getUsername());
        assertEquals("test@example.com", result.getEmail());
    }

    @Test
    void getUserById_NonExistentUser() {
        // Arrange
        String userId = UUID.randomUUID().toString();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UserNotFoundException.class, () -> userService.getUserById(userId));
    }

    @Test
    void updateUserProfile_Success() {
        // Arrange
        String username = "testuser";
        User existingUser = new User();
        existingUser.setUsername(username);
        existingUser.setEmail("old@example.com");

        UpdateProfileRequest updateRequest = new UpdateProfileRequest();
        updateRequest.setEmail("new@example.com");
        updateRequest.setFullName("Updated Name");

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenReturn(existingUser);

        // Act
        User updatedUser = userService.updateUserProfile(username, updateRequest);

        // Assert
        assertNotNull(updatedUser);
        assertEquals("new@example.com", updatedUser.getEmail());
        assertEquals("Updated Name", updatedUser.getFullName());
        verify(userRepository).save(existingUser);
    }

    private User createMockUser(String id, String username, String email) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setEmail(email);
        return user;
    }
}