package com.koipond.backend.exception;

public class InvalidBlogPostStateException extends RuntimeException {
    public InvalidBlogPostStateException(String message) {
        super(message);
    }
}