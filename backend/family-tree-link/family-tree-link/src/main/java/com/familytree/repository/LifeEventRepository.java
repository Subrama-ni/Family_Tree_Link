package com.familytree.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.familytree.entity.LifeEvent;

public interface LifeEventRepository
        extends JpaRepository
        <LifeEvent, Long> {
}