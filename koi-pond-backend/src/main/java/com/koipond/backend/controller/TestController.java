package com.koipond.backend.controller;

import com.koipond.backend.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {
    private final JwtTokenProvider jwtTokenProvider;

    @Autowired
    public TestController(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping("/token")
    public ResponseEntity<String> testToken() {
        String token = jwtTokenProvider.createToken("testuser");
        boolean isValid = jwtTokenProvider.validateToken(token);
        return ResponseEntity.ok("Token created and validated: " + isValid + ". Full token: " + token);
    }
}