package com.familytree.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.familytree.entity.Family;
import com.familytree.entity.FamilyInvitation;

public interface FamilyInvitationRepository
        extends JpaRepository<FamilyInvitation, Long> {

    Optional<FamilyInvitation> findByToken(
            String token
    );

    Optional<FamilyInvitation>
    findByInvitedEmailAndFamilyAndStatus(
            String invitedEmail,
            Family family,
            String status
    );

    List<FamilyInvitation>
    findByFamilyOrderByCreatedAtDesc(
            Family family
    );
}