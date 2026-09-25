package com.familytree.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.familytree.dto.CreateFamilyRequest;
import com.familytree.dto.FamilyMemberOptionDTO;
import com.familytree.dto.FamilyResponse;
import com.familytree.dto.FamilyUpdateDTO;
import com.familytree.dto.TransferOwnershipRequest;
import com.familytree.entity.User;
import com.familytree.repository.UserRepository;
import com.familytree.service.FamilyService;

@RestController
@RequestMapping("/api/families")
@CrossOrigin(origins = "http://localhost:5173")
public class FamilyController {

    private final FamilyService service;
    private final UserRepository userRepository;

    public FamilyController(
            FamilyService service,
            UserRepository userRepository) {

        this.service = service;
        this.userRepository = userRepository;
    }

    /*
     * ============================================================
     * CURRENT FAMILY
     * ============================================================
     */

    @GetMapping("/current")
    public FamilyResponse getCurrentFamily() {

        return service.getCurrentFamily();
    }

    /*
     * ============================================================
     * CREATE FAMILY
     * ============================================================
     */

    @PostMapping
    public ResponseEntity<FamilyResponse> createFamily(
            @RequestBody CreateFamilyRequest request) {

        FamilyResponse response =
                service.createFamily(request);

        return ResponseEntity.ok(response);
    }

    /*
     * ============================================================
     * LEAVE FAMILY
     * ============================================================
     */

    @PostMapping("/leave")
    public ResponseEntity<?> leaveFamily(
            Authentication authentication) {

        try {

            String email =
                    authentication.getName();

            User currentUser =
                    userRepository
                            .findByEmail(email)
                            .orElseThrow(
                                    () -> new RuntimeException(
                                            "User not found"
                                    )
                            );

            service.leaveFamily(currentUser);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "You have successfully left the family"
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }

    /*
     * ============================================================
     * UPDATE FAMILY
     * ============================================================
     */

    @PutMapping("/current")
    public ResponseEntity<?> updateFamily(
            @RequestBody FamilyUpdateDTO request,
            Authentication authentication) {

        try {

            FamilyResponse response =
                    service.updateFamily(request);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }

    /*
     * ============================================================
     * CURRENT FAMILY MEMBERS
     * ============================================================
     */

    @GetMapping("/members")
    public ResponseEntity<List<FamilyMemberOptionDTO>>
    getCurrentFamilyMembers() {

        return ResponseEntity.ok(
                service.getCurrentFamilyMembers()
        );
    }

    /*
     * ============================================================
     * REMOVE MEMBER FROM FAMILY
     * ============================================================
     *
     * IMPORTANT:
     *
     * The {id} here is the FamilyMember ID.
     *
     * The associated User account is NOT deleted.
     */

    @DeleteMapping("/members/{id}")
    public ResponseEntity<?> removeMemberFromFamily(
            @PathVariable Long id) {

        try {

            service.removeMemberFromFamily(id);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Member removed from the family successfully"
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }

    /*
     * ============================================================
     * TRANSFER OWNERSHIP
     * ============================================================
     */

    @PostMapping("/transfer-ownership")
    public ResponseEntity<FamilyResponse>
    transferOwnership(
            @RequestBody TransferOwnershipRequest request) {

        FamilyResponse response =
                service.transferOwnership(
                        request.getNewOwnerId()
                );

        return ResponseEntity.ok(response);
    }
}