package com.familytree.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.familytree.entity.Family;
import com.familytree.entity.FamilyMember;
import com.familytree.entity.User;
import com.familytree.repository.FamilyMemberRepository;
import com.familytree.repository.UserRepository;

@Service
public class FamilyMemberService {

    private final FamilyMemberRepository repository;

    private final UserRepository userRepository;

    public FamilyMemberService(
            FamilyMemberRepository repository,
            UserRepository userRepository) {

        this.repository = repository;
        this.userRepository = userRepository;
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
     * GET CURRENT USER'S FAMILY
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
     * VERIFY MEMBER BELONGS TO CURRENT FAMILY
     * ============================================================
     */

    private FamilyMember getAuthorizedMember(
            Long id) {

        Family currentFamily =
                getCurrentFamily();

        FamilyMember member =
                repository.findById(id)
                        .orElse(null);

        if (member == null) {
            return null;
        }

        if (member.getFamily() == null
                || !member.getFamily()
                        .getId()
                        .equals(currentFamily.getId())) {

            throw new AccessDeniedException(
                    "You do not have access to this family member"
            );
        }

        return member;
    }

    /*
     * ============================================================
     * ADD MEMBER
     * ============================================================
     */

    public FamilyMember addMember(
            FamilyMember member) {

        Family currentFamily =
                getCurrentFamily();

        /*
         * Never trust family information coming
         * from the frontend.
         *
         * The backend assigns the authenticated
         * user's family.
         */
        member.setFamily(currentFamily);

        return repository.save(member);
    }

    /*
     * ============================================================
     * GET ALL MEMBERS OF CURRENT FAMILY
     * ============================================================
     */

    public List<FamilyMember> getAllMembers() {

        Family currentFamily =
                getCurrentFamily();

        return repository.findByFamilyId(
                currentFamily.getId()
        );
    }

    /*
     * ============================================================
     * GET SINGLE MEMBER
     * ============================================================
     */

    public FamilyMember getMemberById(
            Long id) {

        return getAuthorizedMember(id);
    }

    /*
     * ============================================================
     * UPDATE MEMBER
     * ============================================================
     */

    public FamilyMember updateMember(
            Long id,
            FamilyMember updatedMember) {

        FamilyMember existing =
                getAuthorizedMember(id);

        if (existing == null) {
            return null;
        }

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

        /*
         * IMPORTANT:
         *
         * We intentionally do NOT change:
         *
         * existing.setFamily(...)
         *
         * The member must remain in the
         * authenticated user's family.
         */

        return repository.save(existing);
    }

    /*
     * ============================================================
     * UPDATE TREE POSITION
     * ============================================================
     */

    public FamilyMember updatePosition(
            Long id,
            FamilyMember updatedMember) {

        FamilyMember existing =
                getAuthorizedMember(id);

        if (existing == null) {
            return null;
        }

        existing.setPositionX(
                updatedMember.getPositionX()
        );

        existing.setPositionY(
                updatedMember.getPositionY()
        );

        return repository.save(existing);
    }

    /*
     * ============================================================
     * DELETE MEMBER
     * ============================================================
     */

    public void deleteMember(
            Long id) {

        FamilyMember existing =
                getAuthorizedMember(id);

        if (existing == null) {
            return;
        }

        repository.delete(existing);
    }
}