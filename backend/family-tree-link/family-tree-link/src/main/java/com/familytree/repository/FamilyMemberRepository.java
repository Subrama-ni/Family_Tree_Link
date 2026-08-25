package com.familytree.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.familytree.entity.FamilyMember;

public interface FamilyMemberRepository
        extends JpaRepository<FamilyMember, Long> {

    List<FamilyMember> findByFamilyId(
            Long familyId
    );
}