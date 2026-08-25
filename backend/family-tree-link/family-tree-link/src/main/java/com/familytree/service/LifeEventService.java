package com.familytree.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.familytree.entity.Family;
import com.familytree.entity.FamilyMember;
import com.familytree.entity.LifeEvent;
import com.familytree.entity.User;
import com.familytree.repository.FamilyMemberRepository;
import com.familytree.repository.LifeEventRepository;
import com.familytree.repository.UserRepository;

@Service
public class LifeEventService {

    private final LifeEventRepository repository;

    private final FamilyMemberRepository familyMemberRepository;

    private final UserRepository userRepository;

    public LifeEventService(
            LifeEventRepository repository,
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
     * GET AUTHORIZED FAMILY MEMBER
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
                        .equals(
                                currentFamily.getId()
                        )) {

            throw new AccessDeniedException(
                    "Member does not belong to your family"
            );
        }

        return member;
    }

    /*
     * ============================================================
     * GET AUTHORIZED EVENT
     * ============================================================
     */

    private LifeEvent getAuthorizedEvent(
            Long id) {

        Family currentFamily =
                getCurrentFamily();

        LifeEvent event =
                repository.findById(id)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Life event not found"
                                )
                        );

        if (event.getFamilyMember() == null
                || event.getFamilyMember()
                        .getFamily() == null
                || !event.getFamilyMember()
                        .getFamily()
                        .getId()
                        .equals(
                                currentFamily.getId()
                        )) {

            throw new AccessDeniedException(
                    "You do not have access to this life event"
            );
        }

        return event;
    }

    /*
     * ============================================================
     * ADD EVENT
     * ============================================================
     */

    public LifeEvent addEvent(
            LifeEvent event) {

        if (event.getFamilyMember() == null
                || event.getFamilyMember().getId() == null) {

            throw new IllegalArgumentException(
                    "Family member is required for an event"
            );
        }

        /*
         * Retrieve the member from the database
         * and verify that it belongs to the
         * authenticated user's family.
         */
        FamilyMember member =
                getAuthorizedMember(
                        event.getFamilyMember().getId()
                );

        /*
         * Use the verified database entity.
         */
        event.setFamilyMember(member);

        return repository.save(event);
    }

    /*
     * ============================================================
     * GET ALL EVENTS OF CURRENT FAMILY
     * ============================================================
     */

    public List<LifeEvent> getAllEvents() {

        Family currentFamily =
                getCurrentFamily();

        return repository
                .findByFamilyMember_Family_Id(
                        currentFamily.getId()
                );
    }

    /*
     * ============================================================
     * UPDATE EVENT
     * ============================================================
     */

    public LifeEvent updateEvent(
            Long id,
            LifeEvent event) {

        LifeEvent existing =
                getAuthorizedEvent(id);

        if (event.getFamilyMember() == null
                || event.getFamilyMember().getId() == null) {

            throw new IllegalArgumentException(
                    "Family member is required for an event"
            );
        }

        /*
         * Verify that the new member also belongs
         * to the authenticated user's family.
         */
        FamilyMember member =
                getAuthorizedMember(
                        event.getFamilyMember().getId()
                );

        existing.setTitle(
                event.getTitle()
        );

        existing.setDescription(
                event.getDescription()
        );

        existing.setEventDate(
                event.getEventDate()
        );

        existing.setEventType(
                event.getEventType()
        );

        existing.setFamilyMember(
                member
        );

        return repository.save(existing);
    }

    /*
     * ============================================================
     * DELETE EVENT
     * ============================================================
     */

    public void deleteEvent(
            Long id) {

        LifeEvent existing =
                getAuthorizedEvent(id);

        repository.delete(existing);
    }
}