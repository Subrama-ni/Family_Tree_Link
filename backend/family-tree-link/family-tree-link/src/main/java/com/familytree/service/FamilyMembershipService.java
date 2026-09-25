package com.familytree.service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.familytree.dto.FamilyMembershipResponse;
import com.familytree.entity.Family;
import com.familytree.entity.User;
import com.familytree.repository.FamilyRepository;
import com.familytree.repository.FamilySettingsRepository;
import com.familytree.entity.FamilySettings;
import com.familytree.repository.UserRepository;

@Service
public class FamilyMembershipService {

    private final UserRepository userRepository;
    private final FamilyRepository familyRepository;
    private final FamilySettingsRepository settingsRepository;

    public FamilyMembershipService(
            UserRepository userRepository,
            FamilyRepository familyRepository,
        FamilySettingsRepository settingsRepository) {

        this.userRepository = userRepository;
        this.familyRepository = familyRepository;
        this.settingsRepository = settingsRepository;
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

    private Family getCurrentFamily(User user) {

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
     */

    private boolean isFamilyOwner(
            User user,
            Family family) {

        return family.getOwner() != null
                && family.getOwner().getId() != null
                && user.getId() != null
                && family.getOwner()
                        .getId()
                        .equals(user.getId());
    }

    /*
     * ============================================================
     * GET FAMILY MEMBERSHIP
     * ============================================================
     *
     * GET /api/families/membership
     */

    @Transactional(readOnly = true)
    public List<FamilyMembershipResponse> getMembership() {

        User currentUser = getCurrentUser();

        Family family = getCurrentFamily(currentUser);

        Long ownerId = family.getOwner() == null
                ? null
                : family.getOwner().getId();

        return family.getUsers()
                .stream()
                .map(user -> new FamilyMembershipResponse(
                        user.getId(),
                        getDisplayName(user),
                        user.getEmail(),
                        ownerId != null
                                && ownerId.equals(user.getId())
                ))
                .collect(Collectors.toList());
    }

    /*
     * ============================================================
     * REMOVE MEMBER BY OWNER
     * ============================================================
     *
     * POST /api/families/membership/{userId}/remove
     */

    @Transactional
    public String removeMember(Long userId) {

        User currentUser = getCurrentUser();

        Family family = getCurrentFamily(currentUser);

        if (!isFamilyOwner(currentUser, family)) {

            throw new AccessDeniedException(
                    "Only the family owner can remove members"
            );
        }

        if (userId == null) {

            throw new IllegalArgumentException(
                    "Member ID is required"
            );
        }

        User memberToRemove = userRepository
                .findById(userId)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Member not found"
                        )
                );

        if (memberToRemove.getFamily() == null
                || !Objects.equals(
                        memberToRemove.getFamily().getId(),
                        family.getId())) {

            throw new IllegalArgumentException(
                    "This user does not belong to your family"
            );
        }

        if (Objects.equals(
                currentUser.getId(),
                memberToRemove.getId())) {

            throw new IllegalStateException(
                    "The family owner cannot remove themselves"
            );
        }

        /*
         * Remove account membership only.
         *
         * The FamilyMember tree profile and relationships
         * are intentionally preserved.
         */

        memberToRemove.setFamily(null);

        family.getUsers().removeIf(
                user -> Objects.equals(
                        user.getId(),
                        memberToRemove.getId()
                )
        );

        userRepository.save(memberToRemove);

        familyRepository.save(family);

        return "Member removed from the family successfully";
    }

    /*
     * ============================================================
     * LEAVE FAMILY
     * ============================================================
     *
     * POST /api/families/membership/leave
     */

    @Transactional
public String leaveFamily() {

    User currentUser = getCurrentUser();

    Family family = getCurrentFamily(currentUser);

    boolean isOwner =
            family.getOwner() != null
                    && family.getOwner()
                            .getId()
                            .equals(currentUser.getId());

    /*
     * The owner can never leave their own family.
     */
    if (isOwner) {

        throw new IllegalStateException(
                "The family owner cannot leave the family. "
                        + "Transfer ownership before leaving."
        );
    }

    FamilySettings settings =
            settingsRepository
                    .findByFamilyId(family.getId())
                    .orElse(null);

    /*
     * If settings do not exist, allow leaving by default.
     */
    boolean membersCanLeaveFamily =
            settings == null
                    || settings.isMembersCanLeaveFamily();

    if (!membersCanLeaveFamily) {

        throw new AccessDeniedException(
                "The family owner has disabled "
                        + "the Leave Family option."
        );
    }

    /*
     * Remove account membership only.
     * Preserve FamilyMember tree records and relationships.
     */
    currentUser.setFamily(null);

    family.getUsers().removeIf(
            user -> Objects.equals(
                    user.getId(),
                    currentUser.getId()
            )
    );

    userRepository.save(currentUser);

    familyRepository.save(family);

    return "You have left the family successfully";
}

    /*
     * ============================================================
     * DISPLAY NAME
     * ============================================================
     */

    private String getDisplayName(User user) {

    if (user.getFullName() != null
            && !user.getFullName().trim().isEmpty()) {

        return user.getFullName();
    }

    return user.getEmail();
}
}