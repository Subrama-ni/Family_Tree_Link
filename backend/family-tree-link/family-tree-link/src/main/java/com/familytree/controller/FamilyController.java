package com.familytree.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.familytree.dto.FamilyResponse;
import com.familytree.service.FamilyService;

@RestController
@RequestMapping("/api/families")
@CrossOrigin(origins = "http://localhost:5173")
public class FamilyController {

    private final FamilyService service;

    public FamilyController(
            FamilyService service) {

        this.service = service;
    }

    /*
     * ============================================================
     * GET CURRENT USER'S FAMILY
     * ============================================================
     */

    @GetMapping("/current")
    public FamilyResponse getCurrentFamily() {

        return service.getCurrentFamily();
    }
}