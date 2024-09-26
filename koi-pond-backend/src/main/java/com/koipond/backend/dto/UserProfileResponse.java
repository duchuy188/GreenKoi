package com.koipond.backend.dto;

import lombok.Data;

@Data
public class UserProfileResponse {
    private String id;
    private String name;
    private String email;
    // Thêm các trường khác nếu cần
}