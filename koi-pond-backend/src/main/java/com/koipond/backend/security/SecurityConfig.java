package com.koipond.backend.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.security.authorization.AuthorityAuthorizationManager;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Value("${app.cors.allowed-methods}")
    private String allowedMethods;

    @Value("${app.cors.allowed-headers}")
    private String allowedHeaders;

    @Value("${app.cors.allow-credentials}")
    private boolean allowCredentials;

    private final UserDetailsService userDetailsService;
    private final JwtTokenProvider jwtTokenProvider;
    private final FirebaseAuthenticationFilter firebaseAuthenticationFilter;

    public SecurityConfig(UserDetailsService userDetailsService, JwtTokenProvider jwtTokenProvider, FirebaseAuthenticationFilter firebaseAuthenticationFilter) {
        this.userDetailsService = userDetailsService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.firebaseAuthenticationFilter = firebaseAuthenticationFilter;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(allowedOrigins.split(",")));
        configuration.setAllowedMethods(List.of(allowedMethods.split(",")));
        configuration.setAllowedHeaders(List.of(allowedHeaders.split(",")));
        configuration.setExposedHeaders(List.of("Authorization"));
        
        logger.info("Allowed methods for CORS: {}", allowedMethods);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        logger.info("Configuring SecurityFilterChain");
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .addFilterBefore(new CorsFilter(corsConfigurationSource()), UsernamePasswordAuthenticationFilter.class)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> {
                    authorize
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/logout", "/api/test/**").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        // Đặt các quy tắc cụ thể trước
                        .requestMatchers(HttpMethod.GET, "/api/projects/*/tasks")
                            .access(loggedAuthorizationManager("/api/projects/*/tasks", AuthorityAuthorizationManager.hasAnyAuthority("ROLE_1", "ROLE_4")))
                        .requestMatchers(HttpMethod.GET, "/api/projects/*/project-tasks")
                            .access(loggedAuthorizationManager("/api/projects/*/project-tasks", AuthorityAuthorizationManager.hasAnyAuthority("ROLE_1", "ROLE_4")))
                        .requestMatchers(HttpMethod.PATCH, "/api/tasks/*/status")
                            .access(loggedAuthorizationManager("/api/tasks/*/status", AuthorityAuthorizationManager.hasAuthority("ROLE_4")))
                        .requestMatchers(HttpMethod.GET, "/api/tasks/project/*")
                            .access(loggedAuthorizationManager("/api/tasks/project/*", AuthorityAuthorizationManager.hasAnyAuthority("ROLE_1", "ROLE_4")))
                        // Sau đó là các quy tắc tổng quát
                        .requestMatchers(HttpMethod.POST, "/api/projects/**").hasAuthority("ROLE_2")
                        .requestMatchers(HttpMethod.GET, "/api/projects/**").hasAnyAuthority("ROLE_1", "ROLE_2")
                        .requestMatchers("/api/manager/**").hasAuthority("ROLE_1")
                        .requestMatchers("/api/consultation-requests/**").hasAuthority("ROLE_5")
                        // Cấu hình cho Design
                        .requestMatchers(HttpMethod.POST, "/api/pond-designs").hasAuthority("ROLE_3")
                        .requestMatchers(HttpMethod.GET, "/api/pond-designs/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/pond-designs/designer").hasAuthority("ROLE_3")
                        .requestMatchers(HttpMethod.GET, "/api/pond-designs/pending").hasAuthority("ROLE_1")
                        .requestMatchers(HttpMethod.GET, "/api/pond-designs/approved").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/pond-designs/**").hasAuthority("ROLE_3")
                        .requestMatchers(HttpMethod.PATCH, "/api/pond-designs/*/approve").hasAuthority("ROLE_1")
                        .requestMatchers(HttpMethod.PATCH, "/api/pond-designs/*/reject").hasAuthority("ROLE_1")
                        .requestMatchers(HttpMethod.DELETE, "/api/pond-designs/**").hasAuthority("ROLE_3")
                        // Cấu hình cho BlogController
                        .requestMatchers(HttpMethod.POST, "/api/blog/drafts").hasAnyAuthority("ROLE_3", "ROLE_1")
                        .requestMatchers(HttpMethod.PUT, "/api/blog/drafts/**").hasAnyAuthority("ROLE_3", "ROLE_1")
                        .requestMatchers(HttpMethod.POST, "/api/blog/drafts/*/submit").hasAnyAuthority("ROLE_3", "ROLE_1")
                        .requestMatchers(HttpMethod.POST, "/api/blog/posts/*/approve").hasAuthority("ROLE_1")
                        .requestMatchers(HttpMethod.POST, "/api/blog/posts/*/reject").hasAuthority("ROLE_1")
                        .requestMatchers(HttpMethod.GET, "/api/blog/posts/approved").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/blog/posts/{id}").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/blog/drafts/**").hasAuthority("ROLE_3")
                        .requestMatchers(HttpMethod.DELETE, "/api/blog/posts/**").hasAuthority("ROLE_1")
                        // Cấu hình cho ProjectController
                        .requestMatchers(HttpMethod.GET, "/api/projects").hasAuthority("ROLE_1")
                        .requestMatchers(HttpMethod.GET, "/api/projects/consultant").hasAuthority("ROLE_2")
                        .requestMatchers(HttpMethod.POST, "/api/projects").hasAuthority("ROLE_2")
                        .requestMatchers(HttpMethod.PUT, "/api/projects/**").hasAuthority("ROLE_2")
                        .requestMatchers(HttpMethod.PATCH, "/api/projects/*/status").hasAnyAuthority("ROLE_1", "ROLE_2")
                        .requestMatchers(HttpMethod.PATCH, "/api/projects/*/cancel").hasAnyAuthority("ROLE_1", "ROLE_2")
                        // Thêm cấu hình mới cho gán và quản lý nhân viên xây dựng
                        .requestMatchers(HttpMethod.PATCH, "/api/projects/*/assign-constructor").hasAuthority("ROLE_1")
                        .requestMatchers(HttpMethod.PATCH, "/api/projects/*/complete").hasAuthority("ROLE_1")
                        .requestMatchers(HttpMethod.GET, "/api/projects/*/tasks").hasAnyAuthority("ROLE_1", "ROLE_4")
                        .requestMatchers(HttpMethod.PATCH, "/api/tasks/*/status").hasAuthority("ROLE_4")
                        .requestMatchers(HttpMethod.GET, "/api/projects/*/project-tasks").hasAnyAuthority("ROLE_1", "ROLE_4")
                        .requestMatchers(HttpMethod.GET, "/api/tasks/project/*").hasAnyAuthority("ROLE_1", "ROLE_4")
                        // Thêm cấu hình mới cho ConsultationRequest
                        .requestMatchers(HttpMethod.PUT, "/api/ConsultationRequests/*/status").hasAuthority("ROLE_2")
                        .requestMatchers(HttpMethod.POST, "/api/ConsultationRequests").hasAuthority("ROLE_5")
                        .requestMatchers(HttpMethod.GET, "/api/ConsultationRequests").hasAnyAuthority("ROLE_2", "ROLE_5")
                        .requestMatchers(HttpMethod.GET, "/api/ConsultationRequests/**").hasAnyAuthority("ROLE_2", "ROLE_5")
                        .requestMatchers(HttpMethod.PUT, "/api/ConsultationRequests/**").hasAuthority("ROLE_5")
                        .requestMatchers(HttpMethod.DELETE, "/api/ConsultationRequests/**").hasAuthority("ROLE_5")
                        .anyRequest().authenticated();
                    
                    logger.info("Authorization rules configured");
                })
                .userDetailsService(userDetailsService)
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            logAuthenticationError(request, authException, "Unauthorized");
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            logAuthenticationError(request, accessDeniedException, "Access denied");
                            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied");
                        })
                )
                .addFilterBefore(new JwtTokenFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(firebaseAuthenticationFilter, JwtTokenFilter.class);

        logger.info("SecurityFilterChain configuration completed");
        return http.build();
    }

    private AuthorizationManager<RequestAuthorizationContext> loggedAuthorizationManager(String pattern, AuthorizationManager<RequestAuthorizationContext> delegate) {
        return (authentication, context) -> {
            AuthorizationDecision decision = delegate.check(authentication, context);
            boolean isGranted = decision != null && decision.isGranted();
            logger.info("Authorization decision for {} : {}", pattern, isGranted ? "GRANTED" : "DENIED");
            return new AuthorizationDecision(isGranted);
        };
    }

    private void logAuthenticationError(HttpServletRequest request, Exception exception, String errorType) {
        logger.error("{} error: {}", errorType, exception.getMessage());
        logger.error("Request URL: {}", request.getRequestURL());
        logger.error("User principal: {}", request.getUserPrincipal());
    }
}
