package com.familytree.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.familytree.entity.Family;
import com.familytree.entity.FamilyInvitation;
import com.familytree.entity.FamilySettings;
import com.familytree.entity.User;
import com.familytree.repository.FamilyInvitationRepository;
import com.familytree.repository.FamilySettingsRepository;
import com.familytree.repository.UserRepository;

@Service
public class FamilyInvitationService {

    private final FamilyInvitationRepository invitationRepository;

    private final UserRepository userRepository;

    private final FamilySettingsRepository settingsRepository;

    private final EmailService emailService;

    /*
     * ============================================================
     * INVITATION VALIDITY
     * ============================================================
     */

    private static final long INVITATION_VALIDITY_DAYS = 7;

    /*
     * ============================================================
     * CONSTRUCTOR
     * ============================================================
     */

    public FamilyInvitationService(
            FamilyInvitationRepository invitationRepository,
            UserRepository userRepository,
            FamilySettingsRepository settingsRepository,
            EmailService emailService) {

        this.invitationRepository =
                invitationRepository;

        this.userRepository =
                userRepository;

        this.settingsRepository =
                settingsRepository;

        this.emailService =
                emailService;
    }

    /*
     * ============================================================
     * GET CURRENT AUTHENTICATED USER
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
     * CREATE FAMILY INVITATION
     * ============================================================
     */

    @Transactional
    public FamilyInvitation createInvitation(
            String invitedEmail) {

        User currentUser =
                getCurrentUser();

        Family family =
                currentUser.getFamily();

        /*
         * ========================================================
         * USER MUST BELONG TO A FAMILY
         * ========================================================
         */

        if (family == null) {

            throw new IllegalStateException(
                    "You are not associated with a family."
            );
        }

        /*
         * ========================================================
         * CHECK INVITATION PERMISSION
         * ========================================================
         *
         * Family owners can always invite members.
         *
         * Normal family members can invite members only when
         * the family owner has enabled "Members Can Invite".
         */

        boolean isOwner =
                family.getOwner() != null
                        && family.getOwner()
                                .getId()
                                .equals(
                                        currentUser.getId()
                                );

        if (!isOwner) {

            FamilySettings settings =
                    settingsRepository
                            .findByFamilyId(
                                    family.getId()
                            )
                            .orElse(null);

            /*
             * If settings do not exist yet, use the default
             * behaviour configured by the application.
             *
             * The FamilySettings default is membersCanInvite = true.
             */

            boolean membersCanInvite =
                    settings == null
                            || settings.isMembersCanInvite();

            if (!membersCanInvite) {

                throw new AccessDeniedException(
                        "Family members are not allowed to send invitations."
                );
            }
        }

        /*
         * ========================================================
         * VALIDATE EMAIL
         * ========================================================
         */

        if (invitedEmail == null
                || invitedEmail.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Email address is required."
            );
        }

        String email =
                invitedEmail
                        .trim()
                        .toLowerCase();

        /*
         * ========================================================
         * USER CANNOT INVITE THEMSELVES
         * ========================================================
         */

        if (currentUser.getEmail()
                .equalsIgnoreCase(email)) {

            throw new IllegalArgumentException(
                    "You cannot invite yourself."
            );
        }

        /*
         * ========================================================
         * CHECK WHETHER USER IS ALREADY A MEMBER
         * ========================================================
         */

        boolean alreadyMember =
                family.getUsers()
                        .stream()
                        .anyMatch(
                                user ->
                                        user.getEmail()
                                                .equalsIgnoreCase(
                                                        email
                                                )
                        );

        if (alreadyMember) {

            throw new IllegalArgumentException(
                    "This user is already a member of your family."
            );
        }

        /*
         * ========================================================
         * CHECK FOR EXISTING PENDING INVITATION
         * ========================================================
         */

        invitationRepository
                .findByInvitedEmailAndFamilyAndStatus(
                        email,
                        family,
                        "PENDING"
                )
                .ifPresent(
                        invitation -> {

                            /*
                             * If an old invitation has
                             * expired, mark it expired.
                             */

                            if (invitation
                                    .getExpiresAt()
                                    .isBefore(
                                            LocalDateTime.now()
                                    )) {

                                invitation.setStatus(
                                        "EXPIRED"
                                );

                                invitationRepository.save(
                                        invitation
                                );

                                return;
                            }

                            throw new IllegalArgumentException(
                                    "A pending invitation already exists for this email."
                            );
                        }
                );

        /*
         * ========================================================
         * GENERATE SECURE RANDOM TOKEN
         * ========================================================
         */

        String token =
                UUID.randomUUID()
                        .toString();

        /*
         * ========================================================
         * BUILD INVITATION
         * ========================================================
         */

        FamilyInvitation invitation =
                new FamilyInvitation();

