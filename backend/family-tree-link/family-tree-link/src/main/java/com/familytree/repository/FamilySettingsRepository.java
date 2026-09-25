package com.familytree.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.familytree.entity.Family;
import com.familytree.entity.FamilySettings;

public interface FamilySettingsRepository
        extends JpaRepository<FamilySettings, Long> {

    Optional<FamilySettings> findByFamily(Family family);

    Optional<FamilySettings> findByFamilyId(Long familyId);
}