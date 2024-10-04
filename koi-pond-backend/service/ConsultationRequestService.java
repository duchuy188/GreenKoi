package com.koipond.backend.service;

import com.koipond.backend.dto.ConsultationRequestDTO;
import com.koipond.backend.model.ConsultationRequest;
import com.koipond.backend.model.Design;
import com.koipond.backend.model.User;
import com.koipond.backend.repository.ConsultationRequestRepository;
import com.koipond.backend.repository.DesignRepository;
import com.koipond.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class ConsultationRequestService {

    private final ConsultationRequestRepository consultationRequestRepository;
    private final UserRepository userRepository;
    private final DesignRepository designRepository;

    public ConsultationRequestService(ConsultationRequestRepository consultationRequestRepository,
                                      UserRepository userRepository,
                                      DesignRepository designRepository) {
        this.consultationRequestRepository = consultationRequestRepository;
        this.userRepository = userRepository;
        this.designRepository = designRepository;
    }

    public ConsultationRequest createRequest(ConsultationRequestDTO dto, String username) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Design design = designRepository.findById(dto.getDesignId())
                .orElseThrow(() -> new RuntimeException("Design not found"));

        ConsultationRequest request = new ConsultationRequest();
        request.setCustomer(customer);
        request.setDesign(design);
        request.setNotes(dto.getNotes());
        request.setStatus("PENDING");
        request.setCreatedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());

        // Có thể thêm xử lý cho phoneNumber và address ở đây nếu cần
        // Ví dụ: gửi email thông báo hoặc lưu vào một bảng riêng biệt

        return consultationRequestRepository.save(request);
    }
}