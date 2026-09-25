package com.familytree.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.familytree.entity.Family;
import com.familytree.entity.FamilyMember;
import com.familytree.entity.FamilySettings;
import com.familytree.entity.Relationship;
import com.familytree.entity.User;
import com.familytree.repository.FamilyMemberRepository;
import com.familytree.repository.FamilySettingsRepository;
import com.familytree.repository.RelationshipRepository;
import com.familytree.repository.UserRepository;

@Service
public class RelationshipService {

    private final RelationshipRepository relationshipRepository;

    private final FamilyMemberRepository familyMemberRepository;

    private final UserRepository userRepository;

    private final FamilySettingsRepository familySettingsRepository;

    public RelationshipService(
            RelationshipRepository relationshipRepository,
            FamilyMemberRepository familyMemberRepository,
            UserRepository userRepository,
            FamilySettingsRepository familySettingsRepository) {

        this.relationshipRepository = relationshipRepository;

        this.familyMemberRepository = familyMemberRepository;

        this.userRepository = userRepository;

        this.familySettingsRepository = familySettingsRepository;
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
     * CHECK FAMILY OWNER
     * ============================================================
     *
     * The owner is stored directly inside Family.owner.
     *
     * IMPORTANT:
     *
     * We do NOT use FamilySettings to determine whether
     * the owner has permission.
     *
     * Owner permission is always granted.
     */

    private boolean isFamilyOwner() {

        User currentUser = getCurrentUser();

        Family currentFamily = currentUser.getFamily();

        if (currentFamily == null
                || currentFamily.getOwner() == null) {

            return false;
        }

        return currentFamily
                .getOwner()
                .getId()
                .equals(currentUser.getId());
    }

    /*
     * ============================================================
     * CHECK MANAGEMENT PERMISSION
     * ============================================================
     *
     * OWNER:
     *      Always allowed.
     *
     * NORMAL MEMBER:
     *      Allowed only when:
     *
     *      membersCanManageMembers = true
     */

    private void checkManagementPermission() {

        /*
         * --------------------------------------------------------
         * OWNER ALWAYS ALLOWED
         * --------------------------------------------------------
         */

        if (isFamilyOwner()) {
            return;
        }

        /*
         * --------------------------------------------------------
         * NORMAL MEMBER
         * --------------------------------------------------------
         */

        Family currentFamily = getCurrentFamily();

        FamilySettings settings =
                familySettingsRepository
                        .findByFamilyId(currentFamily.getId())
                        .orElse(null);

        /*
         * If settings do not exist, deny permission.
         */

        if (settings == null) {

            throw new AccessDeniedException(
                    "Family settings not found"
            );
        }

        if (!settings.isMembersCanManageMembers()) {

            throw new AccessDeniedException(
                    "You do not have permission to manage family relationships"
            );
        }
    }

    /*
     * ============================================================
     * GET AUTHORIZED MEMBER
     * ============================================================
     *
     * Makes sure the member belongs to the currently logged-in
     * user's family.
     */

    private FamilyMember getAuthorizedMember(Long memberId) {

        if (memberId == null) {

            throw new IllegalArgumentException(
                    "Member ID cannot be null"
            );
        }

        Family currentFamily = getCurrentFamily();

        FamilyMember member =
                familyMemberRepository
                        .findById(memberId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Family member not found: "
                                                + memberId
                                )
                        );

        if (member.getFamily() == null
                || member.getFamily().getId() == null
                || !member.getFamily()
                        .getId()
                        .equals(currentFamily.getId())) {

            throw new AccessDeniedException(
                    "You cannot create a relationship with a member outside your family"
            );
        }

        return member;
    }

    /*
     * ============================================================
     * GET AUTHORIZED RELATIONSHIP
     * ============================================================
     */

