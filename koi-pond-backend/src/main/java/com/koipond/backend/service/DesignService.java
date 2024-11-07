package com.koipond.backend.service;

import com.koipond.backend.dto.DesignDTO;
import com.koipond.backend.model.Design;
import com.koipond.backend.model.User;
import com.koipond.backend.model.DesignRequest;
import com.koipond.backend.repository.DesignRepository;
import com.koipond.backend.repository.UserRepository;
import com.koipond.backend.repository.DesignRequestRepository;
import com.koipond.backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class DesignService {

    private final DesignRepository designRepository;
    private final UserRepository userRepository;
    private final DesignRequestRepository designRequestRepository;

    public DesignService(
            DesignRepository designRepository,
            UserRepository userRepository,
            DesignRequestRepository designRequestRepository) {
        this.designRepository = designRepository;
        this.userRepository = userRepository;
        this.designRequestRepository = designRequestRepository;
    }

    public DesignDTO createDesign(DesignDTO designDTO, String designerUsername) {
        synchronized (designerUsername.intern()) {
            User designer = userRepository.findByUsername(designerUsername)
                    .orElseThrow(() -> new ResourceNotFoundException("Designer not found"));

            Design design = new Design();
            updateDesignFromDTO(design, designDTO);
            design.setCreatedBy(designer);
            design.setStatus(Design.DesignStatus.PENDING_APPROVAL);
            design.setPublic(false);
            design.setCustom(false);

            Design savedDesign = designRepository.save(design);
            return convertToDTO(savedDesign);
        }
    }

    public DesignDTO createFromDesignRequest(DesignDTO designDTO, String designerUsername, String requestId) {
        synchronized (designerUsername.intern()) {
            User designer = userRepository.findByUsername(designerUsername)
                    .orElseThrow(() -> new ResourceNotFoundException("Designer not found"));

            Design design = new Design();
            updateDesignFromDTO(design, designDTO);
            design.setCreatedBy(designer);
            design.setStatus(Design.DesignStatus.PENDING_APPROVAL);
            design.setPublic(false);
            design.setCustom(true);

            Design savedDesign = designRepository.save(design);
            return convertToDTO(savedDesign);
        }
    }

    public DesignDTO approvePublicDesign(String designId, String username) {
        synchronized (designId.intern()) {
            Design design = findDesignById(designId);
            
            if (!design.isCustom()) {
                throw new IllegalStateException("Only custom designs need customer approval");
            }
            
            DesignRequest designRequest = designRequestRepository.findByDesignId(designId)
                .orElseThrow(() -> new ResourceNotFoundException("Design request not found"));
            
            if (designRequest.getStatus() != DesignRequest.DesignRequestStatus.APPROVED) {
                throw new IllegalStateException("Design request must be approved before public approval");
            }
            
            if (!designRequest.getConsultation().getCustomer().getUsername().equals(username)) {
                throw new IllegalStateException("Only project owner can approve public display");
            }
            
            design.setCustomerApprovedPublic(true);
            design.setCustomerApprovalDate(LocalDateTime.now());
            
            Design updatedDesign = designRepository.save(design);
            return convertToDTO(updatedDesign);
        }
    }

    public DesignDTO publishDesign(String designId) {
        synchronized (designId.intern()) {
            Design design = findDesignById(designId);
            
            if (design.isCustom() && !Boolean.TRUE.equals(design.getCustomerApprovedPublic())) {
                throw new IllegalStateException("Custom design must be approved by customer first");
            }
            
            design.setPublic(true);
            Design updatedDesign = designRepository.save(design);
            return convertToDTO(updatedDesign);
        }
    }

    public List<DesignDTO> getPublicDesigns() {
        return designRepository.findByIsPublicTrueAndActiveTrue()
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public DesignDTO getDesign(String id) {
        return convertToDTO(findDesignById(id));
    }

    public List<DesignDTO> getDesignsByDesigner(String designerUsername) {
        User designer = userRepository.findByUsername(designerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Designer not found"));
        return designRepository.findByCreatedBy_IdAndActiveTrue(designer.getId()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<DesignDTO> getPendingApprovalDesigns() {
        return designRepository.findByStatusAndActiveTrue(Design.DesignStatus.PENDING_APPROVAL).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<DesignDTO> getApprovedDesigns() {
        return designRepository.findByStatusAndActiveTrue(Design.DesignStatus.APPROVED).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public DesignDTO updateDesign(String id, DesignDTO designDTO) {
        synchronized (id.intern()) {
            Design design = findDesignById(id);
            
            if (design.getStatus() == Design.DesignStatus.APPROVED) {
                throw new IllegalStateException("Cannot update approved design");
            }
            
            updateDesignFromDTO(design, designDTO);
            Design updatedDesign = designRepository.save(design);
            return convertToDTO(updatedDesign);
        }
    }

    public DesignDTO approveDesign(String id) {
        synchronized (id.intern()) {
            Design design = findDesignById(id);
            
            if (design.getStatus() != Design.DesignStatus.PENDING_APPROVAL) {
                throw new IllegalStateException(
                    "Can only approve designs in PENDING_APPROVAL status. Current status: " + design.getStatus());
            }
            
            design.setStatus(Design.DesignStatus.APPROVED);
            
            if (!design.isCustom()) {
                design.setPublic(true);
            }
            else {
                design.setPublic(false);
                design.setCustomerApprovedPublic(null);
                design.setCustomerApprovalDate(null);
            }
            
            Design updatedDesign = designRepository.save(design);
            return convertToDTO(updatedDesign);
        }
    }

    public DesignDTO rejectDesign(String id, String rejectionReason) {
        synchronized (id.intern()) {
            Design design = findDesignById(id);
            
            if (design.getStatus() != Design.DesignStatus.PENDING_APPROVAL) {
                throw new IllegalStateException(
                    "Can only reject designs in PENDING_APPROVAL status. Current status: " + design.getStatus());
            }
            
            if (rejectionReason == null || rejectionReason.trim().isEmpty()) {
                throw new IllegalArgumentException("Rejection reason is required");
            }
            
            design.setStatus(Design.DesignStatus.REJECTED);
            design.setRejectionReason(rejectionReason);
            Design updatedDesign = designRepository.save(design);
            return convertToDTO(updatedDesign);
        }
    }

    public void deleteDesign(String id) {
        synchronized (id.intern()) {
            Design design = findDesignById(id);
            
            if (design.getStatus() == Design.DesignStatus.APPROVED) {
                throw new IllegalStateException("Cannot delete approved design");
            }
            
            design.setActive(false);
            designRepository.save(design);
        }
    }

    private Design findDesignById(String id) {
        return designRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Design not found or has been deleted"));
    }

    private void updateDesignFromDTO(Design design, DesignDTO dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Design name is required");
        }
        if (dto.getBasePrice() == null || dto.getBasePrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Base price must be greater than 0");
        }

        design.setName(dto.getName());
        design.setDescription(dto.getDescription());
        design.setImageUrl(dto.getImageUrl());
        design.setBasePrice(dto.getBasePrice());
        design.setShape(dto.getShape());
        design.setDimensions(dto.getDimensions());
        design.setFeatures(dto.getFeatures());
        
        if (dto.getStatus() != null) {
            try {
                Design.DesignStatus newStatus = Design.DesignStatus.valueOf(dto.getStatus());
                validateStatusTransition(design.getStatus(), newStatus);
                design.setStatus(newStatus);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid status: " + dto.getStatus());
            }
        }

        if (design.getId() == null && dto.isCustom() != design.isCustom()) {
            design.setCustom(dto.isCustom());
        }
        
        if (dto.getReferenceDesignId() != null && 
            (design.getReferenceDesign() == null || 
             !design.getReferenceDesign().getId().equals(dto.getReferenceDesignId()))) {
            Design referenceDesign = findDesignById(dto.getReferenceDesignId());
            design.setReferenceDesign(referenceDesign);
        }
    }

    private void validateStatusTransition(Design.DesignStatus currentStatus, Design.DesignStatus newStatus) {
        if (currentStatus == Design.DesignStatus.APPROVED && newStatus != Design.DesignStatus.APPROVED) {
            throw new IllegalStateException("Cannot change status of approved design");
        }
        if (currentStatus == Design.DesignStatus.REJECTED && newStatus == Design.DesignStatus.APPROVED) {
            throw new IllegalStateException("Cannot approve rejected design directly");
        }
    }

    private DesignDTO convertToDTO(Design design) {
        DesignDTO dto = new DesignDTO();
        dto.setId(design.getId());
        dto.setName(design.getName());
        dto.setDescription(design.getDescription());
        dto.setImageUrl(design.getImageUrl());
        dto.setBasePrice(design.getBasePrice());
        dto.setShape(design.getShape());
        dto.setDimensions(design.getDimensions());
        dto.setFeatures(design.getFeatures());
        dto.setCreatedById(design.getCreatedBy().getId());
        dto.setStatus(design.getStatus() != null ? design.getStatus().name() : Design.DesignStatus.PENDING_APPROVAL.name());
        dto.setRejectionReason(design.getRejectionReason());
        dto.setCreatedAt(design.getCreatedAt());
        dto.setUpdatedAt(design.getUpdatedAt());
        dto.setPublic(design.isPublic());
        dto.setCustom(design.isCustom());
        dto.setCustomerApprovedPublic(design.getCustomerApprovedPublic());
        dto.setCustomerApprovalDate(design.getCustomerApprovalDate());
        
        if (design.getReferenceDesign() != null) {
            dto.setReferenceDesignId(design.getReferenceDesign().getId());
            dto.setReferenceDesignName(design.getReferenceDesign().getName());
            dto.setReferenceDesignDescription(design.getReferenceDesign().getDescription());
        }
        
        return dto;
    }

    public List<DesignDTO> searchDesignsByName(String name) {
        return designRepository.findByNameContainingIgnoreCaseAndActiveTrue(name).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public DesignDTO suggestPublicDesign(String designId) {
        synchronized (designId.intern()) {
            Design design = findDesignById(designId);
            
            if (!design.isCustom()) {
                throw new IllegalStateException("Only custom designs can be suggested for public");
            }
            
            if (design.isPublic()) {
                throw new IllegalStateException("Design is already public");
            }
            
            design.setCustomerApprovedPublic(null);
            design.setCustomerApprovalDate(null);
            
            Design updatedDesign = designRepository.save(design);
            return convertToDTO(updatedDesign);
        }
    }
}
