package com.koipond.backend.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;


public class JwtTokenFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenFilter.class);
    private final JwtTokenProvider jwtTokenProvider;

    public JwtTokenFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        logger.info("JwtTokenFilter processing request to '{}' from origin '{}'", request.getRequestURI(), request.getHeader("Origin"));
        logRequestHeaders(request);

        String token = jwtTokenProvider.resolveToken(request);
        logger.info("Resolved token: {}", token != null ? token.substring(0, Math.min(token.length(), 20)) + "..." : "null");

        try {
            if (token != null) {
                if (jwtTokenProvider.isTokenBlacklisted(token)) {
                    logger.warn("Blacklisted token detected");
                    SecurityContextHolder.clearContext();
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token has been invalidated");
                    return;
                }

                boolean isValid = jwtTokenProvider.validateToken(token);
                logger.info("Token validation result: {}", isValid);

                if (isValid) {
                    Authentication auth = jwtTokenProvider.getAuthentication(token);
                    logger.info("Authentication created for user: {}. Authorities: {}", auth.getName(), auth.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(auth);

                    // Log the current authentication after setting it
                    Authentication currentAuth = SecurityContextHolder.getContext().getAuthentication();
                    logger.info("Current Authentication in SecurityContext - Name: {}, Authorities: {}",
                            currentAuth.getName(), currentAuth.getAuthorities());
                } else {
                    logger.warn("Invalid token");
                    SecurityContextHolder.clearContext();
                }
            } else {
                logger.warn("No token found in request");
            }
        } catch (RuntimeException ex) {
            logger.error("Error processing token", ex);
            SecurityContextHolder.clearContext();
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, ex.getMessage());
            return;
        }

        filterChain.doFilter(request, response);

        // Log the final authentication state after the filter chain
        Authentication finalAuth = SecurityContextHolder.getContext().getAuthentication();
        if (finalAuth != null) {
            logger.info("Final Authentication in SecurityContext - Name: {}, Authorities: {}",
                    finalAuth.getName(), finalAuth.getAuthorities());
        } else {
            logger.info("No Authentication in SecurityContext after filter chain");
        }

        logResponseHeaders(response);
    }

    private void logRequestHeaders(HttpServletRequest request) {
        Collections.list(request.getHeaderNames()).forEach(headerName ->
                logger.info("Request Header: {} : {}", headerName, request.getHeader(headerName)));
    }

    private void logResponseHeaders(HttpServletResponse response) {
        response.getHeaderNames().forEach(headerName ->
                logger.info("Response Header: {} : {}", headerName, response.getHeader(headerName)));
    }
}