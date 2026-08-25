package com.familytree.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.familytree.entity.User;

public interface UserRepository
        extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
}