package com.koipond.backend.service;

import com.koipond.backend.dto.DesignDTO;
import com.koipond.backend.model.Design;
import com.koipond.backend.model.User;
import com.koipond.backend.repository.DesignRepository;
import com.koipond.backend.repository.UserRepository;
import com.koipond.backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
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
        User designer = userRepository.findByUsername(designerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Designer not found"));

        Design design = new Design();
        updateDesignFromDTO(design, designDTO);
        design.setCreatedBy(designer);
        // Đặt trạng thái mặc định khi tạo mới
        design.setStatus(Design.DesignStatus.PENDING_APPROVAL);

        Design savedDesign = designRepository.save(design);
        return convertToDTO(savedDesign);
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
        Design design = findDesignById(id);
        updateDesignFromDTO(design, designDTO);
        Design updatedDesign = designRepository.save(design);
        return convertToDTO(updatedDesign);
    }

    public DesignDTO approveDesign(String id) {
        Design design = findDesignById(id);
        design.setStatus(Design.DesignStatus.APPROVED);
        Design updatedDesign = designRepository.save(design);
        return convertToDTO(updatedDesign);
    }

    public DesignDTO rejectDesign(String id, String rejectionReason) {
        Design design = findDesignById(id);
        design.setStatus(Design.DesignStatus.REJECTED);
        design.setRejectionReason(rejectionReason);
        Design updatedDesign = designRepository.save(design);
        return convertToDTO(updatedDesign);
    }

    public void deleteDesign(String id) {
        Design design = findDesignById(id);
        design.setActive(false);
        designRepository.save(design);
    }

    private Design findDesignById(String id) {
        return designRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Design not found or has been deleted"));
    }

    private void updateDesignFromDTO(Design design, DesignDTO dto) {
        design.setName(dto.getName());
        design.setDescription(dto.getDescription());
        design.setImageUrl(dto.getImageUrl());
        design.setBasePrice(dto.getBasePrice());
        design.setShape(dto.getShape());
        design.setDimensions(dto.getDimensions());
        design.setFeatures(dto.getFeatures());
        // Xử lý trường hợp status là null hoặc không hợp lệ
        if (dto.getStatus() != null) {
            try {
                design.setStatus(Design.DesignStatus.valueOf(dto.getStatus()));
            } catch (IllegalArgumentException e) {
                // Log lỗi và đặt trạng thái mặc định
                System.out.println("Invalid status: " + dto.getStatus() + ". Setting to PENDING_APPROVAL.");
                design.setStatus(Design.DesignStatus.PENDING_APPROVAL);
            }
        } else {
            design.setStatus(Design.DesignStatus.PENDING_APPROVAL);
        }
        design.setRejectionReason(dto.getRejectionReason());
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
