package com.koipond.backend.controller;

import com.koipond.backend.dto.DesignDTO;
import com.koipond.backend.service.DesignService;
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

class PondDesignControllerTest {

    @Mock
    private DesignService designService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private PondDesignController pondDesignController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createDesign_ValidDesign_ReturnsCreatedDesign() {
        DesignDTO inputDesign = new DesignDTO();
        DesignDTO createdDesign = new DesignDTO();
        createdDesign.setId("1");
        when(authentication.getName()).thenReturn("designer1");
        when(designService.createDesign(inputDesign, "designer1")).thenReturn(createdDesign);

        ResponseEntity<DesignDTO> response = pondDesignController.createDesign(inputDesign, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(createdDesign, response.getBody());
    }

    @Test
    void getDesign_ExistingDesign_ReturnsDesign() {
        String designId = "1";
        DesignDTO expectedDesign = new DesignDTO();
        expectedDesign.setId(designId);
        when(designService.getDesign(designId)).thenReturn(expectedDesign);

        ResponseEntity<DesignDTO> response = pondDesignController.getDesign(designId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedDesign, response.getBody());
    }

    @Test
    void getDesignerDesigns_ReturnsListOfDesigns() {
        List<DesignDTO> expectedDesigns = Arrays.asList(new DesignDTO(), new DesignDTO());
        when(authentication.getName()).thenReturn("designer1");
        when(designService.getDesignsByDesigner("designer1")).thenReturn(expectedDesigns);

        ResponseEntity<List<DesignDTO>> response = pondDesignController.getDesignerDesigns(authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedDesigns, response.getBody());
    }

    @Test
    void getPendingApprovalDesigns_ReturnsListOfPendingDesigns() {
        List<DesignDTO> expectedDesigns = Arrays.asList(new DesignDTO(), new DesignDTO());
        when(designService.getPendingApprovalDesigns()).thenReturn(expectedDesigns);

        ResponseEntity<List<DesignDTO>> response = pondDesignController.getPendingApprovalDesigns();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedDesigns, response.getBody());
    }

    @Test
    void getApprovedDesigns_ReturnsListOfApprovedDesigns() {
        List<DesignDTO> expectedDesigns = Arrays.asList(new DesignDTO(), new DesignDTO());
        when(designService.getApprovedDesigns()).thenReturn(expectedDesigns);

        ResponseEntity<List<DesignDTO>> response = pondDesignController.getApprovedDesigns();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedDesigns, response.getBody());
    }

    @Test
    void updateDesign_ExistingDesign_ReturnsUpdatedDesign() {
        String designId = "1";
        DesignDTO inputDesign = new DesignDTO();
        DesignDTO updatedDesign = new DesignDTO();
        updatedDesign.setId(designId);
        when(designService.updateDesign(designId, inputDesign)).thenReturn(updatedDesign);

        ResponseEntity<DesignDTO> response = pondDesignController.updateDesign(designId, inputDesign);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(updatedDesign, response.getBody());
    }

    @Test
    void approveDesign_ExistingDesign_ReturnsApprovedDesign() {
        String designId = "1";
        DesignDTO approvedDesign = new DesignDTO();
        approvedDesign.setId(designId);
        when(designService.approveDesign(designId)).thenReturn(approvedDesign);

        ResponseEntity<DesignDTO> response = pondDesignController.approveDesign(designId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(approvedDesign, response.getBody());
    }

    @Test
    void rejectDesign_ExistingDesign_ReturnsRejectedDesign() {
        String designId = "1";
        DesignDTO rejectedDesign = new DesignDTO();
        rejectedDesign.setId(designId);
        when(designService.rejectDesign(designId)).thenReturn(rejectedDesign);

        ResponseEntity<DesignDTO> response = pondDesignController.rejectDesign(designId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(rejectedDesign, response.getBody());
    }

    @Test
    void deleteDesign_ExistingDesign_ReturnsNoContent() {
        String designId = "1";
        doNothing().when(designService).deleteDesign(designId);

        ResponseEntity<Void> response = pondDesignController.deleteDesign(designId);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(designService, times(1)).deleteDesign(designId);
    }
}
