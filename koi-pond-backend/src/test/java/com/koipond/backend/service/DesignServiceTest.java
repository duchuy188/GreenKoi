package com.koipond.backend.service;

import com.koipond.backend.dto.DesignDTO;
import com.koipond.backend.model.Design;
import com.koipond.backend.model.User;
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
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DesignServiceTest {

    @Mock
    private DesignRepository designRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DesignService designService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createDesign_SuccessfulCreation() {
        // Arrange
        DesignDTO designDTO = new DesignDTO();
        designDTO.setName("Test Design");
        String designerUsername = "testDesigner";

        User designer = new User();
        designer.setId("designerId");
        designer.setUsername(designerUsername);

        when(userRepository.findByUsername(designerUsername)).thenReturn(Optional.of(designer));
        when(designRepository.save(any(Design.class))).thenAnswer(invocation -> {
            Design savedDesign = invocation.getArgument(0);
            savedDesign.setId("newDesignId");
            return savedDesign;
        });

        // Act
        DesignDTO result = designService.createDesign(designDTO, designerUsername);

        // Assert
        assertNotNull(result);
        assertEquals("newDesignId", result.getId());
        assertEquals("Test Design", result.getName());
        assertEquals(Design.DesignStatus.PENDING_APPROVAL.name(), result.getStatus());
        verify(designRepository).save(any(Design.class));
    }

    @Test
    void getDesign_ExistingDesign_ReturnsDesignDTO() {
        // Arrange
        String designId = "existingDesignId";
        Design design = new Design();
        design.setId(designId);
        design.setName("Existing Design");
        design.setCreatedBy(new User());
        design.setStatus(Design.DesignStatus.APPROVED);

        when(designRepository.findByIdAndActiveTrue(designId)).thenReturn(Optional.of(design));

        // Act
        DesignDTO result = designService.getDesign(designId);

        // Assert
        assertNotNull(result);
        assertEquals(designId, result.getId());
        assertEquals("Existing Design", result.getName());
        assertEquals(Design.DesignStatus.APPROVED.name(), result.getStatus());
    }

    @Test
    void getDesignsByDesigner_ReturnsListOfDesignDTOs() {
        // Arrange
        String designerUsername = "testDesigner";
        User designer = new User();
        designer.setId("designerId");

        Design design1 = new Design();
        design1.setId("design1");
        design1.setName("Design 1");
        design1.setCreatedBy(designer);

        Design design2 = new Design();
        design2.setId("design2");
        design2.setName("Design 2");
        design2.setCreatedBy(designer);

        when(userRepository.findByUsername(designerUsername)).thenReturn(Optional.of(designer));
        when(designRepository.findByCreatedBy_IdAndActiveTrue(designer.getId())).thenReturn(Arrays.asList(design1, design2));

        // Act
        List<DesignDTO> results = designService.getDesignsByDesigner(designerUsername);

        // Assert
        assertEquals(2, results.size());
        assertEquals("Design 1", results.get(0).getName());
        assertEquals("Design 2", results.get(1).getName());
    }

    @Test
    void approveDesign_SuccessfulApproval() {
        // Arrange
        String designId = "designToApprove";
        Design design = new Design();
        design.setId(designId);
        design.setStatus(Design.DesignStatus.PENDING_APPROVAL);
        design.setCreatedBy(new User());

        when(designRepository.findByIdAndActiveTrue(designId)).thenReturn(Optional.of(design));
        when(designRepository.save(any(Design.class))).thenReturn(design);

        // Act
        DesignDTO result = designService.approveDesign(designId);

        // Assert
        assertEquals(Design.DesignStatus.APPROVED.name(), result.getStatus());
        verify(designRepository).save(design);
    }

    @Test
    void deleteDesign_SuccessfulDeletion() {
        // Arrange
        String designId = "designToDelete";
        Design design = new Design();
        design.setId(designId);
        design.setActive(true);
        design.setCreatedBy(new User());

        when(designRepository.findByIdAndActiveTrue(designId)).thenReturn(Optional.of(design));

        // Act
        designService.deleteDesign(designId);

        // Assert
        assertFalse(design.isActive());
        verify(designRepository).save(design);
    }

    @Test
    void updateDesign_SuccessfulUpdate() {
        // Arrange
        String designId = "existingDesignId";
        DesignDTO updateDTO = new DesignDTO();
        updateDTO.setName("Updated Design");
        updateDTO.setDescription("New description");
        updateDTO.setBasePrice(new BigDecimal("1000.0"));

        Design existingDesign = new Design();
        existingDesign.setId(designId);
        existingDesign.setName("Old Design");
        existingDesign.setCreatedBy(new User());

        when(designRepository.findByIdAndActiveTrue(designId)).thenReturn(Optional.of(existingDesign));
        when(designRepository.save(any(Design.class))).thenReturn(existingDesign);

        // Act
        DesignDTO result = designService.updateDesign(designId, updateDTO);

        // Assert
        assertNotNull(result);
        assertEquals("Updated Design", result.getName());
        assertEquals("New description", result.getDescription());
        assertEquals(new BigDecimal("1000.0"), result.getBasePrice());
        verify(designRepository).save(existingDesign);
    }

    @Test
    void rejectDesign_SuccessfulRejection() {
        // Arrange
        String designId = "designToReject";
        Design design = new Design();
        design.setId(designId);
        design.setStatus(Design.DesignStatus.PENDING_APPROVAL);
        design.setCreatedBy(new User());

        when(designRepository.findByIdAndActiveTrue(designId)).thenReturn(Optional.of(design));
        when(designRepository.save(any(Design.class))).thenReturn(design);

        // Act
        DesignDTO result = designService.rejectDesign(designId);

        // Assert
        assertEquals(Design.DesignStatus.REJECTED.name(), result.getStatus());
        verify(designRepository).save(design);
    }

    @Test
    void getPendingApprovalDesigns_ReturnsListOfPendingDesigns() {
        // Arrange
        Design design1 = new Design();
        design1.setId("design1");
        design1.setName("Pending Design 1");
        design1.setStatus(Design.DesignStatus.PENDING_APPROVAL);
        design1.setCreatedBy(new User());

        Design design2 = new Design();
        design2.setId("design2");
        design2.setName("Pending Design 2");
        design2.setStatus(Design.DesignStatus.PENDING_APPROVAL);
        design2.setCreatedBy(new User());

        when(designRepository.findByStatusAndActiveTrue(Design.DesignStatus.PENDING_APPROVAL))
            .thenReturn(Arrays.asList(design1, design2));

        // Act
        List<DesignDTO> results = designService.getPendingApprovalDesigns();

        // Assert
        assertEquals(2, results.size());
        assertEquals("Pending Design 1", results.get(0).getName());
        assertEquals("Pending Design 2", results.get(1).getName());
        assertTrue(results.stream().allMatch(dto -> dto.getStatus().equals(Design.DesignStatus.PENDING_APPROVAL.name())));
    }

    @Test
    void getApprovedDesigns_ReturnsListOfApprovedDesigns() {
        // Arrange
        Design design1 = new Design();
        design1.setId("design1");
        design1.setName("Approved Design 1");
        design1.setStatus(Design.DesignStatus.APPROVED);
        design1.setCreatedBy(new User());

        Design design2 = new Design();
        design2.setId("design2");
        design2.setName("Approved Design 2");
        design2.setStatus(Design.DesignStatus.APPROVED);
        design2.setCreatedBy(new User());

        when(designRepository.findByStatusAndActiveTrue(Design.DesignStatus.APPROVED))
            .thenReturn(Arrays.asList(design1, design2));

        // Act
        List<DesignDTO> results = designService.getApprovedDesigns();

        // Assert
        assertEquals(2, results.size());
        assertEquals("Approved Design 1", results.get(0).getName());
        assertEquals("Approved Design 2", results.get(1).getName());
        assertTrue(results.stream().allMatch(dto -> dto.getStatus().equals(Design.DesignStatus.APPROVED.name())));
    }

}
