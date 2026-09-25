package com.familytree.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.familytree.dto.FamilyLeaveSettingRequest;
import com.familytree.dto.FamilySettingsResponse;
import com.familytree.dto.UpdateFamilySettingsRequest;
import com.familytree.entity.FamilySettings;
import com.familytree.service.FamilySettingsService;

@RestController
@RequestMapping("/api/families/settings")
@CrossOrigin(origins = "http://localhost:5173")
public class FamilySettingsController {

    private final FamilySettingsService service;

    public FamilySettingsController(
            FamilySettingsService service) {

        this.service = service;
    }

    /*
     * ============================================================
     * GET FAMILY SETTINGS
     * ============================================================
     *
     * GET
     * /api/families/settings
     */

    @GetMapping
    public ResponseEntity<FamilySettingsResponse> getSettings() {

        return ResponseEntity.ok(
                service.getSettings()
        );
    }

    /*
     * ============================================================
     * UPDATE FAMILY SETTINGS
     * ============================================================
     *
     * PUT
     * /api/families/settings
     */

    @PutMapping
    public ResponseEntity<FamilySettingsResponse> updateSettings(
            @RequestBody
            UpdateFamilySettingsRequest request) {

        return ResponseEntity.ok(
                service.updateSettings(request)
        );
    }

    /*
     * ============================================================
     * UPDATE MEMBERS CAN LEAVE FAMILY
     * ============================================================
     *
     * PUT
     * /api/families/settings/members-can-leave
     */

    @PutMapping("/members-can-leave")
    public ResponseEntity<FamilySettings> updateMembersCanLeaveFamily(
            @RequestBody
            FamilyLeaveSettingRequest request) {

        return ResponseEntity.ok(
                service.updateMembersCanLeaveFamily(
                        request.isEnabled()
                )
        );
    }
}