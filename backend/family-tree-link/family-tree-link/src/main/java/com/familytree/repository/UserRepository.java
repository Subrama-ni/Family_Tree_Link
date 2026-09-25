package com.familytree.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.familytree.entity.User;

public interface UserRepository
        extends JpaRepository<User, Long> {

    Optional<User> findByEmail(
            String email
    );

    /*
     * ============================================================
     * FIND ALL USERS BELONGING TO A FAMILY
     * ============================================================
     *
     * User.family -> Family.id
     */

    List<User> findByFamily_Id(
            Long familyId
    );
}