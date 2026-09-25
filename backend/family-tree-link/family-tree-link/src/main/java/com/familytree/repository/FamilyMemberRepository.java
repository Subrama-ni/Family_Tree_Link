package com.familytree.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.familytree.entity.FamilyMember;

public interface FamilyMemberRepository
        extends JpaRepository<FamilyMember, Long> {

    List<FamilyMember> findByFamilyId(Long familyId);

    Optional<FamilyMember> findByUser_Id(Long userId);
}