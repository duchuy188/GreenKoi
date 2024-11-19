package com.koipond.backend.security;


import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.util.ReflectionTestUtils;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtTokenProviderTest {

    @InjectMocks
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private UserDetailsService userDetailsService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", "testSecretKeyWithAtLeast256BitsForHS256Algorithm");
        ReflectionTestUtils.setField(jwtTokenProvider, "validityInMilliseconds", 3600000L); // 1 hour
        jwtTokenProvider.init();
    }

    @Test
    void createToken_ShouldReturnValidToken() {
        String username = "testUser";
        String roleId = "1";
        String token = jwtTokenProvider.createToken(username, roleId);

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals(username, jwtTokenProvider.getUsername(token));
        assertEquals("ROLE_" + roleId, jwtTokenProvider.getRoleId(token));
    }

    @Test
    void validateToken_WithValidToken_ShouldReturnTrue() {
        String token = jwtTokenProvider.createToken("testUser", "1");
        assertTrue(jwtTokenProvider.validateToken(token));
    }

    @Test
    void validateToken_WithExpiredToken_ShouldReturnFalse() {
        String expiredToken = createExpiredToken("testUser", "1");
        assertFalse(jwtTokenProvider.validateToken(expiredToken));
    }

    @Test
    void getAuthentication_ShouldReturnValidAuthentication() {
        String token = jwtTokenProvider.createToken("testUser", "1");
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetailsService.loadUserByUsername("testUser")).thenReturn(userDetails);

        Authentication auth = jwtTokenProvider.getAuthentication(token);
        assertNotNull(auth);
        assertEquals("testUser", jwtTokenProvider.getUsername(token));
    }

    @Test
    void getUsername_ShouldReturnCorrectUsername() {
        String token = jwtTokenProvider.createToken("testUser", "1");
        assertEquals("testUser", jwtTokenProvider.getUsername(token));
    }

    @Test
    void getRoleId_ShouldReturnCorrectRoleId() {
        String token = jwtTokenProvider.createToken("testUser", "1");
        assertEquals("ROLE_1", jwtTokenProvider.getRoleId(token));
    }

    @Test
    void resolveToken_WithValidBearerToken_ShouldReturnToken() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getHeader("Authorization")).thenReturn("Bearer testToken");
        assertEquals("testToken", jwtTokenProvider.resolveToken(request));
    }

    @Test
    void resolveToken_WithoutBearerToken_ShouldReturnNull() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getHeader("Authorization")).thenReturn(null);
        when(request.getHeaderNames()).thenReturn(Collections.enumeration(Collections.emptyList()));

        assertNull(jwtTokenProvider.resolveToken(request));
    }

    @Test
    void invalidateToken_ShouldBlacklistToken() {
        String token = jwtTokenProvider.createToken("testUser", "1");
        jwtTokenProvider.invalidateToken(token);
        assertTrue(jwtTokenProvider.isTokenBlacklisted(token));
    }

    @Test
    void validateToken_WithBlacklistedToken_ShouldReturnFalse() {
        String token = jwtTokenProvider.createToken("testUser", "1");
        jwtTokenProvider.invalidateToken(token);
        assertFalse(jwtTokenProvider.validateToken(token));
    }

    private String createExpiredToken(String username, String roleId) {
        ReflectionTestUtils.setField(jwtTokenProvider, "validityInMilliseconds", -1000L);
        String token = jwtTokenProvider.createToken(username, roleId);
        ReflectionTestUtils.setField(jwtTokenProvider, "validityInMilliseconds", 3600000L);
        return token;
    }
}
