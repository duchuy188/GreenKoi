package com.koipond.backend.controller;

import com.koipond.backend.dto.AuthResponse;
import com.koipond.backend.dto.LoginRequest;
import com.koipond.backend.dto.RegisterRequest;
import com.koipond.backend.exception.AuthenticationException;
import com.koipond.backend.service.UserService;
import com.koipond.backend.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.Map;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class AuthControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    private AuthController authController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        authController = new AuthController(userService, jwtTokenProvider);
    }

    @Test
    void register_SuccessfulRegistration_ReturnsOkResponse() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setEmail("test@example.com");
        request.setPassword("password");

        AuthResponse expectedResponse = new AuthResponse("token", "userId", "testuser", "roleId");

        when(userService.registerUser(any(RegisterRequest.class))).thenReturn(expectedResponse);

        ResponseEntity<?> response = authController.register(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedResponse, response.getBody());
    }

    @Test
    void register_UserAlreadyExists_ReturnsConflictResponse() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("existinguser");
        request.setEmail("existing@example.com");
        request.setPassword("password");

        when(userService.registerUser(any(RegisterRequest.class))).thenThrow(new AuthenticationException("User already exists"));

        ResponseEntity<?> response = authController.register(request);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("User already exists", response.getBody());
    }

    @Test
    void register_InvalidInput_ReturnsBadRequestResponse() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("invaliduser");
        request.setEmail("invalid@example.com");
        request.setPassword("invalidpassword");

        when(userService.registerUser(any(RegisterRequest.class))).thenThrow(new IllegalArgumentException("Invalid input"));

        ResponseEntity<?> response = authController.register(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid input", response.getBody());
    }

    @Test
    void login_SuccessfulLogin_ReturnsOkResponse() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password");

        AuthResponse expectedResponse = new AuthResponse("token", "userId", "testuser", "roleId");

        when(userService.authenticateUser(anyString(), anyString())).thenReturn(expectedResponse);

        ResponseEntity<?> response = authController.login(loginRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedResponse, response.getBody());
    }

    @Test
    void login_InvalidCredentials_ReturnsUnauthorizedResponse() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("wrongpassword");

        when(userService.authenticateUser(anyString(), anyString()))
            .thenThrow(new AuthenticationException("Invalid credentials"));

        ResponseEntity<?> response = authController.login(loginRequest);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        Map<String, String> responseBody = (Map<String, String>) response.getBody();
        assertNotNull(responseBody);
        assertTrue(responseBody.get("message").contains("Authentication failed"));
    }

    @Test
    void login_BlockedAccount_ReturnsForbiddenResponse() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("blockeduser");
        loginRequest.setPassword("password");

        when(userService.authenticateUser(anyString(), anyString()))
            .thenThrow(new AuthenticationException("User account is blocked"));

        ResponseEntity<?> response = authController.login(loginRequest);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertTrue(((Map<String, String>) response.getBody()).get("message").contains("Account is blocked"));
    }

    @Test
    void logout_ValidToken_ReturnsOkResponse() {
        String token = "Bearer validToken";
        doNothing().when(jwtTokenProvider).invalidateToken(anyString());

        ResponseEntity<?> response = authController.logout(token);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Logged out successfully", response.getBody());
    }

    @Test
    void logout_InvalidTokenFormat_ReturnsBadRequestResponse() {
        String token = "InvalidTokenFormat";

        ResponseEntity<?> response = authController.logout(token);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid token format", response.getBody());
    }

    @Test
    void logout_ExceptionOccurs_ReturnsInternalServerErrorResponse() {
        String token = "Bearer validToken";
        doThrow(new RuntimeException("Unexpected error")).when(jwtTokenProvider).invalidateToken(anyString());

        ResponseEntity<?> response = authController.logout(token);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("An error occurred during logout", response.getBody());
    }
}