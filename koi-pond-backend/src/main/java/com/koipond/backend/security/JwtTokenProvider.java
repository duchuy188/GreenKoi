package com.koipond.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.validity-duration}")
    private long validityInMilliseconds;

    private Key key;

    private final UserDetailsService userDetailsService;

    private final Set<String> blacklistedTokens = Collections.newSetFromMap(new ConcurrentHashMap<>());

    public JwtTokenProvider(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @PostConstruct
    public void init() {
        logger.info("Initializing JWT key with secret: {}", jwtSecret.substring(0, Math.min(10, jwtSecret.length())) + "...");
        byte[] keyBytes = Base64.getDecoder().decode(jwtSecret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        logger.info("JWT key initialized successfully. Key algorithm: {}", key.getAlgorithm());
    }

    public String createToken(String username, String roleId) {
        Claims claims = Jwts.claims().setSubject(username);
        claims.put("roleId", "ROLE_" + roleId);

        Date now = new Date();
        Date validity = new Date(now.getTime() + validityInMilliseconds);

        String token = Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        logger.info("Created JWT token for user: {}. Token expiration: {}", username, validity);
        logger.info("Token preview: {}", token.substring(0, Math.min(20, token.length())) + "...");
        return token;
    }

    public Authentication getAuthentication(String token) {
        UserDetails userDetails = this.userDetailsService.loadUserByUsername(getUsername(token));
        String roleId = getRoleId(token);
        List<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(roleId));
        logger.info("Creating Authentication for user: {}. Authorities: {}", userDetails.getUsername(), authorities);
        return new UsernamePasswordAuthenticationToken(userDetails, "", authorities);
    }

    public String getUsername(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody().getSubject();
    }

    public String getRoleId(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody().get("roleId", String.class);
    }

    public String resolveToken(HttpServletRequest req) {
        String bearerToken = req.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            logger.info("Bearer token found in request. Token preview: {}", bearerToken.substring(7, Math.min(27, bearerToken.length())) + "...");
            return bearerToken.substring(7);
        }
        logger.warn("No bearer token found in request. Headers: {}", Collections.list(req.getHeaderNames()));
        return null;
    }

    public boolean validateToken(String token) {
        try {
            logger.info("Validating token: {}", token.substring(0, Math.min(20, token.length())) + "...");
            if (isTokenBlacklisted(token)) {
                logger.warn("Token is blacklisted");
                return false;
            }
            Jws<Claims> claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            Date expiration = claims.getBody().getExpiration();
            logger.info("Token expiration: {}", expiration);
            logger.info("Token claims: {}", claims.getBody());
            if (expiration.before(new Date())) {
                logger.warn("JWT token is expired. Current time: {}", new Date());
                return false;
            }
            logger.info("JWT token validated successfully. Subject: {}", claims.getBody().getSubject());
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            logger.error("Failed to validate token: {}", e.getMessage());
            return false;
        }
    }

    public void invalidateToken(String token) {
        logger.info("Invalidating token: {}", token.substring(0, Math.min(20, token.length())) + "...");
        blacklistedTokens.add(token);
    }

    public boolean isTokenBlacklisted(String token) {
        return blacklistedTokens.contains(token);
    }

    public void checkKey() {
        logger.info("Checking JWT key. Key algorithm: {}", key.getAlgorithm());
        logger.info("JWT secret length: {}", jwtSecret.length());
    }
}