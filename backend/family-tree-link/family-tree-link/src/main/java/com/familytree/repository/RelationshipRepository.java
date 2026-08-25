package com.familytree.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.familytree.entity.Relationship;

public interface RelationshipRepository
        extends JpaRepository<Relationship, Long> {

    List<Relationship>
    findByMemberOne_Family_IdOrMemberTwo_Family_Id(
            Long memberOneFamilyId,
            Long memberTwoFamilyId
    );
}