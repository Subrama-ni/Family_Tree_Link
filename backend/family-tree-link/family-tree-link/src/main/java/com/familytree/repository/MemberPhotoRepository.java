package com.familytree.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.familytree.entity.MemberPhoto;

public interface MemberPhotoRepository
        extends JpaRepository<MemberPhoto, Long> {

    List<MemberPhoto>
    findByFamilyMemberId(
            Long memberId
    );

    List<MemberPhoto>
    findByFamilyMember_Family_Id(
            Long familyId
    );

    List<MemberPhoto>
    findByFamilyMember_Family_IdAndCategory(
            Long familyId,
            String category
    );

    List<MemberPhoto>
    findByFamilyMember_Family_IdAndId(
            Long familyId,
            Long id
    );
}