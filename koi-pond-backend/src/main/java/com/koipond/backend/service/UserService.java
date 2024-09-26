package com.koipond.backend.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private FirebaseAuth firebaseAuth;

    public String generateToken(UserRecord userRecord) throws FirebaseAuthException {
        return firebaseAuth.createCustomToken(userRecord.getUid());
    }

    public String authenticateUser(String email, String password) throws FirebaseAuthException {
        // Implement proper authentication logic here
        // This is just a placeholder and is not secure
        UserRecord userRecord = firebaseAuth.getUserByEmail(email);
        // You should use Firebase Admin SDK to verify the password
        // or implement your own secure password verification method
        return firebaseAuth.createCustomToken(userRecord.getUid());
    }
}