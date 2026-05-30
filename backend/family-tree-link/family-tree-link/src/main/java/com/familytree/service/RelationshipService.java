package com.familytree.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.familytree.entity.Relationship;
import com.familytree.repository.RelationshipRepository;

@Service
public class RelationshipService {

    private final RelationshipRepository repository;

    public RelationshipService(
            RelationshipRepository repository) {

        this.repository = repository;
    }

    public Relationship addRelationship(
            Relationship relationship) {

        return repository.save(
                relationship);
    }

    public List<Relationship>
    getAllRelationships() {

        return repository.findAll();
    }

    public Relationship updateRelationship(
            Long id,
            Relationship relationship) {

        Relationship existing =
                repository.findById(id)
                        .orElseThrow();

        existing.setRelationshipType(
                relationship.getRelationshipType());

        existing.setMemberOne(
                relationship.getMemberOne());

        existing.setMemberTwo(
                relationship.getMemberTwo());

        return repository.save(existing);
    }

    public void deleteRelationship(
            Long id) {

        repository.deleteById(id);
    }
}