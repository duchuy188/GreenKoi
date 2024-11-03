package com.koipond.backend.service;

import com.koipond.backend.dto.DesignDTO;
import com.koipond.backend.model.Design;
import com.koipond.backend.model.User;
import com.koipond.backend.repository.DesignRepository;
import com.koipond.backend.repository.UserRepository;
import com.koipond.backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DesignService {

    private final DesignRepository designRepository;
    private final UserRepository userRepository;

    public DesignService(DesignRepository designRepository, UserRepository userRepository) {
        this.designRepository = designRepository;
        this.userRepository = userRepository;
    }

    public DesignDTO createDesign(DesignDTO designDTO, String designerUsername) {
        synchronized (designerUsername.intern()) {
            User designer = userRepository.findByUsername(designerUsername)
                    .orElseThrow(() -> new ResourceNotFoundException("Designer not found"));

            Design design = new Design();
            updateDesignFromDTO(design, designDTO);
            design.setCreatedBy(designer);
            design.setStatus(Design.DesignStatus.PENDING_APPROVAL);

            Design savedDesign = designRepository.save(design);
            return convertToDTO(savedDesign);
        }
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
            
            // Validate status transition
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
            
            // Validate current status
            if (design.getStatus() != Design.DesignStatus.PENDING_APPROVAL) {
                throw new IllegalStateException(
                    "Can only approve designs in PENDING_APPROVAL status. Current status: " + design.getStatus());
            }
            
            design.setStatus(Design.DesignStatus.APPROVED);
            Design updatedDesign = designRepository.save(design);
            return convertToDTO(updatedDesign);
        }
    }

    public DesignDTO rejectDesign(String id, String rejectionReason) {
        synchronized (id.intern()) {
            Design design = findDesignById(id);
            
            // Validate current status
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
            
            // Validate if design can be deleted
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
        // Validate required fields
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
        
        // Status validation and update
        if (dto.getStatus() != null) {
            try {
                Design.DesignStatus newStatus = Design.DesignStatus.valueOf(dto.getStatus());
                validateStatusTransition(design.getStatus(), newStatus);
                design.setStatus(newStatus);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid status: " + dto.getStatus());
            }
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
        // Xử lý trường hợp status là null
        dto.setStatus(design.getStatus() != null ? design.getStatus().name() : Design.DesignStatus.PENDING_APPROVAL.name());
        dto.setRejectionReason(design.getRejectionReason());
        return dto;
    }

    public List<DesignDTO> searchDesignsByName(String name) {
        return designRepository.findByNameContainingIgnoreCaseAndActiveTrue(name).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}
