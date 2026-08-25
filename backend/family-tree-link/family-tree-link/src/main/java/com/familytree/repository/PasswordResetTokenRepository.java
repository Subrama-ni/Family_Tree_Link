package com.familytree.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.familytree.entity.PasswordResetToken;

public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);
}