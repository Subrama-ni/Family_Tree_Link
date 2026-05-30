package com.familytree.repository;

import com.familytree.entity.Relationship;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RelationshipRepository
        extends JpaRepository<Relationship, Long> {
}