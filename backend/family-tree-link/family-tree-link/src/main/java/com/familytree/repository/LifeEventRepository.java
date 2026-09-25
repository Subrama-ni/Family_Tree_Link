package com.familytree.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.familytree.entity.LifeEvent;

public interface LifeEventRepository
        extends JpaRepository<LifeEvent, Long> {

    /*
     * ============================================================
     * GET ALL EVENTS OF A FAMILY MEMBER
     * ============================================================
     */
    List<LifeEvent> findByFamilyMemberId(Long familyMemberId);

    /*
     * ============================================================
     * GET ALL EVENTS OF A FAMILY
     * ============================================================
     */
    List<LifeEvent> findByFamilyMember_Family_Id(Long familyId);

    /*
     * ============================================================
     * DELETE ALL EVENTS OF A FAMILY MEMBER
     * ============================================================
     */
    void deleteByFamilyMemberId(Long familyMemberId);
}