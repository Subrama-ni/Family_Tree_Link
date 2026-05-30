package com.familytree.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.familytree.entity.MemberPhoto;

public interface MemberPhotoRepository
        extends JpaRepository<MemberPhoto, Long> {

    List<MemberPhoto>
    findByFamilyMemberId(
            Long memberId);
}