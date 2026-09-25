package com.familytree.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.familytree.entity.Family;
import com.familytree.entity.FamilyMember;
import com.familytree.entity.LifeEvent;
import com.familytree.entity.MemberPhoto;
import com.familytree.entity.Relationship;
import com.familytree.entity.User;
import com.familytree.repository.FamilyMemberRepository;
import com.familytree.repository.LifeEventRepository;
import com.familytree.repository.MemberPhotoRepository;
import com.familytree.repository.RelationshipRepository;
import com.familytree.repository.UserRepository;

@Service
public class FamilyMemberService {

    private final FamilyMemberRepository familyMemberRepository;
    private final RelationshipRepository relationshipRepository;
    private final LifeEventRepository lifeEventRepository;
    private final MemberPhotoRepository memberPhotoRepository;
    private final UserRepository userRepository;

    public FamilyMemberService(
            FamilyMemberRepository familyMemberRepository,
            RelationshipRepository relationshipRepository,
            LifeEventRepository lifeEventRepository,
            MemberPhotoRepository memberPhotoRepository,
            UserRepository userRepository) {

        this.familyMemberRepository = familyMemberRepository;
        this.relationshipRepository = relationshipRepository;
        this.lifeEventRepository = lifeEventRepository;
        this.memberPhotoRepository = memberPhotoRepository;
        this.userRepository = userRepository;
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

    private Family getCurrentFamily() {

        User currentUser = getCurrentUser();

        if (currentUser.getFamily() == null) {

            throw new AccessDeniedException(
                    "User is not associated with a family"
            );
        }

        return currentUser.getFamily();
    }

    /*
     * ============================================================
     * MANAGEMENT PERMISSION
     * ============================================================
     */

    private void verifyManagementPermission() {

        User currentUser = getCurrentUser();

        Family family = currentUser.getFamily();

        if (family == null) {

            throw new AccessDeniedException(
                    "You are not associated with a family"
            );
        }

        /*
         * Family owner always has permission.
         */
        if (family.getOwner() != null
                && family.getOwner().getId() != null
                && family.getOwner()
                        .getId()
                        .equals(currentUser.getId())) {

            return;
        }

        /*
         * Existing family setting controls whether normal
         * members can manage family members.
         *
         * The setting is checked by FamilySettingsService/
         * frontend as well. Backend remains the authority.
         */
        throw new AccessDeniedException(
                "You do not have permission to manage family members"
        );
    }

    /*
     * ============================================================
     * VERIFY MEMBER BELONGS TO CURRENT FAMILY
     * ============================================================
     */

    private FamilyMember getAuthorizedMember(Long id) {

        Family currentFamily = getCurrentFamily();

        FamilyMember member =
                familyMemberRepository
                        .findById(id)
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
                    "Family member does not belong to your family"
            );
        }

        return member;
    }

    /*
     * ============================================================
     * ADD MEMBER
     * ============================================================
     */

    @Transactional
    public FamilyMember addMember(FamilyMember member) {

        if (member == null) {

            throw new IllegalArgumentException(
                    "Family member cannot be null"
            );
        }

        verifyManagementPermission();

        Family currentFamily = getCurrentFamily();

        /*
         * Never trust a family object supplied by the frontend.
         */
        member.setFamily(currentFamily);

        /*
         * A manually-created family member does not automatically
         * receive a User account.
         */
        if (member.getUser() != null
                && member.getUser().getId() != null) {

            User user =
                    userRepository
                            .findById(member.getUser().getId())
                            .orElseThrow(
                                    () -> new IllegalArgumentException(
                                            "Linked user not found"
                                    )
                            );

            if (user.getFamily() == null
                    || !user.getFamily()
                            .getId()
                            .equals(currentFamily.getId())) {

                throw new IllegalArgumentException(
                        "Linked user does not belong to this family"
                );
            }

            member.setUser(user);
        }

        return familyMemberRepository.save(member);
    }

    /*
     * ============================================================
     * GET ALL MEMBERS
     * ============================================================
     */

    @Transactional(readOnly = true)
    public List<FamilyMember> getAllMembers() {

        Family currentFamily = getCurrentFamily();

        return familyMemberRepository
                .findByFamilyId(currentFamily.getId());
    }

    /*
     * ============================================================
     * GET MEMBER
     * ============================================================
     */

    @Transactional(readOnly = true)
    public FamilyMember getMemberById(Long id) {

        return getAuthorizedMember(id);
    }

    /*
     * ============================================================
     * UPDATE MEMBER
     * ============================================================
     */

    @Transactional
    public FamilyMember updateMember(
            Long id,
            FamilyMember updatedMember) {

        verifyManagementPermission();

        FamilyMember existing =
                getAuthorizedMember(id);

        existing.setFullName(
                updatedMember.getFullName()
        );

        existing.setGender(
                updatedMember.getGender()
        );

        existing.setDateOfBirth(
                updatedMember.getDateOfBirth()
        );

        existing.setBiography(
                updatedMember.getBiography()
        );

        existing.setOccupation(
                updatedMember.getOccupation()
        );

        existing.setImagePath(
                updatedMember.getImagePath()
        );

        return familyMemberRepository.save(existing);
    }

    /*
     * ============================================================
     * DELETE FAMILY MEMBER PROFILE
     * ============================================================
     *
     * This deletes the tree profile and its family-specific data.
     *
     * If the profile is linked to a User account, the account
     * itself is preserved and detached from the family.
     */

    @Transactional
    public void deleteMember(Long id) {

        verifyManagementPermission();

        FamilyMember member =
                getAuthorizedMember(id);

        cleanupMemberData(member);

        User linkedUser = member.getUser();

        if (linkedUser != null) {

            linkedUser.setFamily(null);

            userRepository.save(linkedUser);
        }

        familyMemberRepository.delete(member);
    }

    /*
     * ============================================================
     * DELETE FAMILY-SPECIFIC DATA
     * ============================================================
     */

    private void cleanupMemberData(
            FamilyMember member) {

        Long memberId = member.getId();

        /*
         * Delete relationships involving this member.
         */
        List<Relationship> relationships =
                relationshipRepository
                        .findByMemberOne_IdOrMemberTwo_Id(
                                memberId,
                                memberId
                        );

        if (!relationships.isEmpty()) {

            relationshipRepository.deleteAll(
                    relationships
            );
        }

        /*
         * Delete life events.
         */
        lifeEventRepository
                .deleteByFamilyMemberId(memberId);

        /*
         * Delete photos.
         */
        memberPhotoRepository
                .deleteByFamilyMemberId(memberId);
    }

    /*
     * ============================================================
     * UPDATE POSITION
     * ============================================================
     */

    @Transactional
    public FamilyMember updatePosition(
            Long id,
            Double positionX,
            Double positionY) {

        verifyManagementPermission();

        FamilyMember member =
                getAuthorizedMember(id);

        member.setPositionX(positionX);
        member.setPositionY(positionY);

        return familyMemberRepository.save(member);
    }
}