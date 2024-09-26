package com.koipond.backend.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String email;
    // Thêm các trường khác nếu cần
}