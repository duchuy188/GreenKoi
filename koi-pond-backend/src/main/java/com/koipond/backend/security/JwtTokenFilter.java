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

public class JwtTokenFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenFilter.class);
    private final JwtTokenProvider jwtTokenProvider;

    public JwtTokenFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        logger.info("JwtTokenFilter processing request to '{}'", request.getRequestURI());
        String token = jwtTokenProvider.resolveToken(request);
        logger.info("Resolved token: {}", token != null ? token.substring(0, Math.min(token.length(), 20)) + "..." : "null");

        try {
            if (token != null) {
                boolean isValid = jwtTokenProvider.validateToken(token);
                logger.info("Token validation result: {}", isValid);

                if (isValid) {
                    Authentication auth = jwtTokenProvider.getAuthentication(token);
                    logger.info("Authentication created for user: {}", auth.getName());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } else {
                    logger.warn("Invalid token");
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
    }
}