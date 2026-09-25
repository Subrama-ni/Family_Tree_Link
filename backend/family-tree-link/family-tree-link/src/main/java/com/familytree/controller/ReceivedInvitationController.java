package com.familytree.controller;

import java.util.List;

import org.springframework.web.bind.annotation
        .CrossOrigin;
import org.springframework.web.bind.annotation
        .DeleteMapping;
import org.springframework.web.bind.annotation
        .GetMapping;
import org.springframework.web.bind.annotation
        .PathVariable;
import org.springframework.web.bind.annotation
        .PostMapping;
import org.springframework.web.bind.annotation
        .RequestMapping;
import org.springframework.web.bind.annotation
        .RestController;

import com.familytree.entity.FamilyInvitation;
import com.familytree.service.FamilyInvitationService;


@RestController
@RequestMapping("/api/families/received-invitations")

@CrossOrigin(
        origins = "http://localhost:5173"
)
public class ReceivedInvitationController {

    private final FamilyInvitationService
            invitationService;


    public ReceivedInvitationController(
            FamilyInvitationService invitationService) {

        this.invitationService =
                invitationService;
    }


    /*
     * ============================================================
     * GET RECEIVED INVITATIONS
     * ============================================================
     */
    @GetMapping
    public List<FamilyInvitation>
    getReceivedInvitations() {

        return invitationService
                .getReceivedInvitations();
    }


    /*
     * ============================================================
     * ACCEPT INVITATION
     * ============================================================
     */
    @PostMapping("/{id}/accept")
    public FamilyInvitation
    acceptInvitation(
            @PathVariable Long id) {

        return invitationService
                .acceptReceivedInvitation(id);
    }


    /*
     * ============================================================
     * DECLINE INVITATION
     * ============================================================
     */
    @PostMapping("/{id}/decline")
    public FamilyInvitation
    declineInvitation(
            @PathVariable Long id) {

        return invitationService
                .declineInvitation(id);
    }
}