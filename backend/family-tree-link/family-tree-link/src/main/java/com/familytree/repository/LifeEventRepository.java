package com.familytree.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.familytree.entity.LifeEvent;

public interface LifeEventRepository
        extends JpaRepository<LifeEvent, Long> {

    List<LifeEvent>
    findByFamilyMember_Family_Id(
            Long familyId
    );
}