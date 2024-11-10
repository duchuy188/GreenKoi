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
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
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
                        // Public endpoints
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                            "/api/auth/register", 
                            "/api/auth/login", 
                            "/api/auth/logout",
                            "/api/auth/google",  // Thêm endpoint Google login
                            "/api/test/**"
                        ).permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/blog/posts/approved").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/blog/posts/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/pond-designs/approved").permitAll()
                        .requestMatchers("/api/payments/vnpay-return").permitAll()
                        .requestMatchers("/api/payments/verify-payment").permitAll()
                        .requestMatchers("/api/maintenance-requests/verify-vnpay").permitAll()
                        // Specific endpoints
                        .requestMatchers(HttpMethod.PUT, "/api/ConsultationRequests/*/status").hasAuthority("ROLE_2")
                        .requestMatchers(HttpMethod.GET, "/api/projects/customer").access(loggedAuthorizationManager("/api/projects/customer", AuthorityAuthorizationManager.hasAuthority("ROLE_5")))
                        .requestMatchers(HttpMethod.GET, "/api/projects/customer/**").access(loggedAuthorizationManager("/api/projects/customer/**", AuthorityAuthorizationManager.hasAuthority("ROLE_5")))
                        .requestMatchers(HttpMethod.POST, "/api/ConsultationRequests").hasAuthority("ROLE_5")
                        .requestMatchers(HttpMethod.PUT, "/api/ConsultationRequests/**").hasAuthority("ROLE_5")
                        .requestMatchers(HttpMethod.DELETE, "/api/ConsultationRequests/**").hasAuthority("ROLE_5")

                        // Manager endpoints (ROLE_1)
                        .requestMatchers("/api/manager/**").hasAuthority("ROLE_1")
                        .requestMatchers(HttpMethod.GET, "/api/projects").hasAuthority("ROLE_1")
                        .requestMatchers(HttpMethod.PATCH, "/api/projects/*/assign-constructor").hasAuthority("ROLE_1")
                        .requestMatchers(HttpMethod.PATCH, "/api/projects/*/complete").hasAuthority("ROLE_1")
                        .requestMatchers(HttpMethod.GET, "/api/pond-designs/pending").hasAuthority("ROLE_1")
                        .requestMatchers(HttpMethod.PATCH, "/api/pond-designs/*/approve").hasAuthority("ROLE_1")
                        .requestMatchers(HttpMethod.PATCH, "/api/pond-designs/*/reject").hasAuthority("ROLE_1")

                        // Consultant endpoints (ROLE_2)
                        .requestMatchers(HttpMethod.GET, "/api/projects/consultant").hasAuthority("ROLE_2")
                        .requestMatchers(HttpMethod.POST, "/api/projects").hasAuthority("ROLE_2")
                        .requestMatchers(HttpMethod.PUT, "/api/projects/**").hasAuthority("ROLE_2")
                        .requestMatchers(HttpMethod.PATCH, "/api/projects/*/payment-status").hasAuthority("ROLE_2")
                        .requestMatchers(HttpMethod.PATCH, "/api/projects/*/status").hasAnyAuthority("ROLE_1", "ROLE_2")

                        // Designer endpoints (ROLE_3)
                        .requestMatchers(HttpMethod.POST, "/api/pond-designs").hasAuthority("ROLE_3")
                        .requestMatchers(HttpMethod.GET, "/api/pond-designs/designer").hasAuthority("ROLE_3")
                        .requestMatchers(HttpMethod.PUT, "/api/pond-designs/{id}/suggest-public").hasAuthority("ROLE_1")
                        .requestMatchers(HttpMethod.PUT, "/api/pond-designs/*/approve-public").hasAuthority("ROLE_5")
                        .requestMatchers(HttpMethod.PUT, "/api/pond-designs/*/publish").hasAuthority("ROLE_1")
                        .requestMatchers(HttpMethod.PUT, "/api/pond-designs/**").hasAuthority("ROLE_3")
                        .requestMatchers(HttpMethod.DELETE, "/api/pond-designs/**").hasAuthority("ROLE_3")

                        // Constructor endpoints (ROLE_4)
                        .requestMatchers(HttpMethod.PATCH, "/api/tasks/*/status").hasAuthority("ROLE_4")
                        .requestMatchers(HttpMethod.GET, "/api/projects/constructor").hasAuthority("ROLE_4")
                        .requestMatchers(HttpMethod.PATCH, "/api/projects/*/mark-technically-completed").hasAuthority("ROLE_4")

                        // Shared endpoints
                        .requestMatchers(HttpMethod.GET, "/api/projects/*/tasks").hasAnyAuthority("ROLE_1", "ROLE_4")
                        .requestMatchers(HttpMethod.GET, "/api/projects/*/project-tasks").hasAnyAuthority("ROLE_1", "ROLE_4")
                        .requestMatchers(HttpMethod.GET, "/api/tasks/project/*").hasAnyAuthority("ROLE_1", "ROLE_4")
                        .requestMatchers(HttpMethod.PATCH, "/api/projects/*/status").hasAnyAuthority("ROLE_1", "ROLE_2")
                        .requestMatchers(HttpMethod.PATCH, "/api/projects/*/cancel").hasAnyAuthority("ROLE_1", "ROLE_2")
                        .requestMatchers(HttpMethod.GET, "/api/ConsultationRequests").hasAnyAuthority("ROLE_2", "ROLE_5")
                        .requestMatchers(HttpMethod.GET, "/api/ConsultationRequests/**").hasAnyAuthority("ROLE_2", "ROLE_5")

                        // Blog endpoints
                        .requestMatchers(HttpMethod.GET, "/api/blog/drafts").hasAnyAuthority("ROLE_3", "ROLE_1")
                        .requestMatchers(HttpMethod.GET, "/api/blog/drafts/{id}").hasAnyAuthority("ROLE_3", "ROLE_1")
                        .requestMatchers(HttpMethod.GET, "/api/blog/posts/pending").hasAuthority("ROLE_1")
                        .requestMatchers(HttpMethod.GET, "/api/blog/posts/my").hasAnyAuthority("ROLE_3", "ROLE_1")
                        .requestMatchers(HttpMethod.GET, "/api/blog/posts/approved/all").hasAuthority("ROLE_1")
                        .requestMatchers(HttpMethod.POST, "/api/blog/posts/*/restore").hasAuthority("ROLE_1")
                        .requestMatchers(HttpMethod.POST, "/api/blog/drafts").hasAnyAuthority("ROLE_3", "ROLE_1")
                        .requestMatchers(HttpMethod.PUT, "/api/blog/drafts/**").hasAnyAuthority("ROLE_3", "ROLE_1")
                        .requestMatchers(HttpMethod.POST, "/api/blog/drafts/*/submit").hasAnyAuthority("ROLE_3", "ROLE_1")
                        .requestMatchers(HttpMethod.POST, "/api/blog/posts/*/approve").hasAuthority("ROLE_1")
                        .requestMatchers(HttpMethod.POST, "/api/blog/posts/*/reject").hasAuthority("ROLE_1")
                        .requestMatchers(HttpMethod.DELETE, "/api/blog/drafts/**").hasAuthority("ROLE_3")
                        .requestMatchers(HttpMethod.DELETE, "/api/blog/posts/**").hasAuthority("ROLE_1")

                        // Maintenance Request endpoints
                        .requestMatchers(HttpMethod.POST, "/api/maintenance-requests").hasAuthority("ROLE_5")
                        .requestMatchers(HttpMethod.GET, "/api/maintenance-requests/customer/*").hasAuthority("ROLE_5")
                        // Add this new rule for updating pending maintenance requests
                        .requestMatchers(HttpMethod.PUT, "/api/maintenance-requests/**").hasAuthority("ROLE_5")
                        .requestMatchers(HttpMethod.GET, "/api/maintenance-requests/pending").hasAuthority("ROLE_2")
                        .requestMatchers(HttpMethod.PATCH, "/api/maintenance-requests/*/review").hasAuthority("ROLE_2")
                        .requestMatchers(HttpMethod.PATCH, "/api/maintenance-requests/*/confirm").hasAuthority("ROLE_2")
                        .requestMatchers(HttpMethod.GET, "/api/maintenance-requests/confirmed").hasAnyAuthority("ROLE_1", "ROLE_2")
                        .requestMatchers(HttpMethod.PATCH, "/api/maintenance-requests/*/assign").hasAuthority("ROLE_1")
                        .requestMatchers(HttpMethod.GET, "/api/maintenance-requests/assigned-to-me").hasAuthority("ROLE_4")
                        .requestMatchers(HttpMethod.PATCH, "/api/maintenance-requests/*/schedule").hasAuthority("ROLE_4")
                        .requestMatchers(HttpMethod.PATCH, "/api/maintenance-requests/*/start").hasAuthority("ROLE_4")
                        .requestMatchers(HttpMethod.PATCH, "/api/maintenance-requests/*/complete").hasAuthority("ROLE_4")
                        .requestMatchers(HttpMethod.GET, "/api/maintenance-requests/cancelled").hasAnyAuthority("ROLE_1", "ROLE_2", "ROLE_5")
                        .requestMatchers(HttpMethod.POST, "/api/maintenance-requests/*/review").hasAuthority("ROLE_5")
                        .requestMatchers(HttpMethod.GET, "/api/maintenance-requests/*/review").hasAnyAuthority("ROLE_1", "ROLE_2", "ROLE_4", "ROLE_5")
                        .requestMatchers(HttpMethod.GET, "/api/maintenance-requests/completed-unpaid").hasAuthority("ROLE_2")

                        // Project review endpoints
                        .requestMatchers(HttpMethod.POST, "/api/projects/*/reviews").hasAnyAuthority("ROLE_1", "ROLE_2", "ROLE_4", "ROLE_5")
                        .requestMatchers(HttpMethod.GET, "/api/projects/*/reviews").hasAnyAuthority("ROLE_1", "ROLE_2", "ROLE_4", "ROLE_5")

                        // Dashboard endpoints
                        .requestMatchers("/api/dashboard/**").hasAuthority("ROLE_1")

                        // New rule for reviewing maintenance requests
                        .requestMatchers(HttpMethod.GET, "/api/maintenance-requests/reviewing").hasAuthority("ROLE_2")

                        // New rule for completed maintenance requests
                        .requestMatchers(HttpMethod.GET, "/api/maintenance-requests/completed").hasAnyAuthority("ROLE_1", "ROLE_4")

                        // VNPay callback endpoint must be public
                        .requestMatchers("/api/maintenance-requests/vnpay-callback").permitAll()

                        // Cash payment endpoints (for consultants)
                        .requestMatchers(HttpMethod.POST, "/api/maintenance-requests/*/deposit/cash").hasAuthority("ROLE_2")
                        .requestMatchers(HttpMethod.POST, "/api/maintenance-requests/*/final/cash").hasAuthority("ROLE_2")

                        // VNPay payment endpoints (for customers)
                        .requestMatchers(HttpMethod.POST, "/api/maintenance-requests/*/deposit/vnpay").hasAuthority("ROLE_5")
                        .requestMatchers(HttpMethod.POST, "/api/maintenance-requests/*/final/vnpay").hasAuthority("ROLE_5")

                        // Design Request endpoints
                        .requestMatchers(HttpMethod.POST, "/api/design-requests/*/design")
                            .hasAuthority("ROLE_3")  // Chỉ Designer được tạo design mới
                        
                        .requestMatchers(HttpMethod.GET, "/api/design-requests/*/current-design")
                            .hasAuthority("ROLE_3")  // Chỉ Designer được xem current design

                        .requestMatchers(HttpMethod.GET, "/api/design-requests/designer")
                            .hasAuthority("ROLE_3")  // Chỉ Designer xem danh sách của mình
                        
                        .requestMatchers(HttpMethod.GET, "/api/design-requests/customer")
                            .hasAuthority("ROLE_5")  // Chỉ Customer xem danh sách của mình
                        
                        .requestMatchers(HttpMethod.PUT, "/api/design-requests/*/link-design/**")
                            .hasAuthority("ROLE_3")  // Chỉ Designer đư���c liên kết design
                        
                        .requestMatchers(HttpMethod.PUT, "/api/design-requests/**")
                            .hasAnyAuthority("ROLE_3", "ROLE_2", "ROLE_1")  // Designer, Staff và Admin có thể cập nhật

                        // Thêm vào phần Design Request endpoints
                        .requestMatchers(HttpMethod.POST, "/api/design-requests/*/submit-review")
                            .hasAuthority("ROLE_3")  // Chỉ Designer được submit review

                        .requestMatchers(HttpMethod.POST, "/api/design-requests/*/consultant-review")
                            .hasAuthority("ROLE_2")  // Chỉ Consultant được review

                        .requestMatchers(HttpMethod.POST, "/api/design-requests/*/customer-approval")
                            .hasAuthority("ROLE_5")  // Chỉ Customer được approval

                        // Thêm rules mới cho quy trình công khai thiết kế
                        .requestMatchers(HttpMethod.PUT, "/api/pond-designs/{id}/suggest-public")
                            .hasAuthority("ROLE_1")

                        .requestMatchers(HttpMethod.PUT, "/api/pond-designs/*/approve-public")
                            .hasAuthority("ROLE_5")  // Chỉ Customer được approve công khai

                        .requestMatchers(HttpMethod.PUT, "/api/pond-designs/*/publish")
                            .hasAuthority("ROLE_1")  // Chỉ Manager được publish

                        .requestMatchers(HttpMethod.GET, "/api/pond-designs/public")
                            .permitAll()  // Ai cũng xem được thiết kế public

                        // Thêm rule mới cho việc xem danh sách chờ review
                        .requestMatchers(HttpMethod.GET, "/api/design-requests/pending-review")
                            .hasAuthority("ROLE_2")  // Chỉ Consultant được xem danh sách chờ review

                        // Design Request endpoints
                        .requestMatchers(HttpMethod.GET, "/api/design-requests/pending-assignment")
                            .hasAuthority("ROLE_1")  // Chỉ Manager được xem danh sách chờ phân công

                        // Project status endpoints
                        .requestMatchers(HttpMethod.PATCH, "/api/projects/*/status")
                            .hasAnyAuthority("ROLE_1", "ROLE_2")
                        .requestMatchers(HttpMethod.PATCH, "/api/projects/*/cancel")
                            .hasAnyAuthority("ROLE_1", "ROLE_2")
                        .requestMatchers(HttpMethod.PATCH, "/api/projects/*/complete")
                            .hasAuthority("ROLE_1")
                        .requestMatchers(HttpMethod.PATCH, "/api/projects/*/mark-technically-completed")
                            .hasAuthority("ROLE_4")

                        // Catch-all rule
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