        invitation.setFamily(
                family
        );

        invitation.setInvitedEmail(
                email
        );

        invitation.setInvitedBy(
                currentUser
        );

        invitation.setToken(
                token
        );

        invitation.setStatus(
                "PENDING"
        );

        invitation.setCreatedAt(
                LocalDateTime.now()
        );

        invitation.setExpiresAt(
                LocalDateTime.now()
                        .plusDays(
                                INVITATION_VALIDITY_DAYS
                        )
        );

        /*
         * ========================================================
         * SAVE INVITATION
         * ========================================================
         */

        FamilyInvitation savedInvitation =
                invitationRepository.save(
                        invitation
                );

        /*
         * ========================================================
         * SEND INVITATION EMAIL
         * ========================================================
         */

        emailService.sendFamilyInvitationEmail(
                email,
                family.getName(),
                currentUser.getFullName(),
                token
        );

        return savedInvitation;
    }

    /*
     * ============================================================
     * GET CURRENT FAMILY INVITATIONS
     * ============================================================
     */

    @Transactional(readOnly = true)
    public List<FamilyInvitation>
    getCurrentFamilyInvitations() {

        User currentUser =
                getCurrentUser();

        Family family =
                currentUser.getFamily();

        if (family == null) {

            throw new IllegalStateException(
                    "You are not associated with a family."
            );
        }

        return invitationRepository
                .findByFamilyOrderByCreatedAtDesc(
                        family
                );
    }

    /*
     * ============================================================
     * FIND INVITATION BY TOKEN
     * ============================================================
     */

    @Transactional(readOnly = true)
    public FamilyInvitation
    getInvitationByToken(
            String token) {

        if (token == null
                || token.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Invitation token is required."
            );
        }

        return invitationRepository
                .findByToken(
                        token
                )
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Invalid invitation."
                        )
                );
    }

    /*
     * ============================================================
     * ACCEPT FAMILY INVITATION
     * ============================================================
     */

    /*
 * ============================================================
 * ACCEPT FAMILY INVITATION BY TOKEN
 * ============================================================
 */

@Transactional
public FamilyInvitation acceptInvitation(
        String token) {

    User currentUser = getCurrentUser();

    FamilyInvitation invitation =
            invitationRepository
                    .findByToken(token)
                    .orElseThrow(
                            () -> new IllegalArgumentException(
                                    "Invalid invitation."
                            )
                    );

    /*
     * ========================================================
     * SECURITY CHECK
     * ========================================================
     */

    if (invitation.getInvitedEmail() == null
            || !invitation.getInvitedEmail()
                    .equalsIgnoreCase(
                            currentUser.getEmail()
                    )) {

        throw new AccessDeniedException(
                "This invitation belongs to another email address."
        );
    }

    /*
     * ========================================================
     * INVITATION MUST BE PENDING
     * ========================================================
     */

    if (!"PENDING".equals(invitation.getStatus())) {

        throw new IllegalArgumentException(
                "This invitation is no longer active."
        );
    }

    /*
     * ========================================================
     * CHECK EXPIRATION
     * ========================================================
     */

    if (invitation.getExpiresAt() != null
            && invitation.getExpiresAt()
                    .isBefore(LocalDateTime.now())) {

        invitation.setStatus("EXPIRED");

        invitationRepository.save(invitation);

        throw new IllegalArgumentException(
                "This invitation has expired."
        );
    }

    /*
     * ========================================================
     * GET INVITED FAMILY
     * ========================================================
     */

    Family invitedFamily =
            invitation.getFamily();

    if (invitedFamily == null) {

        throw new IllegalStateException(
                "The invited family could not be found."
        );
    }

    /*
     * ========================================================
     * ALREADY IN THE SAME FAMILY
     * ========================================================
     */

    if (currentUser.getFamily() != null
            && currentUser.getFamily()
                    .getId()
                    .equals(invitedFamily.getId())) {

        invitation.setStatus("ACCEPTED");

        invitation.setAcceptedAt(
                LocalDateTime.now()
        );

        return invitationRepository.save(invitation);
    }

    /*
     * ========================================================
     * REMOVE ACTIVE FAMILY ASSOCIATION
     * ========================================================
     *
     * The old family remains in the database.
     *
     * The user is only detached from the old family
     * and attached to the invited family.
     */

    Family previousFamily =
            currentUser.getFamily();

    if (previousFamily != null) {

        /*
         * Do not delete the previous family.
         *
         * Do not delete the user.
         *
         * Only clear the user's active family reference.
         */
        currentUser.setFamily(null);

        userRepository.save(currentUser);
    }

    /*
     * ========================================================
     * ADD USER TO THE NEW FAMILY
     * ========================================================
     */

    currentUser.setFamily(invitedFamily);

    userRepository.save(currentUser);

    /*
     * ========================================================
     * KEEP BOTH SIDES SYNCHRONIZED
     * ========================================================
     */

    if (!invitedFamily.getUsers()
            .contains(currentUser)) {

        invitedFamily.getUsers()
                .add(currentUser);
    }

    /*
     * ========================================================
     * MARK INVITATION AS ACCEPTED
     * ========================================================
     */

    invitation.setStatus("ACCEPTED");

    invitation.setAcceptedAt(
            LocalDateTime.now()
    );

    return invitationRepository.save(invitation);
}

        /*
     * ============================================================
     * GET RECEIVED FAMILY INVITATIONS
     * ============================================================
     *
     * Returns invitations addressed to the currently
     * authenticated user's email address.
     *
     * This is different from getCurrentFamilyInvitations(),
     * which returns invitations SENT by the user's family.
     * ============================================================
     */
    @Transactional
    public List<FamilyInvitation>
    getReceivedInvitations() {

        User currentUser =
                getCurrentUser();

        String currentEmail =
                currentUser.getEmail();

        List<FamilyInvitation> invitations =
                invitationRepository.findAll();

        /*
         * Automatically mark expired pending invitations
         * as EXPIRED.
         */
        boolean changed = false;

        for (FamilyInvitation invitation : invitations) {

            if (invitation.getInvitedEmail() == null) {
                continue;
            }

            if (!invitation.getInvitedEmail()
                    .equalsIgnoreCase(currentEmail)) {
                continue;
            }

            if ("PENDING".equals(invitation.getStatus())
                    && invitation.getExpiresAt() != null
                    && invitation.getExpiresAt()
                        .isBefore(LocalDateTime.now())) {

                invitation.setStatus("EXPIRED");

                invitationRepository.save(invitation);

                changed = true;
            }
        }

        /*
         * Return only invitations belonging to
         * the authenticated user's email.
         */
        return invitations.stream()
                .filter(invitation ->
                        invitation.getInvitedEmail() != null
                        && invitation.getInvitedEmail()
                            .equalsIgnoreCase(currentEmail))
                .sorted(
                    (first, second) ->
                        second.getCreatedAt()
                            .compareTo(first.getCreatedAt())
                )
                .toList();
    }


    /*
     * ============================================================
     * ACCEPT RECEIVED INVITATION BY ID
     * ============================================================
     *
     * This allows the frontend invitation inbox to accept
     * an invitation without exposing the invitation token
     * in the UI.
     * ============================================================
     */
    /*
 * ============================================================
 * ACCEPT RECEIVED INVITATION BY ID
 * ============================================================
 */

