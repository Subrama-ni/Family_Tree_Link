package com.familytree.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.dto.LoginRequest;
import com.dto.RegisterRequest;
import com.familytree.entity.User;
import com.familytree.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    public String register(
            RegisterRequest request) {

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

    public String login(
            LoginRequest request) {

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
}