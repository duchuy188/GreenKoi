package com.koipond.backend.repository;

import com.koipond.backend.model.ConsultationRequest;
import com.koipond.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConsultationRequestRepository extends JpaRepository<ConsultationRequest, String> {
    List<ConsultationRequest> findByCustomer(User customer);
}