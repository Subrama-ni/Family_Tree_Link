package com.familytree.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dto.LoginRequest;
import com.dto.RegisterRequest;
import com.familytree.entity.PasswordResetToken;
import com.familytree.entity.User;
import com.familytree.repository.PasswordResetTokenRepository;
import com.familytree.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AuthService(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {

        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    // ============================================================
    // REGISTER
    // ============================================================

    public String register(RegisterRequest request) {

        if (userRepository.findByEmail(
                request.getEmail()).isPresent()) {

            return "Email already registered";
        }

        User user = new User();

        user.setFullName(
                request.getFullName());

        user.setEmail(
                request.getEmail());

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()));

        userRepository.save(user);

        return "User registered successfully";
    }

    // ============================================================
    // LOGIN
    // ============================================================

    public String login(LoginRequest request) {

        User user =
                userRepository.findByEmail(
                        request.getEmail())
                        .orElse(null);

        if (user == null) {
            return "User not found";
        }

        boolean passwordMatches =
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword());

        if (!passwordMatches) {
            return "Invalid password";
        }

        return "Login successful";
    }

    // ============================================================
    // FORGOT PASSWORD
    // ============================================================

    @Transactional
    public String forgotPassword(
            String email) {

        User user =
                userRepository.findByEmail(email)
                        .orElse(null);

        /*
         * Do not reveal whether an email exists.
         * This prevents account enumeration.
         */
        if (user == null) {

            return "If the email is registered, "
                    + "a password reset link has been sent.";
        }

        /*
         * Remove previous unused tokens.
         */
        tokenRepository
                .findAll()
                .stream()
                .filter(token ->
                        token.getUser()
                                .getId()
                                .equals(user.getId())
                                && !token.isUsed())
                .forEach(token ->
                        tokenRepository.delete(token));

        /*
         * Generate secure random token.
         */
        String tokenValue =
                UUID.randomUUID().toString();

        PasswordResetToken resetToken =
                new PasswordResetToken();

        resetToken.setToken(tokenValue);

        resetToken.setUser(user);

        resetToken.setExpiryDate(
                LocalDateTime.now()
                        .plusMinutes(15));

        resetToken.setUsed(false);

        tokenRepository.save(resetToken);

        emailService.sendPasswordResetEmail(
                user.getEmail(),
                tokenValue);

        return "If the email is registered, "
                + "a password reset link has been sent.";
    }

    // ============================================================
    // RESET PASSWORD
    // ============================================================

    @Transactional
    public String resetPassword(
            String token,
            String newPassword) {

        PasswordResetToken resetToken =
                tokenRepository
                        .findByToken(token)
                        .orElse(null);

        if (resetToken == null) {

            return "Invalid password reset link";
        }

        if (resetToken.isUsed()) {

            return "This password reset link has already been used";
        }

        if (resetToken.getExpiryDate()
                .isBefore(LocalDateTime.now())) {

            return "This password reset link has expired";
        }

        User user =
                resetToken.getUser();

        user.setPassword(
                passwordEncoder.encode(
                        newPassword));

        userRepository.save(user);

        resetToken.setUsed(true);

        tokenRepository.save(resetToken);

        return "Password reset successfully";
    }
}