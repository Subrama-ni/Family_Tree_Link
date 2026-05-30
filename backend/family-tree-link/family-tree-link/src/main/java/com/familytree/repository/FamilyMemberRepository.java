package com.familytree.repository;

import com.familytree.entity.FamilyMember;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FamilyMemberRepository
        extends JpaRepository<FamilyMember, Long> {
}