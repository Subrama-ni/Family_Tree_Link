package com.familytree.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.familytree.entity.Family;

public interface FamilyRepository
        extends JpaRepository<Family, Long> {
}