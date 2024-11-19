package com.koipond.backend.service;

import com.koipond.backend.dto.DesignRequestDTO;
import com.koipond.backend.model.DesignRequest;
import com.koipond.backend.model.ConsultationRequest;
import com.koipond.backend.model.User;
import com.koipond.backend.model.Design;
import com.koipond.backend.repository.DesignRequestRepository;
import com.koipond.backend.repository.ConsultationRequestRepository;
import com.koipond.backend.repository.UserRepository;
import com.koipond.backend.repository.DesignRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@Service
@Transactional
public class DesignRequestService {
    private static final Logger logger = LoggerFactory.getLogger(DesignRequestService.class);
    private final DesignRequestRepository designRequestRepository;
    private final ConsultationRequestRepository consultationRepository;
    private final UserRepository userRepository;
    private final DesignRepository designRepository;

    public DesignRequestService(DesignRequestRepository designRequestRepository,
                              ConsultationRequestRepository consultationRepository,
                              UserRepository userRepository,
                              DesignRepository designRepository) {
        this.designRequestRepository = designRequestRepository;
        this.consultationRepository = consultationRepository;
        this.userRepository = userRepository;
        this.designRepository = designRepository;
    }

    // Tạo yêu cầu thiết kế từ yêu cầu tư vấn
    public DesignRequestDTO createFromConsultation(String consultationId) {
        logger.info("Creating design request for consultation: {}", consultationId);
        if (consultationId == null || consultationId.trim().isEmpty()) {
            throw new RuntimeException("Consultation ID cannot be empty");
        }
        
        ConsultationRequest consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new RuntimeException("Consultation not found"));

        // Kiểm tra xem đã có design request chưa
        if (designRequestRepository.existsByConsultationId(consultationId)) {
            throw new RuntimeException("Design request already exists for this consultation");
        }

        DesignRequest designRequest = new DesignRequest();
        designRequest.setConsultation(consultation);
        designRequest.setStatus(DesignRequest.DesignRequestStatus.PENDING);
        
        // Copy một số thông tin cần thiết
        designRequest.setEstimatedCost(consultation.getEstimatedCost());
        designRequest.setDesignNotes(consultation.getConsultationNotes());
        
