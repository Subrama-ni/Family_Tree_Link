package com.familytree.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.familytree.entity.Relationship;
import com.familytree.service.RelationshipService;

@RestController
@RequestMapping("/api/relationships")
public class RelationshipController {

    private final RelationshipService service;

    public RelationshipController(
            RelationshipService service) {

        this.service = service;
    }

    /*
     * ============================================================
     * ADD RELATIONSHIP
     * ============================================================
     */

    @PostMapping
    public Relationship addRelationship(
            @RequestBody Relationship relationship) {

        return service.addRelationship(
                relationship
        );
    }

    /*
     * ============================================================
     * GET CURRENT FAMILY RELATIONSHIPS
     * ============================================================
     */

    @GetMapping
    public List<Relationship>
    getAllRelationships() {

        return service.getAllRelationships();
    }

    /*
     * ============================================================
     * UPDATE RELATIONSHIP
     * ============================================================
     */

    @PutMapping("/{id}")
    public Relationship updateRelationship(
            @PathVariable Long id,
            @RequestBody Relationship relationship) {

        return service.updateRelationship(
                id,
                relationship
        );
    }

    /*
     * ============================================================
     * DELETE RELATIONSHIP
     * ============================================================
     */

    @DeleteMapping("/{id}")
    public void deleteRelationship(
            @PathVariable Long id) {

        service.deleteRelationship(id);
    }
}