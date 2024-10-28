package com.koipond.backend.service;

import com.koipond.backend.config.VNPayConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import jakarta.servlet.http.HttpServletRequest;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class VNPayService {

    private static final Logger log = LoggerFactory.getLogger(VNPayService.class);

    private final VNPayConfig vnPayConfig;

    @Autowired
    public VNPayService(VNPayConfig vnPayConfig) {
        this.vnPayConfig = vnPayConfig;
    }

    public String createPaymentUrl(String orderId, long amount, String paymentType, HttpServletRequest request) {
        try {
            String vnp_IpAddr = getIpAddress(request);
            String vnp_TmnCode = vnPayConfig.getVnpTmnCode();

            // Tạo unique vnp_TxnRef bằng cách thêm timestamp và paymentType
            String timestamp = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
            String vnp_TxnRef = orderId + "_" + timestamp;

            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", "2.1.0");
            vnp_Params.put("vnp_Command", "pay");
            vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
            vnp_Params.put("vnp_Amount", String.valueOf(amount)); // Đã nhân 100 từ service gọi
            vnp_Params.put("vnp_CurrCode", "VND");
            vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
            
            // Sửa switch statement thành enhanced switch
            String orderInfo = switch (paymentType) {
                case "PROJECT_DEPOSIT", "PROJECT_FINAL" -> 
                    "Thanh toan project: " + orderId;
                case "MAINTENANCE_DEPOSIT" -> 
                    "Thanh toan dat coc bao tri: " + orderId;
                case "MAINTENANCE_FINAL" -> 
                    "Thanh toan nốt bao tri: " + orderId;
                default -> 
                    "Thanh toan: " + orderId;
            };
            vnp_Params.put("vnp_OrderInfo", orderInfo);
            
            // Thêm log để debug
            log.info("Creating payment URL - OrderId: {}, Amount: {}, PaymentType: {}, OrderInfo: {}", 
                orderId, amount, paymentType, orderInfo);
            
            vnp_Params.put("vnp_OrderType", paymentType); // Sử dụng paymentType
            vnp_Params.put("vnp_Locale", "vn");
            vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getVnpReturnUrl());
            vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnp_CreateDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

            cld.add(Calendar.MINUTE, 15);
            String vnp_ExpireDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

            List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = vnp_Params.get(fieldName);
                if ((fieldValue != null) && !fieldValue.isEmpty()) {
                    // Build hashData
                    hashData.append(fieldName)
                           .append('=')
                           .append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));

                    // Build query
                    query.append(fieldName)
                         .append('=')
                         .append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));

                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }
            String queryUrl = query.toString();
            String vnp_SecureHash = hmacSHA512(vnPayConfig.getVnpHashSecret(), hashData.toString());
            queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
            String paymentUrl = vnPayConfig.getVnpPayUrl() + "?" + queryUrl;
            log.info("Generated VNPay URL: {}", paymentUrl);
            return paymentUrl;
        } catch (Exception e) {
            log.error("Error creating payment URL", e);
            throw new RuntimeException("Error creating payment URL", e);
        }
    }

    private String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new IllegalArgumentException("Key and data cannot be null");
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Error generating HMAC-SHA512", e);
            throw new RuntimeException("Error generating HMAC-SHA512", e);
        }
    }

    private String getIpAddress(HttpServletRequest request) {
        String ipAddress;
        try {
            ipAddress = request.getHeader("X-FORWARDED-FOR");
            if (ipAddress == null) {
                ipAddress = request.getRemoteAddr();
            }
        } catch (Exception e) {
            ipAddress = "Invalid IP:" + e.getMessage();
        }
        return ipAddress;
    }
}
