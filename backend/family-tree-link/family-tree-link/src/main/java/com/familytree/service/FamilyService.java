package com.familytree.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.familytree.dto.CreateFamilyRequest;
import com.familytree.dto.FamilyMemberOptionDTO;
import com.familytree.dto.FamilyResponse;
import com.familytree.dto.FamilyUpdateDTO;
import com.familytree.entity.Family;
import com.familytree.entity.FamilyMember;
import com.familytree.entity.LifeEvent;
import com.familytree.entity.MemberPhoto;
import com.familytree.entity.Relationship;
import com.familytree.entity.User;
import com.familytree.repository.FamilyMemberRepository;
import com.familytree.repository.FamilyRepository;
import com.familytree.repository.LifeEventRepository;
import com.familytree.repository.MemberPhotoRepository;
import com.familytree.repository.RelationshipRepository;
import com.familytree.repository.UserRepository;

@Service
public class FamilyService {

    private final UserRepository userRepository;
    private final FamilyRepository familyRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final RelationshipRepository relationshipRepository;
    private final LifeEventRepository lifeEventRepository;
    private final MemberPhotoRepository memberPhotoRepository;

    public FamilyService(
            UserRepository userRepository,
            FamilyRepository familyRepository,
            FamilyMemberRepository familyMemberRepository,
            RelationshipRepository relationshipRepository,
            LifeEventRepository lifeEventRepository,
            MemberPhotoRepository memberPhotoRepository) {

        this.userRepository = userRepository;
        this.familyRepository = familyRepository;
        this.familyMemberRepository = familyMemberRepository;
        this.relationshipRepository = relationshipRepository;
        this.lifeEventRepository = lifeEventRepository;
        this.memberPhotoRepository = memberPhotoRepository;
    }

    /*
     * ============================================================
     * CURRENT USER
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
     * CURRENT FAMILY
     * ============================================================
     */

    private Family getRequiredCurrentFamily() {

        User user = getCurrentUser();

        Family family = user.getFamily();

        if (family == null) {

            throw new AccessDeniedException(
                    "User is not associated with a family"
            );
        }

        return family;
    }

    /*
     * ============================================================
     * GET CURRENT FAMILY
     * ============================================================
     */

    public FamilyResponse getCurrentFamily() {

        Family family =
                getRequiredCurrentFamily();

        return new FamilyResponse(
                family.getId(),
                family.getName(),
                family.getDescription()
        );
    }

    /*
     * ============================================================
     * CREATE FAMILY
     * ============================================================
     */

    @Transactional
    public FamilyResponse createFamily(
            CreateFamilyRequest request) {

        User user = getCurrentUser();

        if (user.getFamily() != null) {

            throw new IllegalStateException(
                    "You already belong to a family"
            );
        }

        if (request == null
                || request.getName() == null
                || request.getName().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Family name is required"
            );
        }

        Family family = new Family();

        family.setName(
                request.getName().trim()
        );

        family.setDescription(
                request.getDescription() == null
                        ? ""
                        : request.getDescription().trim()
        );

        family =
                familyRepository.save(family);

        family.setOwner(user);

        user.setFamily(family);

        if (!family.getUsers().contains(user)) {

            family.getUsers().add(user);
        }

        familyRepository.save(family);

        userRepository.save(user);

