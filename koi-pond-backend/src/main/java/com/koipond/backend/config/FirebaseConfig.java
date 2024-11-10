package com.koipond.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;

@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);
    private static final String FIREBASE_CONFIG_PATH = "koi-pond-737e8-firebase-adminsdk-fdhs2-a910406ccd.json";

    @Bean
    public FirebaseApp firebaseApp() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                log.info("Initializing Firebase application...");
                ClassPathResource serviceAccount = new ClassPathResource(FIREBASE_CONFIG_PATH);

                if (!serviceAccount.exists()) {
                    log.error("Firebase configuration file not found: {}", FIREBASE_CONFIG_PATH);
                    throw new IOException("Firebase configuration file not found");
                }

                FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount.getInputStream()))
                    .build();

                FirebaseApp app = FirebaseApp.initializeApp(options);
                log.info("Firebase application initialized successfully");
                return app;
            }

            log.info("Using existing Firebase application instance");
            return FirebaseApp.getInstance();

        } catch (IOException e) {
            log.error("Failed to initialize Firebase application", e);
            throw new RuntimeException("Could not initialize Firebase", e);
        }
    }

    @Bean
    public FirebaseAuth firebaseAuth(FirebaseApp firebaseApp) {
        log.info("Initializing Firebase Auth...");
        return FirebaseAuth.getInstance(firebaseApp);
    }
}
