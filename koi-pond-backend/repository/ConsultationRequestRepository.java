package com.koipond.backend.repository;

import com.koipond.backend.model.ConsultationRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsultationRequestRepository extends JpaRepository<ConsultationRequest, String> {
}