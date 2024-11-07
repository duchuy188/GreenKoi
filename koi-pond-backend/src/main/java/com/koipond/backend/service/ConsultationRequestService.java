package com.koipond.backend.service;

import com.koipond.backend.dto.ConsultationRequestDTO;
import com.koipond.backend.model.Design;
import com.koipond.backend.model.User;
import com.koipond.backend.model.ConsultationRequest;
import com.koipond.backend.repository.ConsultationRequestRepository;
import com.koipond.backend.repository.DesignRepository;
import com.koipond.backend.repository.UserRepository;
import com.koipond.backend.model.DesignRequest;
import com.koipond.backend.repository.DesignRequestRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.util.Arrays;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Service
public class ConsultationRequestService {

    private final ConsultationRequestRepository consultationRequestRepository;
    private final UserRepository userRepository;
    private final DesignRepository designRepository;
    private final DesignRequestRepository designRequestRepository;

    @Autowired
    public ConsultationRequestService(ConsultationRequestRepository consultationRequestRepository,
                                      UserRepository userRepository,
                                      DesignRepository designRepository,
                                      DesignRequestRepository designRequestRepository) {
        this.consultationRequestRepository = consultationRequestRepository;
        this.userRepository = userRepository;
        this.designRepository = designRepository;
        this.designRequestRepository = designRequestRepository;
    }

    @PostMapping
    public ConsultationRequest createRequest(ConsultationRequestDTO dto, String username) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ConsultationRequest request = new ConsultationRequest();
        request.setCustomer(customer);
        
        if (!dto.isCustomDesign()) {
            Design design = designRepository.findById(dto.getDesignId())
                    .orElseThrow(() -> new RuntimeException("Design not found"));
            request.setDesign(design);
        }
        
        request.setCustomDesign(dto.isCustomDesign());
        request.setNotes(dto.getNotes());
        request.setRequirements(dto.getRequirements());
        request.setPreferredStyle(dto.getPreferredStyle());
        request.setDimensions(dto.getDimensions());
        request.setBudget(dto.getBudget());
        request.setStatus(ConsultationRequest.ConsultationStatus.PENDING);

