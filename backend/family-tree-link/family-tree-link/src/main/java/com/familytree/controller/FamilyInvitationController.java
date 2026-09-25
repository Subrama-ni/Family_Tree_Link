package com.familytree.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.familytree.entity.FamilyInvitation;
import com.familytree.service.FamilyInvitationService;

@RestController
@RequestMapping("/api/families/invitations")
@CrossOrigin(origins = "http://localhost:5173")
public class FamilyInvitationController {

    private final FamilyInvitationService service;

    public FamilyInvitationController(
            FamilyInvitationService service) {

        this.service = service;
    }

    /*
     * ============================================================
     * CREATE FAMILY INVITATION
     * ============================================================
     */

    @PostMapping
    public ResponseEntity<FamilyInvitation> createInvitation(
            @RequestBody InvitationRequest request) {

        FamilyInvitation invitation =
                service.createInvitation(
                        request.getEmail()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(invitation);
    }

    /*
     * ============================================================
     * GET CURRENT FAMILY INVITATIONS
     * ============================================================
     */

    @GetMapping
    public ResponseEntity<List<FamilyInvitation>>
    getCurrentFamilyInvitations() {

        return ResponseEntity.ok(
                service.getCurrentFamilyInvitations()
        );
    }

    /*
     * ============================================================
     * GET INVITATION BY TOKEN
     * ============================================================
     */

    @GetMapping("/token/{token}")
    public ResponseEntity<FamilyInvitation>
    getInvitationByToken(
            @PathVariable String token) {

        return ResponseEntity.ok(
                service.getInvitationByToken(token)
        );
    }

    /*
     * ============================================================
     * ACCEPT INVITATION BY TOKEN
     * ============================================================
     *
     * POST
     * /api/families/invitations/token/{token}/accept
     */

    @PostMapping("/token/{token}/accept")
    public ResponseEntity<FamilyInvitation>
    acceptInvitationByToken(
            @PathVariable String token) {

        FamilyInvitation invitation =
                service.acceptInvitation(token);

        return ResponseEntity.ok(invitation);
    }

    /*
     * ============================================================
     * GET RECEIVED INVITATIONS
     * ============================================================
     *
     * GET
     * /api/families/invitations/received
     */

    @GetMapping("/received")
    public ResponseEntity<List<FamilyInvitation>>
    getReceivedInvitations() {

        return ResponseEntity.ok(
                service.getReceivedInvitations()
        );
    }

    /*
     * ============================================================
     * ACCEPT RECEIVED INVITATION BY ID
     * ============================================================
     *
     * POST
     * /api/families/invitations/{invitationId}/accept
     */

    @PostMapping("/{invitationId}/accept")
    public ResponseEntity<FamilyInvitation>
    acceptReceivedInvitation(
            @PathVariable Long invitationId) {

        FamilyInvitation invitation =
                service.acceptReceivedInvitation(
                        invitationId
                );

        return ResponseEntity.ok(invitation);
    }

    /*
     * ============================================================
     * DECLINE RECEIVED INVITATION BY ID
     * ============================================================
     *
     * POST
     * /api/families/invitations/{invitationId}/decline
     */

    @PostMapping("/{invitationId}/decline")
    public ResponseEntity<FamilyInvitation>
    declineReceivedInvitation(
            @PathVariable Long invitationId) {

        FamilyInvitation invitation =
                service.declineInvitation(
                        invitationId
                );

        return ResponseEntity.ok(invitation);
    }

    /*
     * ============================================================
     * REQUEST DTO
     * ============================================================
     */

    public static class InvitationRequest {

        private String email;

        public InvitationRequest() {
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }
}