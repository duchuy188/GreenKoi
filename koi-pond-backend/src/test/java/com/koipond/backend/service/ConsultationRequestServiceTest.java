package com.koipond.backend.service;

import com.koipond.backend.dto.ConsultationRequest;
import com.koipond.backend.model.Design;
import com.koipond.backend.model.User;
import com.koipond.backend.repository.ConsultationRequestRepository;
import com.koipond.backend.repository.DesignRepository;
import com.koipond.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ConsultationRequestServiceTest {

    @Mock
    private ConsultationRequestRepository consultationRequestRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DesignRepository designRepository;

    @InjectMocks
    private ConsultationRequestService consultationRequestService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createRequest_SuccessfulCreation() {
        // Arrange
        ConsultationRequest dto = new ConsultationRequest();
        dto.setDesignId("designId");
        dto.setNotes("Test notes");
        String username = "testUser";

        User user = new User();
        user.setUsername(username);

        Design design = new Design();
        design.setId("designId");

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(designRepository.findById("designId")).thenReturn(Optional.of(design));
        when(consultationRequestRepository.save(any(com.koipond.backend.model.ConsultationRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        com.koipond.backend.model.ConsultationRequest result = consultationRequestService.createRequest(dto, username);

        // Assert
        assertNotNull(result);
        assertEquals(user, result.getCustomer());
        assertEquals(design, result.getDesign());
        assertEquals("Test notes", result.getNotes());
        assertEquals(ConsultationRequestService.ConsultationStatus.PENDING.name(), result.getStatus());
        verify(consultationRequestRepository).save(any(com.koipond.backend.model.ConsultationRequest.class));
    }

    @Test
    void createRequest_UserNotFound() {
        ConsultationRequest dto = new ConsultationRequest();
        String username = "nonexistentUser";
        
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());
        
        assertThrows(RuntimeException.class, () -> consultationRequestService.createRequest(dto, username));
    }

    @Test
    void createRequest_DesignNotFound() {
        ConsultationRequest dto = new ConsultationRequest();
        dto.setDesignId("nonexistentDesignId");
        String username = "testUser";
        
        User user = new User();
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(designRepository.findById(dto.getDesignId())).thenReturn(Optional.empty());
        
        assertThrows(RuntimeException.class, () -> consultationRequestService.createRequest(dto, username));
    }

    @Test
    void getConsultationRequests_ForCustomer() {
        // Arrange
        String username = "customer";
        User user = new User();
        user.setUsername(username);
        user.setRoleId("1"); // Assuming 1 is for customer

        com.koipond.backend.model.ConsultationRequest request1 = new com.koipond.backend.model.ConsultationRequest();
        request1.setCustomer(user);
        com.koipond.backend.model.ConsultationRequest request2 = new com.koipond.backend.model.ConsultationRequest();
        request2.setCustomer(user);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(consultationRequestRepository.findByCustomer(user)).thenReturn(Arrays.asList(request1, request2));

        // Act
        List<ConsultationRequest> result = consultationRequestService.getConsultationRequests(username);

        // Assert
        assertEquals(2, result.size());
        verify(consultationRequestRepository).findByCustomer(user);
    }

    @Test
    void getConsultationRequests_ForConsultingStaff() {
        // Arrange
        String username = "staff";
        User user = new User();
        user.setUsername(username);
        user.setRoleId("2"); // Assuming 2 is for consulting staff

        com.koipond.backend.model.ConsultationRequest request1 = new com.koipond.backend.model.ConsultationRequest();
        com.koipond.backend.model.ConsultationRequest request2 = new com.koipond.backend.model.ConsultationRequest();

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(consultationRequestRepository.findAll()).thenReturn(Arrays.asList(request1, request2));

        // Act
        List<ConsultationRequest> result = consultationRequestService.getConsultationRequests(username);

        // Assert
        assertEquals(2, result.size());
        verify(consultationRequestRepository).findAll();
    }

    @Test
    void updateStatus_SuccessfulUpdate() {
        // Arrange
        String requestId = "requestId";
        String newStatus = "IN_PROGRESS";
        String username = "staff";

        User user = new User();
        user.setUsername(username);
        user.setRoleId("2"); // Consulting staff

        com.koipond.backend.model.ConsultationRequest request = new com.koipond.backend.model.ConsultationRequest();
        request.setId(requestId);
        request.setStatus(ConsultationRequestService.ConsultationStatus.PENDING.name());

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(consultationRequestRepository.findById(requestId)).thenReturn(Optional.of(request));
        when(consultationRequestRepository.save(any(com.koipond.backend.model.ConsultationRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        ConsultationRequest result = consultationRequestService.updateStatus(requestId, newStatus, username);

        // Assert
        assertNotNull(result);
        assertEquals(newStatus, result.getStatus());
        verify(consultationRequestRepository).save(any(com.koipond.backend.model.ConsultationRequest.class));
    }

    @Test
    void updateStatus_InvalidStatus() {
        // Arrange
        String requestId = "requestId";
        String newStatus = "INVALID_STATUS";
        String username = "staff";

        User user = new User();
        user.setUsername(username);
        user.setRoleId("2"); // Consulting staff

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(consultationRequestRepository.findById(requestId)).thenReturn(Optional.of(new com.koipond.backend.model.ConsultationRequest()));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> consultationRequestService.updateStatus(requestId, newStatus, username));
    }

    @Test
    void updateStatus_NotConsultingStaff() {
        String requestId = "requestId";
        String newStatus = "IN_PROGRESS";
        String username = "customer";

        User user = new User();
        user.setUsername(username);
        user.setRoleId("1"); // Assuming 1 is for customer

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));

        assertThrows(RuntimeException.class, 
            () -> consultationRequestService.updateStatus(requestId, newStatus, username));
    }

    @Test
    void updateStatus_RequestNotFound() {
        String requestId = "nonexistentRequestId";
        String newStatus = "IN_PROGRESS";
        String username = "staff";

        User user = new User();
        user.setUsername(username);
        user.setRoleId("2"); // Consulting staff

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(consultationRequestRepository.findById(requestId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, 
            () -> consultationRequestService.updateStatus(requestId, newStatus, username));
    }

    @Test
    void getValidStatuses_ReturnsAllStatuses() {
        // Act
        List<String> validStatuses = consultationRequestService.getValidStatuses();

        // Assert
        assertEquals(4, validStatuses.size());
        assertTrue(validStatuses.contains("PENDING"));
        assertTrue(validStatuses.contains("IN_PROGRESS"));
        assertTrue(validStatuses.contains("COMPLETED"));
        assertTrue(validStatuses.contains("CANCELLED"));
    }
}
