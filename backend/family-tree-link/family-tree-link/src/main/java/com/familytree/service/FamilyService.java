package com.familytree.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.familytree.dto.FamilyResponse;
import com.familytree.entity.Family;
import com.familytree.entity.User;
import com.familytree.repository.UserRepository;

@Service
public class FamilyService {

    private final UserRepository userRepository;

    public FamilyService(
            UserRepository userRepository) {

        this.userRepository =
                userRepository;
    }

    /*
     * ============================================================
     * GET CURRENT USER
     * ============================================================
     */

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null) {

            throw new AccessDeniedException(
                    "User is not authenticated"
            );
        }

        return userRepository
                .findByEmail(
                        authentication.getName()
                )
                .orElseThrow(
                        () -> new AccessDeniedException(
                                "Authenticated user not found"
                        )
                );
    }

    /*
     * ============================================================
     * GET CURRENT FAMILY
     * ============================================================
     */

    public FamilyResponse getCurrentFamily() {

        User user =
                getCurrentUser();

        Family family =
                user.getFamily();

        if (family == null) {

            throw new AccessDeniedException(
                    "User is not associated with a family"
            );
        }

        return new FamilyResponse(
                family.getId(),
                family.getName(),
                family.getDescription()
        );
    }
}