    private Relationship getAuthorizedRelationship(Long id) {

        Family currentFamily = getCurrentFamily();

        Relationship relationship =
                relationshipRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Relationship not found: " + id
                                )
                        );

        FamilyMember memberOne =
                relationship.getMemberOne();

        FamilyMember memberTwo =
                relationship.getMemberTwo();

        boolean memberOneBelongs =
                memberOne != null
                        && memberOne.getFamily() != null
                        && memberOne.getFamily()
                                .getId()
                                .equals(currentFamily.getId());

        boolean memberTwoBelongs =
                memberTwo != null
                        && memberTwo.getFamily() != null
                        && memberTwo.getFamily()
                                .getId()
                                .equals(currentFamily.getId());

        if (!memberOneBelongs || !memberTwoBelongs) {

            throw new AccessDeniedException(
                    "You do not have access to this family relationship"
            );
        }

        return relationship;
    }

    /*
     * ============================================================
     * ADD RELATIONSHIP
     * ============================================================
     */

    public Relationship addRelationship(
            Relationship relationship) {

        /*
         * Check owner/member permission FIRST.
         */

        checkManagementPermission();

        if (relationship == null) {

            throw new IllegalArgumentException(
                    "Relationship cannot be null"
            );
        }

        if (relationship.getMemberOne() == null
                || relationship.getMemberOne().getId() == null) {

            throw new IllegalArgumentException(
                    "Member 1 is required"
            );
        }

        if (relationship.getMemberTwo() == null
                || relationship.getMemberTwo().getId() == null) {

            throw new IllegalArgumentException(
                    "Member 2 is required"
            );
        }

        if (relationship.getRelationshipType() == null
                || relationship.getRelationshipType()
                        .trim()
                        .isEmpty()) {

            throw new IllegalArgumentException(
                    "Relationship type is required"
            );
        }

        Long memberOneId =
                relationship
                        .getMemberOne()
                        .getId();

        Long memberTwoId =
                relationship
                        .getMemberTwo()
                        .getId();

        /*
         * A member cannot be related to themselves.
         */

        if (memberOneId.equals(memberTwoId)) {

            throw new IllegalArgumentException(
                    "A family member cannot have a relationship with themselves"
            );
        }

        /*
         * Retrieve the REAL members from the database.
         *
         * Never trust the family information coming from
         * the frontend.
         */

        FamilyMember memberOne =
                getAuthorizedMember(memberOneId);

        FamilyMember memberTwo =
                getAuthorizedMember(memberTwoId);

        /*
         * Build a clean relationship.
         */

        Relationship newRelationship =
                new Relationship();

        newRelationship.setMemberOne(memberOne);

        newRelationship.setMemberTwo(memberTwo);

        newRelationship.setRelationshipType(
                relationship
                        .getRelationshipType()
                        .trim()
        );

        return relationshipRepository.save(
                newRelationship
        );
    }

    /*
     * ============================================================
     * GET ALL RELATIONSHIPS
     * ============================================================
     */

    public List<Relationship> getAllRelationships() {

        Family currentFamily =
                getCurrentFamily();

        return relationshipRepository
                .findByMemberOne_Family_IdOrMemberTwo_Family_Id(
                        currentFamily.getId(),
                        currentFamily.getId()
                );
    }

    /*
     * ============================================================
     * UPDATE RELATIONSHIP
     * ============================================================
     */

    public Relationship updateRelationship(
            Long id,
            Relationship updatedRelationship) {

        /*
         * OWNER OR ENABLED MEMBER
         */

        checkManagementPermission();

        if (updatedRelationship == null) {

            throw new IllegalArgumentException(
                    "Relationship cannot be null"
            );
        }

        if (updatedRelationship.getMemberOne() == null
                || updatedRelationship.getMemberOne().getId() == null) {

            throw new IllegalArgumentException(
                    "Member 1 is required"
            );
        }

        if (updatedRelationship.getMemberTwo() == null
                || updatedRelationship.getMemberTwo().getId() == null) {

            throw new IllegalArgumentException(
                    "Member 2 is required"
            );
        }

        if (updatedRelationship.getRelationshipType() == null
                || updatedRelationship
                        .getRelationshipType()
                        .trim()
                        .isEmpty()) {

            throw new IllegalArgumentException(
                    "Relationship type is required"
            );
        }

        Long memberOneId =
                updatedRelationship
                        .getMemberOne()
                        .getId();

        Long memberTwoId =
                updatedRelationship
                        .getMemberTwo()
                        .getId();

        if (memberOneId.equals(memberTwoId)) {

            throw new IllegalArgumentException(
                    "A family member cannot have a relationship with themselves"
            );
        }

        /*
         * Make sure the existing relationship belongs
         * to the current family.
         */

        Relationship existing =
                getAuthorizedRelationship(id);

        /*
         * Make sure the new members also belong
         * to the current family.
         */

        FamilyMember memberOne =
                getAuthorizedMember(memberOneId);

        FamilyMember memberTwo =
                getAuthorizedMember(memberTwoId);

        existing.setMemberOne(memberOne);

        existing.setMemberTwo(memberTwo);

        existing.setRelationshipType(
                updatedRelationship
                        .getRelationshipType()
                        .trim()
        );

        return relationshipRepository.save(
                existing
        );
    }

    /*
     * ============================================================
     * DELETE RELATIONSHIP
     * ============================================================
     */

    public void deleteRelationship(Long id) {

        /*
         * OWNER OR ENABLED MEMBER
         */

        checkManagementPermission();

        /*
         * Verify relationship belongs to current family.
         */

        Relationship relationship =
                getAuthorizedRelationship(id);

        relationshipRepository.delete(
                relationship
        );
    }
}