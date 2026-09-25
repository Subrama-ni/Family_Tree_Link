package com.familytree.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.dto.AuthResponse;
import com.dto.LoginRequest;
import com.dto.RegisterRequest;
import com.familytree.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    public AuthController(
            AuthService authService) {

        this.authService = authService;
    }

    // ============================================================
    // REGISTER
    // ============================================================

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @RequestBody RegisterRequest request) {

        String result =
                authService.register(request);

        return ResponseEntity.ok(result);
    }

    // ============================================================
    // LOGIN
    // ============================================================

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request) {

        AuthResponse result =
                authService.login(request);

        return ResponseEntity.ok(result);
    }

    // ============================================================
    // FORGOT PASSWORD
    // ============================================================

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @RequestBody ForgotPasswordRequest request) {

        String result =
                authService.forgotPassword(
                        request.getEmail());

        return ResponseEntity.ok(result);
    }

    // ============================================================
    // RESET PASSWORD
    // ============================================================

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestBody ResetPasswordRequest request) {

        String result =
                authService.resetPassword(
                        request.getToken(),
                        request.getNewPassword());

        return ResponseEntity.ok(result);
    }

    // ============================================================
    // FORGOT PASSWORD REQUEST DTO
    // ============================================================

    public static class ForgotPasswordRequest {

        private String email;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    // ============================================================
    // RESET PASSWORD REQUEST DTO
    // ============================================================

    public static class ResetPasswordRequest {

        private String token;
        private String newPassword;

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(
                String newPassword) {

            this.newPassword = newPassword;
        }
    }
}