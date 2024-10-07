package com.koipond.backend.dto;

public class AuthResponse {
    private String token;
    private String userId;
    private String username;
    private String roleId;

    public AuthResponse(String token, String userId, String username, String roleId) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.roleId = roleId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
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
}