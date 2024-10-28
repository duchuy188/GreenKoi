package com.koipond.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class VNPayConfig {
    private static final Logger log = LoggerFactory.getLogger(VNPayConfig.class);

    @Value("${vnpay.vnp-pay-url}")
    private String vnpPayUrl;

    @Value("${vnpay.vnp-return-url}")
    private String vnpReturnUrl;

    @Value("${vnpay.vnp-tmn-code}")
    private String vnpTmnCode;

    @Value("${vnpay.vnp-hash-secret}")
    private String vnpHashSecret;

    @PostConstruct
    public void init() {
        log.info("Initializing VNPay Configuration");
        validateConfiguration();
    }

    private void validateConfiguration() {
        if (vnpPayUrl == null || vnpPayUrl.trim().isEmpty()) {
            throw new IllegalStateException("VNPay payment URL is not configured");
        }
        if (vnpReturnUrl == null || vnpReturnUrl.trim().isEmpty()) {
            throw new IllegalStateException("VNPay return URL is not configured");
        }
        if (vnpTmnCode == null || vnpTmnCode.trim().isEmpty()) {
            throw new IllegalStateException("VNPay TMN Code is not configured");
        }
        if (vnpHashSecret == null || vnpHashSecret.trim().isEmpty()) {
            throw new IllegalStateException("VNPay Hash Secret is not configured");
        }
        
        log.info("VNPay Configuration loaded successfully");
        log.debug("Payment URL: {}", vnpPayUrl);
        log.debug("Return URL: {}", vnpReturnUrl);
        log.debug("TMN Code: {}", vnpTmnCode);
    }

    // Getters with null checks and trimming
    public String getVnpPayUrl() {
        return vnpPayUrl != null ? vnpPayUrl.trim() : "";
    }

    public String getVnpReturnUrl() {
        return vnpReturnUrl != null ? vnpReturnUrl.trim() : "";
    }

    public String getVnpTmnCode() {
        return vnpTmnCode != null ? vnpTmnCode.trim() : "";
    }

    public String getVnpHashSecret() {
        return vnpHashSecret != null ? vnpHashSecret.trim() : "";
    }
}
