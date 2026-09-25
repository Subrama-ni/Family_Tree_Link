package com.familytree.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.familytree.entity.MemberPhoto;

public interface MemberPhotoRepository
        extends JpaRepository<MemberPhoto, Long> {

    /*
     * ============================================================
     * GET ALL PHOTOS OF A FAMILY MEMBER
     * ============================================================
     */
    List<MemberPhoto> findByFamilyMemberId(
            Long memberId
    );

    /*
     * ============================================================
     * GET ALL PHOTOS OF A FAMILY
     * ============================================================
     */
    List<MemberPhoto> findByFamilyMember_Family_Id(
            Long familyId
    );

    /*
     * ============================================================
     * DELETE ALL PHOTOS OF A FAMILY MEMBER
     * ============================================================
     */
    void deleteByFamilyMemberId(
            Long memberId
    );
}