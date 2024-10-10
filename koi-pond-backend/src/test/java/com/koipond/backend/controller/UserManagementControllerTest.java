package com.koipond.backend.controller;

import com.koipond.backend.dto.UserDTO;
import com.koipond.backend.service.UserService;
import com.koipond.backend.exception.UserNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class UserManagementControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserManagementController userManagementController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAllUsers_ReturnsListOfUsers() {
        List<UserDTO> expectedUsers = Arrays.asList(
            createUserDTO("1", "user1", "user1@example.com"),
            createUserDTO("2", "user2", "user2@example.com")
        );
        when(userService.getAllUsers()).thenReturn(expectedUsers);

        ResponseEntity<List<UserDTO>> response = userManagementController.getAllUsers();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedUsers, response.getBody());
    }

    @Test
    void getUserById_ExistingUser_ReturnsUser() {
        String userId = "1";
        UserDTO expectedUser = createUserDTO("1", "user1", "user1@example.com");
        when(userService.getUserById(userId)).thenReturn(expectedUser);

        ResponseEntity<UserDTO> response = userManagementController.getUserById(userId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedUser, response.getBody());
    }

    @Test
    void getUserById_NonExistingUser_ReturnsNotFound() {
        String userId = "999";
        when(userService.getUserById(userId)).thenThrow(new UserNotFoundException("User not found"));

        ResponseEntity<UserDTO> response = userManagementController.getUserById(userId);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void createUser_ValidUser_ReturnsCreatedUser() {
        UserDTO newUser = createUserDTO(null, "newuser", "newuser@example.com");
        UserDTO createdUser = createUserDTO("3", "newuser", "newuser@example.com");
        when(userService.createUser(newUser)).thenReturn(createdUser);

        ResponseEntity<UserDTO> response = userManagementController.createUser(newUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(createdUser, response.getBody());
    }

    @Test
    void updateUser_ExistingUser_ReturnsUpdatedUser() {
        String userId = "1";
        UserDTO updatedUser = createUserDTO("1", "updateduser", "updated@example.com");
        when(userService.updateUser(eq(userId), any(UserDTO.class))).thenReturn(updatedUser);

        ResponseEntity<UserDTO> response = userManagementController.updateUser(userId, updatedUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(updatedUser, response.getBody());
    }

    @Test
    void updateUser_NonExistingUser_ReturnsNotFound() {
        String userId = "999";
        UserDTO updatedUser = createUserDTO("999", "updateduser", "updated@example.com");
        when(userService.updateUser(eq(userId), any(UserDTO.class))).thenThrow(new UserNotFoundException("User not found"));

        ResponseEntity<UserDTO> response = userManagementController.updateUser(userId, updatedUser);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void blockUser_ExistingUser_ReturnsBlockedUser() {
        String userId = "1";
        UserDTO blockedUser = createUserDTO("1", "blockeduser", "blocked@example.com");
        when(userService.blockUser(userId)).thenReturn(blockedUser);

        ResponseEntity<UserDTO> response = userManagementController.blockUser(userId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(blockedUser, response.getBody());
    }

    @Test
    void blockUser_NonExistingUser_ReturnsNotFound() {
        String userId = "999";
        when(userService.blockUser(userId)).thenThrow(new UserNotFoundException("User not found"));

        ResponseEntity<UserDTO> response = userManagementController.blockUser(userId);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void unblockUser_ExistingUser_ReturnsUnblockedUser() {
        String userId = "1";
        UserDTO unblockedUser = createUserDTO("1", "unblockeduser", "unblocked@example.com");
        when(userService.unblockUser(userId)).thenReturn(unblockedUser);

        ResponseEntity<UserDTO> response = userManagementController.unblockUser(userId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(unblockedUser, response.getBody());
    }

    @Test
    void unblockUser_NonExistingUser_ReturnsNotFound() {
        String userId = "999";
        when(userService.unblockUser(userId)).thenThrow(new UserNotFoundException("User not found"));

        ResponseEntity<UserDTO> response = userManagementController.unblockUser(userId);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    private UserDTO createUserDTO(String id, String username, String email) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(id);
        userDTO.setUsername(username);
        userDTO.setEmail(email);
        return userDTO;
    }
}