package com.familytree.service;

import java.io.File;
import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.familytree.entity.Family;
import com.familytree.entity.FamilyMember;
import com.familytree.entity.MemberPhoto;
import com.familytree.entity.User;
import com.familytree.repository.FamilyMemberRepository;
import com.familytree.repository.MemberPhotoRepository;
import com.familytree.repository.UserRepository;

@Service
public class MemberPhotoService {

    private final MemberPhotoRepository repository;

    private final FamilyMemberRepository familyMemberRepository;

    private final UserRepository userRepository;

    public MemberPhotoService(
            MemberPhotoRepository repository,
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
     * CURRENT FAMILY
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
     * AUTHORIZED MEMBER
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
     * AUTHORIZED PHOTO
     * ============================================================
     */

    private MemberPhoto getAuthorizedPhoto(
            Long id) {

        Family currentFamily =
                getCurrentFamily();

        MemberPhoto photo =
                repository.findById(id)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Photo not found"
                                )
                        );

        if (photo.getFamilyMember() == null
                || photo.getFamilyMember()
                        .getFamily() == null
                || !photo.getFamilyMember()
                        .getFamily()
                        .getId()
                        .equals(
                                currentFamily.getId()
                        )) {

            throw new AccessDeniedException(
                    "You do not have access to this photo"
            );
        }

        return photo;
    }

    /*
     * ============================================================
     * ADD PHOTO
     * ============================================================
     */

    public MemberPhoto addPhoto(
            MemberPhoto photo) {

        if (photo.getFamilyMember() == null
                || photo.getFamilyMember().getId() == null) {

            throw new IllegalArgumentException(
                    "Family member is required"
            );
        }

        FamilyMember member =
                getAuthorizedMember(
                        photo.getFamilyMember().getId()
                );

        photo.setFamilyMember(member);

        return repository.save(photo);
    }

    /*
     * ============================================================
     * GET ALL PHOTOS
     * ============================================================
     */

    public List<MemberPhoto> getAllPhotos() {

        Family currentFamily =
                getCurrentFamily();

        return repository
                .findByFamilyMember_Family_Id(
                        currentFamily.getId()
                );
    }

    /*
     * ============================================================
     * GET PHOTOS BY MEMBER
     * ============================================================
     */

    public List<MemberPhoto>
    getPhotosByMember(
            Long memberId) {

        /*
         * Verify the member belongs to the
         * authenticated user's family.
         */
        getAuthorizedMember(memberId);

        return repository
                .findByFamilyMemberId(
                        memberId
                );
    }

    /*
     * ============================================================
     * UPDATE PHOTO
     * ============================================================
     */

    public MemberPhoto updatePhoto(
            Long id,
            MemberPhoto photo) {

        MemberPhoto existing =
                getAuthorizedPhoto(id);

        if (photo.getFamilyMember() == null
                || photo.getFamilyMember().getId() == null) {

            throw new IllegalArgumentException(
                    "Family member is required"
            );
        }

        FamilyMember member =
                getAuthorizedMember(
                        photo.getFamilyMember().getId()
                );

        existing.setCaption(
                photo.getCaption()
        );

        existing.setCategory(
                photo.getCategory()
        );

        existing.setImagePath(
                photo.getImagePath()
        );

        existing.setFamilyMember(
                member
        );

        return repository.save(existing);
    }

    /*
     * ============================================================
     * DELETE PHOTO
     * ============================================================
     */

    public void deletePhoto(
            Long id) {

        MemberPhoto photo =
                getAuthorizedPhoto(id);

        String imagePath =
                photo.getImagePath();

        repository.delete(photo);

        /*
         * Delete the physical image after
         * successfully deleting the database record.
         */
        if (imagePath != null
                && !imagePath.isBlank()) {

            String uploadDir =
                    System.getProperty("user.dir")
                            + "/uploads/";

            File imageFile =
                    new File(
                            uploadDir + imagePath
                    );

            if (imageFile.exists()) {

                imageFile.delete();
            }
        }
    }
}