package com.familytree.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.familytree.entity.Family;
import com.familytree.entity.FamilyMember;
import com.familytree.entity.Relationship;
import com.familytree.entity.User;
import com.familytree.repository.FamilyMemberRepository;
import com.familytree.repository.RelationshipRepository;
import com.familytree.repository.UserRepository;

@Service
public class RelationshipService {

    private final RelationshipRepository repository;

    private final FamilyMemberRepository familyMemberRepository;

    private final UserRepository userRepository;

    public RelationshipService(
            RelationshipRepository repository,
            FamilyMemberRepository familyMemberRepository,
            UserRepository userRepository) {

        this.repository = repository;

        this.familyMemberRepository =
                familyMemberRepository;

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
                .findByEmail(authentication.getName())
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

    private Family getCurrentFamily() {

        User user = getCurrentUser();

        if (user.getFamily() == null) {

            throw new AccessDeniedException(
                    "User is not associated with a family"
            );
        }

        return user.getFamily();
    }

    /*
     * ============================================================
     * GET AUTHORIZED MEMBER
     * ============================================================
     */

    private FamilyMember getAuthorizedMember(
            Long memberId) {

        Family currentFamily =
                getCurrentFamily();

        FamilyMember member =
                familyMemberRepository
                        .findById(memberId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Family member not found"
                                )
                        );

        if (member.getFamily() == null
                || !member.getFamily()
                        .getId()
                        .equals(currentFamily.getId())) {

            throw new AccessDeniedException(
                    "Member does not belong to your family"
            );
        }

        return member;
    }

    /*
     * ============================================================
     * ADD RELATIONSHIP
     * ============================================================
     */

    public Relationship addRelationship(
            Relationship relationship) {

        /*
         * Never trust the family information
         * coming from the frontend.
         *
         * Retrieve both members from the database
         * and verify that they belong to the
         * authenticated user's family.
         */

        FamilyMember memberOne =
                getAuthorizedMember(
                        relationship
                                .getMemberOne()
                                .getId()
                );

        FamilyMember memberTwo =
                getAuthorizedMember(
                        relationship
                                .getMemberTwo()
                                .getId()
                );

        /*
         * Use the verified database entities.
         */

        relationship.setMemberOne(
                memberOne
        );

        relationship.setMemberTwo(
                memberTwo
        );

        return repository.save(
                relationship
        );
    }

    /*
     * ============================================================
     * GET ALL RELATIONSHIPS
     * ============================================================
     */

    public List<Relationship>
    getAllRelationships() {

        Family currentFamily =
                getCurrentFamily();

        Long familyId =
                currentFamily.getId();

        return repository
                .findByMemberOne_Family_IdOrMemberTwo_Family_Id(
                        familyId,
                        familyId
                );
    }

    /*
     * ============================================================
     * UPDATE RELATIONSHIP
     * ============================================================
     */

    public Relationship updateRelationship(
            Long id,
            Relationship relationship) {

        Family currentFamily =
                getCurrentFamily();

        Relationship existing =
                repository.findById(id)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Relationship not found"
                                )
                        );

        /*
         * Make sure the existing relationship
         * belongs to the current user's family.
         */

        boolean relationshipBelongsToFamily =

                (existing.getMemberOne() != null
                        && existing
                                .getMemberOne()
                                .getFamily() != null
                        && existing
                                .getMemberOne()
                                .getFamily()
                                .getId()
                                .equals(
                                        currentFamily.getId()
                                ))

                ||

                (existing.getMemberTwo() != null
                        && existing
                                .getMemberTwo()
                                .getFamily() != null
                        && existing
                                .getMemberTwo()
                                .getFamily()
                                .getId()
                                .equals(
                                        currentFamily.getId()
                                ));

        if (!relationshipBelongsToFamily) {

            throw new AccessDeniedException(
                    "You do not have access to this relationship"
            );
        }

        /*
         * Verify both new members belong to
         * the current user's family.
         */

        FamilyMember memberOne =
                getAuthorizedMember(
                        relationship
                                .getMemberOne()
                                .getId()
                );

        FamilyMember memberTwo =
                getAuthorizedMember(
                        relationship
                                .getMemberTwo()
                                .getId()
                );

        existing.setRelationshipType(
                relationship
                        .getRelationshipType()
        );

        existing.setMemberOne(
                memberOne
        );

        existing.setMemberTwo(
                memberTwo
        );

        return repository.save(
                existing
        );
    }

    /*
     * ============================================================
     * DELETE RELATIONSHIP
     * ============================================================
     */

    public void deleteRelationship(
            Long id) {

        Family currentFamily =
                getCurrentFamily();

        Relationship existing =
                repository.findById(id)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Relationship not found"
                                )
                        );

        boolean relationshipBelongsToFamily =

                (existing.getMemberOne() != null
                        && existing
                                .getMemberOne()
                                .getFamily() != null
                        && existing
                                .getMemberOne()
                                .getFamily()
                                .getId()
                                .equals(
                                        currentFamily.getId()
                                ))

                ||

                (existing.getMemberTwo() != null
                        && existing
                                .getMemberTwo()
                                .getFamily() != null
                        && existing
                                .getMemberTwo()
                                .getFamily()
                                .getId()
                                .equals(
                                        currentFamily.getId()
                                ));

        if (!relationshipBelongsToFamily) {

            throw new AccessDeniedException(
                    "You do not have access to this relationship"
            );
        }

        repository.delete(existing);
    }
}