package com.familytree.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.familytree.dto.FamilyMembershipResponse;
import com.familytree.service.FamilyMembershipService;

@RestController
@RequestMapping("/api/families/membership")
@CrossOrigin(origins = "http://localhost:5173")
public class FamilyMembershipController {

    private final FamilyMembershipService membershipService;

    public FamilyMembershipController(
            FamilyMembershipService membershipService) {

        this.membershipService = membershipService;
    }

    /*
     * ============================================================
     * GET FAMILY MEMBERSHIP
     * ============================================================
     *
     * GET /api/families/membership
     */

    @GetMapping
    public ResponseEntity<List<FamilyMembershipResponse>>
    getMembership() {

        return ResponseEntity.ok(
                membershipService.getMembership()
        );
    }

    /*
     * ============================================================
     * REMOVE MEMBER
     * ============================================================
     *
     * POST /api/families/membership/{userId}/remove
     */

    @PostMapping("/{userId}/remove")
    public ResponseEntity<String> removeMember(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                membershipService.removeMember(userId)
        );
    }

    /*
     * ============================================================
     * LEAVE FAMILY
     * ============================================================
     *
     * POST /api/families/membership/leave
     */

    @PostMapping("/leave")
    public ResponseEntity<String> leaveFamily() {

        return ResponseEntity.ok(
                membershipService.leaveFamily()
        );
    }
}