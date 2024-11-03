package com.koipond.backend.service;

import com.koipond.backend.dto.ConsultationRequest;
import com.koipond.backend.model.Design;
import com.koipond.backend.model.User;
import com.koipond.backend.repository.ConsultationRequestRepository;
import com.koipond.backend.repository.DesignRepository;
import com.koipond.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.util.Arrays;

@Service
public class ConsultationRequestService {

    private final ConsultationRequestRepository consultationRequestRepository;
    private final UserRepository userRepository;
    private final DesignRepository designRepository;

    public enum ConsultationStatus {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }

    public ConsultationRequestService(ConsultationRequestRepository consultationRequestRepository,
                                      UserRepository userRepository,
                                      DesignRepository designRepository) {
        this.consultationRequestRepository = consultationRequestRepository;
        this.userRepository = userRepository;
        this.designRepository = designRepository;
    }

    public com.koipond.backend.model.ConsultationRequest createRequest(ConsultationRequest dto, String username) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Design design = designRepository.findById(dto.getDesignId())
                .orElseThrow(() -> new RuntimeException("Design not found"));

        com.koipond.backend.model.ConsultationRequest request = new com.koipond.backend.model.ConsultationRequest();
        request.setCustomer(customer);
        request.setDesign(design);
        request.setNotes(dto.getNotes());
        request.setStatus(ConsultationStatus.PENDING.name());

        return consultationRequestRepository.save(request);
    }

    public List<ConsultationRequest> getConsultationRequests(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<com.koipond.backend.model.ConsultationRequest> requests;
        if ("2".equals(user.getRoleId())) { // Consulting Staff
            requests = consultationRequestRepository.findAll();
        } else {
            requests = consultationRequestRepository.findByCustomer(user);
        }

        return requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ConsultationRequest updateStatus(String requestId, String newStatus, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"2".equals(user.getRoleId())) {
            throw new RuntimeException("Only consulting staff can update request status");
        }

        synchronized (requestId.intern()) {
            com.koipond.backend.model.ConsultationRequest request = consultationRequestRepository.findById(requestId)
                    .orElseThrow(() -> new RuntimeException("Consultation request not found"));

            if (!ConsultationStatus.PENDING.name().equals(request.getStatus())) {
                throw new RuntimeException("Can only update PENDING requests. Current status: " + request.getStatus());
            }

            try {
                ConsultationStatus status = ConsultationStatus.valueOf(newStatus);
                request.setStatus(status.name());
                request.setUpdatedAt(LocalDateTime.now());
                com.koipond.backend.model.ConsultationRequest updatedRequest = consultationRequestRepository.save(request);
                return convertToDTO(updatedRequest);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid status: " + newStatus);
            }
        }
    }

    public List<ConsultationRequest> getConsultationRequestsByCustomerId(String customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        List<com.koipond.backend.model.ConsultationRequest> requests = consultationRequestRepository.findByCustomer(customer);
        return requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ConsultationRequest convertToDTO(com.koipond.backend.model.ConsultationRequest request) {
        ConsultationRequest dto = new ConsultationRequest();
        dto.setId(request.getId());
        dto.setStatus(request.getStatus());
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

        return dto;
    }

    public List<String> getValidStatuses() {
        return Arrays.stream(ConsultationStatus.values())
                     .map(Enum::name)
                     .collect(Collectors.toList());
    }

    public ConsultationRequest updateCustomerRequest(String requestId, ConsultationRequest updatedDTO, String username) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        com.koipond.backend.model.ConsultationRequest request = consultationRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Consultation request not found"));

        if (!request.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Unauthorized access to consultation request");
        }

        if (!request.getStatus().equals(ConsultationStatus.PENDING.name())) {
            throw new RuntimeException("Can only update PENDING requests");
        }

        request.setNotes(updatedDTO.getNotes());
        // Cập nhật các trường khác nếu cần

        com.koipond.backend.model.ConsultationRequest updatedRequest = consultationRequestRepository.save(request);
        return convertToDTO(updatedRequest);
    }

    public void cancelCustomerRequest(String requestId, String username) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        synchronized (requestId.intern()) {
            com.koipond.backend.model.ConsultationRequest request = consultationRequestRepository.findById(requestId)
                    .orElseThrow(() -> new RuntimeException("Consultation request not found"));

            if (!request.getCustomer().getId().equals(customer.getId())) {
                throw new RuntimeException("Unauthorized access to consultation request");
            }

            if (!ConsultationStatus.PENDING.name().equals(request.getStatus())) {
                throw new RuntimeException("Can only cancel PENDING requests. Current status: " + request.getStatus());
            }

            request.setStatus(ConsultationStatus.CANCELLED.name());
            request.setUpdatedAt(LocalDateTime.now());
            consultationRequestRepository.save(request);
        }
    }
}