        return convertToDTO(designRequestRepository.save(designRequest), "ROLE_2");
    }

    // Phân công designer
    public DesignRequestDTO assignDesigner(String requestId, String designerId) {
        logger.info("Assigning designer to design request: {}", requestId);
        if (requestId == null || designerId == null) {
            throw new RuntimeException("Request ID and Designer ID cannot be null");
        }
        DesignRequest request = findRequest(requestId);
        User designer = userRepository.findById(designerId)
                .orElseThrow(() -> new RuntimeException("Designer not found"));

        request.setDesigner(designer);
        validateStatusTransition(request.getStatus(), DesignRequest.DesignRequestStatus.IN_PROGRESS);
        request.setStatus(DesignRequest.DesignRequestStatus.IN_PROGRESS);

        return convertToDTO(designRequestRepository.save(request), "ROLE_1");
    }

    // Lấy danh sách theo designer
    public List<DesignRequestDTO> getDesignerRequests(String username) {
        User designer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Designer not found"));

        return designRequestRepository.findByDesigner(designer).stream()
                .map(request -> convertToDTO(request, "ROLE_3"))
                .collect(Collectors.toList());
    }

    // Lấy danh sách theo khách hàng
    public List<DesignRequestDTO> getCustomerRequests(String username) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        return designRequestRepository.findByConsultation_Customer(customer).stream()
                .map(request -> convertToDTO(request, "ROLE_5"))
                .collect(Collectors.toList());
    }

    // Helper methods
    private DesignRequest findRequest(String id) {
        return designRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Design request not found"));
    }

    private DesignRequestDTO convertToDTO(DesignRequest request, String role) {
        DesignRequestDTO dto = new DesignRequestDTO();
        dto.setId(request.getId());
        dto.setStatus(request.getStatus().name());

        // Thông tin Design cơ bản - ai cũng thấy
        if (request.getDesign() != null) {
            dto.setDesignId(request.getDesign().getId());
            dto.setDesignName(request.getDesign().getName());
            dto.setDesignDescription(request.getDesign().getDescription());
        }

        // Thông tin public - ai cũng thấy
        dto.setEstimatedCost(request.getEstimatedCost());
        dto.setRejectionReason(request.getRejectionReason());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());

        // Thông tin chi tiết - manager, designer, consultant và customer đều thấy
        if ("ROLE_1".equals(role) || "ROLE_2".equals(role) || 
            "ROLE_3".equals(role) || "ROLE_5".equals(role)) {
            ConsultationRequest consultation = request.getConsultation();
            if (consultation != null) {
                dto.setConsultationId(consultation.getId());
                dto.setRequirements(consultation.getRequirements());
                dto.setPreferredStyle(consultation.getPreferredStyle());
                dto.setDimensions(consultation.getDimensions());
                dto.setBudget(consultation.getBudget());
                
                User customer = consultation.getCustomer();
                if (customer != null) {
                    dto.setCustomerId(customer.getId());
                    dto.setCustomerName(customer.getFullName());
                }
            }

            User designer = request.getDesigner();
            if (designer != null) {
                dto.setDesignerId(designer.getId());
                dto.setDesignerName(designer.getFullName());
            }

            dto.setDesignNotes(request.getDesignNotes());
            dto.setReviewNotes(request.getReviewNotes());
            dto.setRevisionCount(request.getRevisionCount());
            
            if (request.getReviewer() != null) {
                dto.setReviewerId(request.getReviewer().getId());
                dto.setReviewerName(request.getReviewer().getFullName());
            }
            dto.setReviewDate(request.getReviewDate());
        }

        return dto;
    }

    // Thêm method kiểm tra chuyển trạng thái hợp lệ
    private void validateStatusTransition(DesignRequest.DesignRequestStatus currentStatus, 
                                        DesignRequest.DesignRequestStatus newStatus) {
        // Kiểm tra các trạng thái không thể chuyển đi
        if (currentStatus == DesignRequest.DesignRequestStatus.CANCELLED || 
            currentStatus == DesignRequest.DesignRequestStatus.APPROVED) {
            throw new RuntimeException("Cannot update " + currentStatus.name().toLowerCase() + " request");
        }

        // Định nghĩa các chuyển đổi trạng thái hợp lệ
        boolean isValidTransition = switch (currentStatus) {
            case PENDING -> newStatus == DesignRequest.DesignRequestStatus.IN_PROGRESS || 
                           newStatus == DesignRequest.DesignRequestStatus.CANCELLED;
                       
            case IN_PROGRESS -> newStatus == DesignRequest.DesignRequestStatus.COMPLETED || 
                               newStatus == DesignRequest.DesignRequestStatus.CANCELLED;
                           
            case COMPLETED -> newStatus == DesignRequest.DesignRequestStatus.PENDING_CUSTOMER_APPROVAL || 
                             newStatus == DesignRequest.DesignRequestStatus.IN_PROGRESS ||
                             newStatus == DesignRequest.DesignRequestStatus.CANCELLED;
                         
            case PENDING_CUSTOMER_APPROVAL -> newStatus == DesignRequest.DesignRequestStatus.APPROVED || 
                                            newStatus == DesignRequest.DesignRequestStatus.IN_PROGRESS ||
                                            newStatus == DesignRequest.DesignRequestStatus.CANCELLED;
                                        
            case REJECTED -> newStatus == DesignRequest.DesignRequestStatus.IN_PROGRESS;
            
            default -> false;
        };

        if (!isValidTransition) {
            throw new RuntimeException(String.format(
                "Invalid status transition from %s to %s", 
                currentStatus.name(), 
                newStatus.name()
            ));
        }
    }

    // Thêm method liên kết Design với DesignRequest
    public DesignRequestDTO linkDesignToRequest(String requestId, String designId, 
                                              String designNotes, BigDecimal estimatedCost) {
        logger.info("Linking design {} to request {} with notes", designId, requestId);
        DesignRequest request = findRequest(requestId);
        Design design = designRepository.findById(designId)
                .orElseThrow(() -> new RuntimeException("Design not found"));

        // Thêm kiểm tra này để đảm bảo mỗi request chỉ có một design
        if (request.getDesign() != null) {
            throw new RuntimeException("This request already has a linked design");
        }

        // Kiểm tra quyền
        if (request.getDesigner() == null || 
            !request.getDesigner().getId().equals(design.getCreatedBy().getId())) {
            throw new RuntimeException("Only assigned designer can link design");
        }

        // Kiểm tra trạng thái
        if (request.getStatus() != DesignRequest.DesignRequestStatus.IN_PROGRESS) {
            throw new RuntimeException("Can only link design to IN_PROGRESS request");
        }

        // Thêm design notes và estimated cost
        request.setDesign(design);
        request.setDesignNotes(designNotes);
        request.setEstimatedCost(estimatedCost);
        
        return convertToDTO(designRequestRepository.save(request), "ROLE_3");
    }

    public DesignRequestDTO customerApproval(String requestId, boolean approved, String rejectionReason) {
        logger.info("Customer reviewing design request: {}", requestId);
        DesignRequest request = findRequest(requestId);

        if (request.getStatus() != DesignRequest.DesignRequestStatus.PENDING_CUSTOMER_APPROVAL) {
            throw new RuntimeException("Request must be in PENDING_CUSTOMER_APPROVAL status");
        }

        if (approved) {
            validateStatusTransition(request.getStatus(), DesignRequest.DesignRequestStatus.APPROVED);
            request.setStatus(DesignRequest.DesignRequestStatus.APPROVED);
            
            if (request.getDesign() != null) {
                Design design = request.getDesign();
                if (design.isCustom()) {
                    design.setStatus(Design.DesignStatus.APPROVED);
                    design.setPublic(false);
                    design.setCustomerApprovedPublic(null);
                    design.setCustomerApprovalDate(null);
                    designRepository.save(design);
                }
            }
        } else {
            if (rejectionReason == null || rejectionReason.trim().isEmpty()) {
                throw new RuntimeException("Rejection reason is required when rejecting a design");
            }
            validateStatusTransition(request.getStatus(), DesignRequest.DesignRequestStatus.IN_PROGRESS);
            request.setStatus(DesignRequest.DesignRequestStatus.IN_PROGRESS);
            request.setRejectionReason(rejectionReason);
            request.setRevisionCount(request.getRevisionCount() + 1);
            
            if (request.getDesign() != null) {
                request.getDesign().setRejectionReason(rejectionReason);
            }
            syncDesignStatus(request, DesignRequest.DesignRequestStatus.REJECTED);
        }

        return convertToDTO(designRequestRepository.save(request), "ROLE_5");
    }

    public DesignRequestDTO submitForReview(String requestId) {
        logger.info("Submitting design for review: {}", requestId);
        DesignRequest request = findRequest(requestId);

        if (request.getStatus() != DesignRequest.DesignRequestStatus.IN_PROGRESS) {
            throw new RuntimeException("Can only submit IN_PROGRESS designs for review");
        }

        if (request.getDesign() == null) {
            throw new RuntimeException("No design linked to this request. Please link a design first");
        }

        validateStatusTransition(request.getStatus(), DesignRequest.DesignRequestStatus.COMPLETED);
        request.setStatus(DesignRequest.DesignRequestStatus.COMPLETED);
        syncDesignStatus(request, DesignRequest.DesignRequestStatus.COMPLETED);

        return convertToDTO(designRequestRepository.save(request), "ROLE_3");
    }

    public DesignRequestDTO consultantReview(String requestId, String consultantUsername, 
                                           String reviewNotes, boolean approved, String rejectionReason) {
        logger.info("Consultant reviewing design: {}", requestId);
        DesignRequest request = findRequest(requestId);

        if (request.getStatus() != DesignRequest.DesignRequestStatus.COMPLETED) {
            throw new RuntimeException("Can only review designs that have been submitted (COMPLETED status)");
        }

        if (request.getDesign() == null) {
            throw new RuntimeException("No design linked to this request");
        }

        User consultant = userRepository.findByUsername(consultantUsername)
                .orElseThrow(() -> new RuntimeException("Consultant not found"));

        if (approved) {
            validateStatusTransition(request.getStatus(), 
                DesignRequest.DesignRequestStatus.PENDING_CUSTOMER_APPROVAL);
            request.setStatus(DesignRequest.DesignRequestStatus.PENDING_CUSTOMER_APPROVAL);
            request.setReviewNotes(reviewNotes);
            syncDesignStatus(request, DesignRequest.DesignRequestStatus.PENDING_CUSTOMER_APPROVAL);
        } else {
            // Kiểm tra rejection reason khi reject
            if (rejectionReason == null || rejectionReason.trim().isEmpty()) {
                throw new RuntimeException("Rejection reason is required when rejecting a design");
            }
            
            validateStatusTransition(request.getStatus(), DesignRequest.DesignRequestStatus.IN_PROGRESS);
            request.setStatus(DesignRequest.DesignRequestStatus.IN_PROGRESS);
            request.setRejectionReason(rejectionReason); // Thêm rejection reason
            
            // Cập nhật rejection reason cho design
            if (request.getDesign() != null) {
                request.getDesign().setRejectionReason(rejectionReason);
            }
            
            syncDesignStatus(request, DesignRequest.DesignRequestStatus.REJECTED);
        }

        request.setReviewer(consultant);
        request.setReviewDate(LocalDateTime.now());

        return convertToDTO(designRequestRepository.save(request), "ROLE_2");
    }

    // Thêm method này vào class DesignRequestService
    private void syncDesignStatus(DesignRequest request, DesignRequest.DesignRequestStatus newStatus) {
        if (request.getDesign() != null) {
            Design design = request.getDesign();
            
            // Chỉ sync status khi là thiết kế theo yêu cầu
            if (design.isCustom()) {
                Design.DesignStatus designStatus = switch (newStatus) {
                    case APPROVED -> {
                        design.setPublic(false);
                        design.setCustomerApprovedPublic(null);
                        design.setCustomerApprovalDate(null);
                        yield Design.DesignStatus.APPROVED;
                    }
                    case REJECTED -> Design.DesignStatus.REJECTED;
                    case CANCELLED -> Design.DesignStatus.CANCELLED;
                    case IN_PROGRESS -> Design.DesignStatus.PENDING_APPROVAL;
                    default -> design.getStatus(); // Giữ nguyên status hiện tại
                };
                
                design.setStatus(designStatus);
                if (newStatus == DesignRequest.DesignRequestStatus.CANCELLED) {
                    design.setRejectionReason(request.getRejectionReason());
                }
                designRepository.save(design);
            }
        }
    }

    public List<DesignRequestDTO> getPendingReviewRequests() {
        return designRequestRepository
            .findByStatus(DesignRequest.DesignRequestStatus.COMPLETED)
            .stream()
            .map(request -> convertToDTO(request, "ROLE_2"))
            .collect(Collectors.toList());
    }

    // Thêm method lấy danh sách chờ phân công
    public List<DesignRequestDTO> getPendingAssignmentRequests() {
        logger.info("Getting design requests pending assignment");
        return designRequestRepository
            .findByStatus(DesignRequest.DesignRequestStatus.PENDING)
            .stream()
            .map(request -> convertToDTO(request, "ROLE_1"))
            .collect(Collectors.toList());
    }

    public DesignRequestDTO cancelRequest(String requestId, String rejectionReason) {
        logger.info("Cancelling design request: {}", requestId);
        DesignRequest request = findRequest(requestId);
        
        // Validate customer ownership
        ConsultationRequest consultation = request.getConsultation();
        if (consultation == null || consultation.getCustomer() == null) {
            throw new RuntimeException("Invalid request data");
        }

        // Check valid states for cancellation
        DesignRequest.DesignRequestStatus currentStatus = request.getStatus();
        switch (currentStatus) {
            case APPROVED:
                throw new RuntimeException("Cannot cancel approved design request");
            case CANCELLED:
                throw new RuntimeException("Request is already cancelled");
            case PENDING:        // Waiting for designer assignment
            case IN_PROGRESS:    // Design in progress
            case COMPLETED:      // Waiting for consultant review
            case PENDING_CUSTOMER_APPROVAL:  // Waiting for customer approval
                // Allow cancellation
                break;
            default:
                throw new RuntimeException("Invalid request status");
        }

        // Require cancellation reason
        if (rejectionReason == null || rejectionReason.trim().isEmpty()) {
            throw new RuntimeException("Reason is required when cancelling request");
        }

        request.setStatus(DesignRequest.DesignRequestStatus.CANCELLED);
        request.setRejectionReason(rejectionReason);
        request.setUpdatedAt(LocalDateTime.now());
        
        // Sync design status if exists
        if (request.getDesign() != null) {
            Design design = request.getDesign();
            if (design.isCustom()) {
                design.setStatus(Design.DesignStatus.CANCELLED);
                design.setRejectionReason(rejectionReason);
                designRepository.save(design);
            }
        }

        return convertToDTO(designRequestRepository.save(request), "ROLE_5");
    }

    // Lấy danh sách thiết kế đã được khách hàng approve
    public List<DesignRequestDTO> getCustomerApprovedDesigns() {
        logger.info("Getting customer approved designs");
        return designRequestRepository
            .findByStatus(DesignRequest.DesignRequestStatus.APPROVED)
            .stream()
            .filter(request -> request.getDesign() != null)  // Chỉ lấy request có design
            .filter(request -> request.getDesign().isCustom())  // Chỉ lấy custom design
            .map(request -> convertToDTO(request, "ROLE_1"))  // Map full thông tin
            .collect(Collectors.toList());
    }
}
