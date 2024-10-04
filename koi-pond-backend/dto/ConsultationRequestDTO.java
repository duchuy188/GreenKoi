    package com.koipond.backend.dto;

    import lombok.Data;

    @Data
    public class ConsultationRequestDTO {
        private String designId;
        private String notes;
        private String phoneNumber;
        private String address;
        // Các trường khác như tên, email có thể lấy từ thông tin user đã đăng nhập
    }