        return consultationRequestRepository.save(request);
    }

    @GetMapping
    public List<ConsultationRequestDTO> getConsultationRequests(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ConsultationRequest> requests;
        if ("2".equals(user.getRoleId())) { // Consulting Staff
            requests = consultationRequestRepository.findAll();
        } else {
            requests = consultationRequestRepository.findByCustomer(user);
        }

        return requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @PutMapping("/{requestId}/status")
    public ConsultationRequestDTO updateStatus(String requestId, String newStatus, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"2".equals(user.getRoleId())) {
            throw new RuntimeException("Only consulting staff can update request status");
        }

        synchronized (requestId.intern()) {
            ConsultationRequest request = consultationRequestRepository.findById(requestId)
                    .orElseThrow(() -> new RuntimeException("Consultation request not found"));

            String currentStatus = request.getStatus().name();
            
            // Kiểm tra các trạng thái không được update
            if (currentStatus.equals(ConsultationRequest.ConsultationStatus.CANCELLED.name())) {
                throw new RuntimeException("Cannot update CANCELLED requests");
            }
            
            if (currentStatus.equals(ConsultationRequest.ConsultationStatus.COMPLETED.name())) {
                throw new RuntimeException("Cannot update COMPLETED requests");
            }

            // Thêm validation cho PROCEED_DESIGN
            if (currentStatus.equals(ConsultationRequest.ConsultationStatus.PROCEED_DESIGN.name())) {
                if (!newStatus.equals(ConsultationRequest.ConsultationStatus.COMPLETED.name())) {
                    throw new RuntimeException("PROCEED_DESIGN can only be changed to COMPLETED");
                }
                // Kiểm tra Design Request đã approved chưa
                DesignRequest designRequest = designRequestRepository
                    .findByConsultationId(requestId)
                    .orElseThrow(() -> new RuntimeException("Design request not found"));
                
                if (!DesignRequest.DesignRequestStatus.APPROVED.equals(designRequest.getStatus())) {
                    throw new RuntimeException("Cannot complete consultation. Design has not been approved yet");
                }
            }
            
            // PENDING chỉ có thể chuyển sang IN_PROGRESS
            if (currentStatus.equals(ConsultationRequest.ConsultationStatus.PENDING.name()) && 
                !newStatus.equals(ConsultationRequest.ConsultationStatus.IN_PROGRESS.name())) {
                throw new RuntimeException("PENDING requests can only be changed to IN_PROGRESS");
            }
            
            // Kiểm tra luồng xử lý dựa trên loại thiết kế
            if (currentStatus.equals(ConsultationRequest.ConsultationStatus.IN_PROGRESS.name())) {
                if (request.isCustomDesign()) {
                    // Thiết kế theo yêu cầu phải qua PROCEED_DESIGN
                    if (!newStatus.equals(ConsultationRequest.ConsultationStatus.PROCEED_DESIGN.name())) {
                        throw new RuntimeException("Custom design requests must proceed to design phase");
                    }
                } else {
                    // Thiết kế mẫu có thể chuyển thẳng sang COMPLETED
                    if (!newStatus.equals(ConsultationRequest.ConsultationStatus.COMPLETED.name())) {
                        throw new RuntimeException("Standard requests can only be completed");
                    }
                    // Tự động cập nhật thông tin khi complete thiết kế mẫu
                    request.setConsultant(user);
                    request.setConsultationDate(LocalDateTime.now());
                    request.setConsultationNotes("Tư vấn hoàn tất - Thiết kế mẫu");
                }
            }

            request.setStatus(ConsultationRequest.ConsultationStatus.valueOf(newStatus));
            request.setUpdatedAt(LocalDateTime.now());
            
            return convertToDTO(consultationRequestRepository.save(request));
        }
    }

    @GetMapping("/customer/{customerId}")
    public List<ConsultationRequestDTO> getConsultationRequestsByCustomerId(String customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        List<ConsultationRequest> requests = consultationRequestRepository.findByCustomer(customer);
        return requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/statuses")
    public List<String> getValidStatuses() {
        return Arrays.stream(ConsultationRequest.ConsultationStatus.values())
                     .map(Enum::name)
                     .collect(Collectors.toList());
    }

    @PutMapping("/{requestId}")
    public ConsultationRequestDTO updateCustomerRequest(String requestId, ConsultationRequestDTO updatedDTO, String username) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ConsultationRequest request = consultationRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Consultation request not found"));

        if (!request.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Unauthorized access to consultation request");
        }

        if (!request.getStatus().name().equals(ConsultationRequest.ConsultationStatus.PENDING.name())) {
            throw new RuntimeException("Can only update PENDING requests");
        }

        request.setNotes(updatedDTO.getNotes());
        // Cập nhật các trường khác nếu cần

        ConsultationRequest updatedRequest = consultationRequestRepository.save(request);
        return convertToDTO(updatedRequest);
    }

    @DeleteMapping("/{requestId}")
    public void cancelCustomerRequest(String requestId, String username) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        synchronized (requestId.intern()) {
            ConsultationRequest request = consultationRequestRepository.findById(requestId)
                    .orElseThrow(() -> new RuntimeException("Consultation request not found"));

            if (!request.getCustomer().getId().equals(customer.getId())) {
                throw new RuntimeException("Unauthorized access to consultation request");
            }

            if (!ConsultationRequest.ConsultationStatus.PENDING.name().equals(request.getStatus().name())) {
                throw new RuntimeException("Can only cancel PENDING requests. Current status: " + request.getStatus().name());
            }

            request.setStatus(ConsultationRequest.ConsultationStatus.CANCELLED);
            request.setUpdatedAt(LocalDateTime.now());
            consultationRequestRepository.save(request);
        }
    }

    private ConsultationRequestDTO convertToDTO(ConsultationRequest request) {
        ConsultationRequestDTO dto = new ConsultationRequestDTO();
        dto.setId(request.getId());
        dto.setStatus(request.getStatus().name());
        dto.setNotes(request.getNotes());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());

        User customer = request.getCustomer();
        if (customer != null) {
            dto.setCustomerId(customer.getId());
            dto.setCustomerName(customer.getFullName());
            dto.setCustomerPhone(customer.getPhone());
            dto.setCustomerAddress(customer.getAddress());
        }

        Design design = request.getDesign();
        if (design != null) {
            dto.setDesignId(design.getId());
            dto.setDesignName(design.getName());
            dto.setDesignDescription(design.getDescription());
        }

        dto.setCustomDesign(request.isCustomDesign());
        dto.setRequirements(request.getRequirements());
        dto.setPreferredStyle(request.getPreferredStyle());
        dto.setDimensions(request.getDimensions());
        dto.setBudget(request.getBudget());
        dto.setEstimatedCost(request.getEstimatedCost());
        dto.setConsultationNotes(request.getConsultationNotes());
        
        dto.setConsultationDate(request.getConsultationDate());
        
        User consultant = request.getConsultant();
        if (consultant != null) {
            dto.setConsultantId(consultant.getId());
            dto.setConsultantName(consultant.getFullName());
        }

        return dto;
    }
}
