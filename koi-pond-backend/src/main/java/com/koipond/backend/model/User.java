package com.koipond.backend.model;

import lombok.Data;

@Data
public class User {
    private String id;
    private String name;
    private String email;
    // Thêm các trường khác nếu cần
}