        return new FamilyResponse(
                family.getId(),
                family.getName(),
                family.getDescription()
        );
    }

    /*
     * ============================================================
     * LEAVE FAMILY
     * ============================================================
     */

    @Transactional
    public void leaveFamily(
            User currentUser) {

        if (currentUser == null) {

            throw new RuntimeException(
                    "User not found"
            );
        }

        Family currentFamily =
                currentUser.getFamily();

        if (currentFamily == null) {

            throw new RuntimeException(
                    "You are not currently part of any family"
            );
        }

        if (currentFamily.getOwner() != null
                && currentFamily
                        .getOwner()
                        .getId()
                        .equals(currentUser.getId())) {

            throw new RuntimeException(
                    "The family owner cannot leave the family. Transfer ownership first."
            );
        }

        currentUser.setFamily(null);

        userRepository.save(currentUser);
    }

    /*
     * ============================================================
     * UPDATE FAMILY
     * ============================================================
     */

    @Transactional
    public FamilyResponse updateFamily(
            FamilyUpdateDTO request) {

        User currentUser = getCurrentUser();

        Family family =
                getRequiredCurrentFamily();

        if (family.getOwner() == null) {

            throw new IllegalStateException(
                    "This family does not have an owner"
            );
        }

        if (!family.getOwner()
                .getId()
                .equals(currentUser.getId())) {

            throw new AccessDeniedException(
                    "Only the family owner can update family settings"
            );
        }

        if (request == null
                || request.getName() == null
                || request.getName().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Family name is required"
            );
        }

        family.setName(
                request.getName().trim()
        );

        family.setDescription(
                request.getDescription() == null
                        ? ""
                        : request.getDescription().trim()
        );

        familyRepository.save(family);

        return new FamilyResponse(
                family.getId(),
                family.getName(),
                family.getDescription()
        );
    }

    /*
     * ============================================================
     * TRANSFER OWNERSHIP
     * ============================================================
     */

    @Transactional
    public FamilyResponse transferOwnership(
            Long newOwnerId) {

        User currentUser = getCurrentUser();

        Family family =
                getRequiredCurrentFamily();

        if (family.getOwner() == null) {

            throw new IllegalStateException(
                    "This family does not have an owner."
            );
        }

        if (!family.getOwner()
                .getId()
                .equals(currentUser.getId())) {

            throw new AccessDeniedException(
                    "Only the family owner can transfer ownership."
            );
        }

        if (newOwnerId == null) {

            throw new IllegalArgumentException(
                    "New owner ID is required."
            );
        }

        if (newOwnerId.equals(currentUser.getId())) {

            throw new IllegalArgumentException(
                    "You are already the family owner."
            );
        }

        User newOwner =
                userRepository
                        .findById(newOwnerId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Selected family member was not found."
                                )
                        );

        if (newOwner.getFamily() == null
                || newOwner.getFamily().getId() == null
                || !newOwner.getFamily()
                        .getId()
                        .equals(family.getId())) {

            throw new IllegalArgumentException(
                    "The selected user is not a member of this family."
            );
        }

        family.setOwner(newOwner);

        /*
         * Previous owner remains a normal family member.
         */
        familyRepository.save(family);

        return new FamilyResponse(
                family.getId(),
                family.getName(),
                family.getDescription()
        );
    }

    /*
     * ============================================================
     * GET CURRENT FAMILY MEMBERS
     * ============================================================
     *
     * Only ONE version exists here.
     *
     * The previous source contained duplicate methods with
     * identical parameters but different return types.
     */

    @Transactional(readOnly = true)
    public List<FamilyMemberOptionDTO>
    getCurrentFamilyMembers() {

        User currentUser = getCurrentUser();

        Family family =
                getRequiredCurrentFamily();

        return userRepository
                .findByFamily_Id(family.getId())
                .stream()
                .filter(member ->
                        !member.getId()
                                .equals(currentUser.getId()))
                .map(member ->
                        new FamilyMemberOptionDTO(
                                member.getId(),
                                member.getFullName(),
                                member.getEmail()
                        ))
                .toList();
    }

    /*
     * ============================================================
     * REMOVE MEMBER FROM FAMILY
     * ============================================================
     *
     * IMPORTANT:
     *
     * This does NOT delete the User account.
     *
     * The user's:
     *
     *   email
     *   password
     *   full name
     *   account ID
     *
     * remain in users.
     *
     * Only:
     *
     *   users.family_id
     *
     * becomes NULL.
     *
     * The linked FamilyMember and its family-specific content
     * are deleted.
     */

    @Transactional
    public void removeMemberFromFamily(
            Long familyMemberId) {

        User currentUser = getCurrentUser();

        Family family =
                getRequiredCurrentFamily();

        /*
         * Only owner can perform this destructive operation.
         */
        if (family.getOwner() == null
                || !family.getOwner()
                        .getId()
                        .equals(currentUser.getId())) {

            throw new AccessDeniedException(
                    "Only the family owner can remove members from the family."
            );
        }

        if (familyMemberId == null) {

            throw new IllegalArgumentException(
                    "Family member ID is required."
            );
        }

        FamilyMember member =
                familyMemberRepository
                        .findById(familyMemberId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Family member not found."
                                )
                        );

        /*
         * SECURITY:
         * Make sure the selected member belongs to the current
         * family.
         */
        if (member.getFamily() == null
                || !member.getFamily()
                        .getId()
                        .equals(family.getId())) {

            throw new AccessDeniedException(
                    "The selected member does not belong to your family."
            );
        }

        /*
         * Never allow owner to be removed.
         */
        if (member.getUser() != null
                && family.getOwner() != null
                && member.getUser()
                        .getId()
                        .equals(
                                family.getOwner().getId()
                        )) {

            throw new IllegalArgumentException(
                    "The family owner cannot be removed."
            );
        }

        /*
         * ========================================================
         * DELETE RELATIONSHIPS
         * ========================================================
         */

        List<Relationship> relationships =
                relationshipRepository
                        .findByMemberOne_IdOrMemberTwo_Id(
                                member.getId(),
                                member.getId()
                        );

        if (!relationships.isEmpty()) {

            relationshipRepository.deleteAll(
                    relationships
            );
        }

        /*
         * ========================================================
         * DELETE LIFE EVENTS
         * ========================================================
         */

        List<LifeEvent> events =
                lifeEventRepository
                        .findByFamilyMemberId(
                                member.getId()
                        );

        if (!events.isEmpty()) {

            lifeEventRepository.deleteAll(
                    events
            );
        }

        /*
         * ========================================================
         * DELETE PHOTOS
         * ========================================================
         */

        List<MemberPhoto> photos =
                memberPhotoRepository
                        .findByFamilyMemberId(
                                member.getId()
                        );

        if (!photos.isEmpty()) {

            memberPhotoRepository.deleteAll(
                    photos
            );
        }

        /*
         * ========================================================
         * PRESERVE USER ACCOUNT
         * ========================================================
         */

        User linkedUser =
                member.getUser();

        if (linkedUser != null) {

            linkedUser.setFamily(null);

            userRepository.save(linkedUser);
        }

        /*
         * ========================================================
         * DELETE FAMILY MEMBER PROFILE
         * ========================================================
         */

        familyMemberRepository.delete(member);
    }
}