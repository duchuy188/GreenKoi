package com.koipond.backend.controller;

import com.koipond.backend.dto.UpdateProfileRequest;
import com.koipond.backend.dto.UserProfileResponse;
import com.koipond.backend.model.User;
import com.koipond.backend.service.UserService;
import com.koipond.backend.exception.UserNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class ProfileControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ProfileController profileController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getProfile_AuthenticatedUser_ReturnsProfile() {
        when(authentication.getName()).thenReturn("testUser");
        User user = createTestUser();
        when(userService.findByUsername("testUser")).thenReturn(user);

        ResponseEntity<UserProfileResponse> response = profileController.getProfile(authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("testUser", response.getBody().getUsername());
    }

    @Test
    void getProfile_UserNotFound_ReturnsNotFound() {
        when(authentication.getName()).thenReturn("nonExistentUser");
        when(userService.findByUsername("nonExistentUser")).thenThrow(new UserNotFoundException("User not found"));

        ResponseEntity<UserProfileResponse> response = profileController.getProfile(authentication);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void getProfile_NullAuthentication_ReturnsUnauthorized() {
        ResponseEntity<UserProfileResponse> response = profileController.getProfile(null);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void updateProfile_ValidRequest_ReturnsUpdatedProfile() {
        when(authentication.getName()).thenReturn("testUser");
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("Updated Name");
        User updatedUser = createTestUser();
        updatedUser.setFullName("Updated Name");
        when(userService.updateUserProfile("testUser", request)).thenReturn(updatedUser);

        ResponseEntity<UserProfileResponse> response = profileController.updateProfile(authentication, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Updated Name", response.getBody().getFullName());
    }

    @Test
    void updateProfile_NullAuthentication_ReturnsUnauthorized() {
        UpdateProfileRequest request = new UpdateProfileRequest();

        ResponseEntity<UserProfileResponse> response = profileController.updateProfile(null, request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void updateProfile_ServiceException_ReturnsInternalServerError() {
        when(authentication.getName()).thenReturn("testUser");
        UpdateProfileRequest request = new UpdateProfileRequest();
        when(userService.updateUserProfile("testUser", request)).thenThrow(new RuntimeException("Service error"));

        ResponseEntity<UserProfileResponse> response = profileController.updateProfile(authentication, request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    private User createTestUser() {
        User user = new User();
        user.setId("1");
        user.setUsername("testUser");
        user.setFullName("Test User");
        user.setEmail("test@example.com");
        user.setPhone("1234567890");
        user.setRoleId("ROLE_USER");
        user.setActive(true);
        user.setAddress("Test Address");
        return user;
    }
}
