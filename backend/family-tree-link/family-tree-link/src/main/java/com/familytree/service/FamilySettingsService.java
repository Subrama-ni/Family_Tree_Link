package com.familytree.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.familytree.dto.FamilySettingsResponse;
import com.familytree.dto.UpdateFamilySettingsRequest;
import com.familytree.entity.Family;
import com.familytree.entity.FamilySettings;
import com.familytree.entity.User;
import com.familytree.repository.FamilyRepository;
import com.familytree.repository.FamilySettingsRepository;
import com.familytree.repository.UserRepository;

@Service
public class FamilySettingsService {

    private final UserRepository userRepository;

    private final FamilySettingsRepository settingsRepository;

    private final FamilyRepository familyRepository;

    public FamilySettingsService(
            UserRepository userRepository,
            FamilySettingsRepository settingsRepository,
            FamilyRepository familyRepository) {

        this.userRepository = userRepository;
        this.settingsRepository = settingsRepository;
        this.familyRepository = familyRepository;
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
     * CHECK WHETHER CURRENT USER IS FAMILY OWNER
     * ============================================================
     *
     * This is the existing owner-identification mechanism.
     *
     * The SAME result is used by:
     *
     * - Existing settings
     * - Member management permission
     * - New family name
     * - New family description
     * - Family ownership display
     */

    private boolean isCurrentUserFamilyOwner(
            User user,
            Family family) {

        if (user == null || family == null) {
            return false;
        }

        if (family.getOwner() == null) {
            return false;
        }

        if (family.getOwner().getId() == null) {
            return false;
        }

        if (user.getId() == null) {
            return false;
        }

        return family.getOwner()
                .getId()
                .equals(user.getId());
    }

    /*
     * ============================================================
     * GET OR CREATE SETTINGS
     * ============================================================
     */

    @Transactional
    public FamilySettings getOrCreateSettings() {

        Family family = getCurrentFamily();

        return settingsRepository
                .findByFamilyId(family.getId())
                .orElseGet(() -> {

                    FamilySettings settings =
                            new FamilySettings();

                    settings.setFamily(family);

                    /*
                     * ====================================================
                     * DEFAULT SETTINGS
                     * ====================================================
                     */

                    settings.setFamilyProfileVisible(true);

                    settings.setMembersCanInvite(true);

                    settings.setMembersCanEditFamily(false);

                    settings.setMembersCanManageMembers(false);

                    settings.setNewMemberNotifications(true);

                    settings.setBirthdayNotifications(true);

                    settings.setAnniversaryNotifications(true);

                    settings.setEventNotifications(true);

                    settings.setWhatsappNotifications(false);

                    return settingsRepository.save(settings);
                });
    }

    /*
     * ============================================================
     * GET SETTINGS
     * ============================================================
     *
     * GET /api/families/settings
     *
     * Returns:
     *
     * - Existing family settings
     * - Family name
     * - Family description
     * - Family ID
     * - Current user's owner status
     */

    @Transactional
    public FamilySettingsResponse getSettings() {

        User user = getCurrentUser();

        Family family = user.getFamily();

        if (family == null) {

            throw new AccessDeniedException(
                    "User is not associated with a family"
            );
        }

        FamilySettings settings =
                getOrCreateSettings();

        /*
         * ========================================================
         * IDENTIFY OWNER USING THE EXISTING OWNER LOGIC
         * ========================================================
         */

        boolean isFamilyOwner =
                isCurrentUserFamilyOwner(
                        user,
                        family
                );

        return toResponse(
                settings,
                family,
                isFamilyOwner
        );
    }

    /*
     * ============================================================
     * UPDATE SETTINGS
     * ============================================================
     *
     * PUT /api/families/settings
     *
     * Existing behavior preserved:
     *
     * ONLY THE FAMILY OWNER CAN CHANGE FAMILY SETTINGS.
     */

    @Transactional
    public FamilySettingsResponse updateSettings(
            UpdateFamilySettingsRequest request) {

        User user = getCurrentUser();

        Family family = user.getFamily();

        if (family == null) {

            throw new AccessDeniedException(
                    "User is not associated with a family"
            );
        }

        /*
         * ========================================================
         * CHECK FAMILY OWNER
         * ========================================================
         */

        boolean isFamilyOwner =
                isCurrentUserFamilyOwner(
                        user,
                        family
                );

        if (!isFamilyOwner) {

            throw new AccessDeniedException(
                    "Only the family owner can modify family settings"
            );
        }

        /*
         * ========================================================
         * GET SETTINGS
         * ========================================================
         */

        FamilySettings settings =
                getOrCreateSettings();

        /*
         * ========================================================
         * UPDATE FAMILY INFORMATION
         * ========================================================
         *
         * NEW FEATURE
         */

        if (request.getFamilyName() != null
                && !request.getFamilyName()
                        .trim()
                        .isEmpty()) {

            family.setName(
                    request.getFamilyName().trim()
            );
        }

        if (request.getFamilyDescription() != null) {

            family.setDescription(
                    request.getFamilyDescription().trim()
            );
        }

        /*
         * ========================================================
         * UPDATE FAMILY PROFILE
         * ========================================================
         */

        settings.setFamilyProfileVisible(
                request.isFamilyProfileVisible()
        );

        /*
         * ========================================================
         * UPDATE MEMBER PERMISSIONS
         * ========================================================
         */

        settings.setMembersCanInvite(
                request.isMembersCanInvite()
        );

        settings.setMembersCanEditFamily(
                request.isMembersCanEditFamily()
        );

        settings.setMembersCanManageMembers(
                request.isMembersCanManageMembers()
        );

        /*
         * ========================================================
         * UPDATE NOTIFICATIONS
         * ========================================================
         */

        settings.setNewMemberNotifications(
                request.isNewMemberNotifications()
        );

        settings.setBirthdayNotifications(
                request.isBirthdayNotifications()
        );

        settings.setAnniversaryNotifications(
                request.isAnniversaryNotifications()
        );

        settings.setEventNotifications(
                request.isEventNotifications()
        );

        /*
         * ========================================================
         * UPDATE WHATSAPP
         * ========================================================
         */

        settings.setWhatsappNotifications(
                request.isWhatsappNotifications()
        );

        /*
         * ========================================================
         * SAVE FAMILY
         * ========================================================
         */

        family =
                familyRepository.save(family);

        /*
         * ========================================================
         * SAVE SETTINGS
         * ========================================================
         */

        settings =
                settingsRepository.save(settings);

        /*
         * ========================================================
         * RETURN UPDATED RESPONSE
         * ========================================================
         *
         * IMPORTANT:
         * Do NOT hard-code true here.
         *
         * Use the same owner calculation used by GET.
         */

        boolean updatedOwnerStatus =
                isCurrentUserFamilyOwner(
                        user,
                        family
                );

        return toResponse(
                settings,
                family,
                updatedOwnerStatus
        );
    }

    /*
     * ============================================================
     * CONVERT ENTITY TO RESPONSE
     * ============================================================
     */

    private FamilySettingsResponse toResponse(
            FamilySettings settings,
            Family family,
            boolean isFamilyOwner) {

        return new FamilySettingsResponse(

                settings.getId(),

                family.getId(),

                isFamilyOwner,

                family.getName(),

                family.getDescription(),

                settings.isFamilyProfileVisible(),

                settings.isMembersCanInvite(),

                settings.isMembersCanEditFamily(),

                settings.isMembersCanManageMembers(),

                settings.isNewMemberNotifications(),

                settings.isBirthdayNotifications(),

                settings.isAnniversaryNotifications(),

                settings.isEventNotifications(),

                settings.isWhatsappNotifications()
        );
    }

    /*
     * ============================================================
     * UPDATE MEMBERS CAN LEAVE FAMILY
     * ============================================================
     *
     * Existing functionality - preserved.
     */

    @Transactional
    public FamilySettings updateMembersCanLeaveFamily(
            boolean enabled) {

        User currentUser = getCurrentUser();

        Family family = currentUser.getFamily();

        if (family == null) {

            throw new IllegalStateException(
                    "You are not associated with a family."
            );
        }

        boolean isOwner =
                family.getOwner() != null
                        && family.getOwner()
                                .getId()
                                .equals(currentUser.getId());

        if (!isOwner) {

            throw new AccessDeniedException(
                    "Only the family owner can change family settings."
            );
        }

        FamilySettings settings =
                settingsRepository
                        .findByFamilyId(family.getId())
                        .orElseGet(() -> {

                            FamilySettings newSettings =
                                    new FamilySettings();

                            newSettings.setFamily(family);

                            return newSettings;
                        });

        settings.setMembersCanLeaveFamily(enabled);

        return settingsRepository.save(settings);
    }
}