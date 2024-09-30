package com.koipond.backend.dto;

import lombok.Data;

@Data
public class UserProfileResponse {
    private String id;
    private String fullName; // Thay đổi từ name thành fullName
    private String email;
    private String phone;
    private String username;
    private String roleId;
    private String address;
    private boolean active; // Thay đổi từ isActive thành active để phù hợp với quy ước Java Bean

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRoleId() {
        return roleId;
    }

    public void setRoleId(String roleId) {
        this.roleId = roleId;
    }

    public boolean isActive() {
        return active;
    }
    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
    public void setActive(boolean active) {
        this.active = active;
    }
}