@Transactional
public FamilyInvitation acceptReceivedInvitation(
        Long invitationId) {

    User currentUser = getCurrentUser();

    FamilyInvitation invitation =
            invitationRepository
                    .findById(invitationId)
                    .orElseThrow(
                            () -> new IllegalArgumentException(
                                    "Invitation not found."
                            )
                    );

    /*
     * ========================================================
     * SECURITY CHECK
     * ========================================================
     */

    if (invitation.getInvitedEmail() == null
            || !invitation.getInvitedEmail()
                    .equalsIgnoreCase(
                            currentUser.getEmail()
                    )) {

        throw new AccessDeniedException(
                "You are not allowed to accept this invitation."
        );
    }

    /*
     * ========================================================
     * ACCEPT USING THE TOKEN-BASED LOGIC
     * ========================================================
     */

    return acceptInvitation(
            invitation.getToken()
    );
}


    /*
     * ============================================================
     * DECLINE RECEIVED INVITATION
     * ============================================================
     */
    @Transactional
    public FamilyInvitation
    declineInvitation(Long invitationId) {

        User currentUser =
                getCurrentUser();

        FamilyInvitation invitation =
                invitationRepository
                        .findById(invitationId)
                        .orElseThrow(
                            () -> new IllegalArgumentException(
                                "Invitation not found."
                            )
                        );

        /*
         * SECURITY CHECK
         */
        if (invitation.getInvitedEmail() == null
                || !invitation.getInvitedEmail()
                    .equalsIgnoreCase(currentUser.getEmail())) {

            throw new AccessDeniedException(
                "You are not allowed to decline this invitation."
            );
        }

        /*
         * Only pending invitations can be declined.
         */
        if (!"PENDING".equals(invitation.getStatus())) {

            throw new IllegalArgumentException(
                "This invitation is no longer active."
            );
        }

        /*
         * Check expiration before declining.
         */
        if (invitation.getExpiresAt() != null
                && invitation.getExpiresAt()
                    .isBefore(LocalDateTime.now())) {

            invitation.setStatus("EXPIRED");

            return invitationRepository.save(
                invitation
            );
        }

        invitation.setStatus("DECLINED");

        return invitationRepository.save(
            invitation
        );
    }
}