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
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.Base64;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.validity-duration}")
    private long validityInMilliseconds;

    private Key key;

    private final UserDetailsService userDetailsService;

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

    public String createToken(String username) {
        Claims claims = Jwts.claims().setSubject(username);

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
        return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
    }

    public String getUsername(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody().getSubject();
    }

    public String resolveToken(HttpServletRequest req) {
        String bearerToken = req.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            logger.info("Bearer token found in request");
            return bearerToken.substring(7);
        }
        logger.warn("No bearer token found in request");
        return null;
    }

    public boolean validateToken(String token) {
        try {
            logger.info("Validating token: {}", token.substring(0, Math.min(20, token.length())) + "...");
            Jws<Claims> claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            Date expiration = claims.getBody().getExpiration();
            logger.info("Token expiration: {}", expiration);
            if (expiration.before(new Date())) {
                logger.warn("JWT token is expired. Current time: {}", new Date());
                return false;
            }
            logger.info("JWT token validated successfully. Subject: {}", claims.getBody().getSubject());
            return true;
        } catch (Exception e) {
            logger.error("Error validating token", e);
            return false;
        }
    }

    // TODO: Consider removing this method if it's not used
    public void checkKey() {
        logger.info("Checking JWT key. Key algorithm: {}", key.getAlgorithm());
        logger.info("JWT secret length: {}", jwtSecret.length());
    }
}