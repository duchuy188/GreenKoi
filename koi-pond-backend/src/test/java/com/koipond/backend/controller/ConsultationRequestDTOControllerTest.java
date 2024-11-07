package com.koipond.backend.controller;

import com.koipond.backend.dto.ConsultationRequestDTO;
import com.koipond.backend.service.ConsultationRequestService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class ConsultationRequestDTOControllerTest {

    @Mock
    private ConsultationRequestService consultationRequestService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ConsultationRequestController consultationRequestController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createRequest_ValidRequest_ReturnsCreatedRequest() {
        ConsultationRequestDTO inputRequest = new ConsultationRequestDTO();
        com.koipond.backend.model.ConsultationRequest createdRequest = new com.koipond.backend.model.ConsultationRequest();
        createdRequest.setId("1");
        when(authentication.getName()).thenReturn("user1");
        when(consultationRequestService.createRequest(inputRequest, "user1")).thenReturn(createdRequest);

        ResponseEntity<?> response = consultationRequestController.createRequest(inputRequest, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(createdRequest, response.getBody());
    }

    @Test
    void createRequest_InvalidRequest_ReturnsBadRequest() {
        ConsultationRequestDTO inputRequest = new ConsultationRequestDTO();
        when(authentication.getName()).thenReturn("user1");
        when(consultationRequestService.createRequest(inputRequest, "user1")).thenThrow(new RuntimeException("Invalid request"));

        ResponseEntity<?> response = consultationRequestController.createRequest(inputRequest, authentication);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid request", response.getBody());
    }

    @Test
    void getConsultationRequests_ReturnsListOfRequests() {
        List<ConsultationRequestDTO> expectedRequests = Arrays.asList(
            new ConsultationRequestDTO(),
            new ConsultationRequestDTO()
        );
        when(authentication.getName()).thenReturn("user1");
        when(consultationRequestService.getConsultationRequests("user1")).thenReturn(expectedRequests);

        ResponseEntity<List<ConsultationRequestDTO>> response = consultationRequestController.getConsultationRequests(authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedRequests, response.getBody());
    }

    @Test
    void updateStatus_ValidUpdate_ReturnsUpdatedRequest() {
        String requestId = "1";
        String newStatus = "APPROVED";
        ConsultationRequestDTO updatedRequest = new ConsultationRequestDTO();
        updatedRequest.setId(requestId);
        updatedRequest.setStatus(newStatus);
        when(authentication.getName()).thenReturn("user1");
        when(consultationRequestService.updateStatus(requestId, newStatus, "user1")).thenReturn(updatedRequest);

        ResponseEntity<ConsultationRequestDTO> response = consultationRequestController.updateStatus(requestId, newStatus, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(updatedRequest, response.getBody());
    }

    @Test
    void getValidStatuses_ReturnsListOfStatuses() {
        List<String> expectedStatuses = Arrays.asList("PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED");
        when(consultationRequestService.getValidStatuses()).thenReturn(expectedStatuses);

        ResponseEntity<List<String>> response = consultationRequestController.getValidStatuses();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedStatuses, response.getBody());
    }
}
