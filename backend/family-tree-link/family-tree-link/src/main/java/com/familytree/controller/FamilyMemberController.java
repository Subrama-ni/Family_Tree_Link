package com.familytree.controller;

import java.io.File;
import java.io.IOException;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.familytree.entity.FamilyMember;
import com.familytree.service.FamilyMemberService;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "http://localhost:5173")
public class FamilyMemberController {

    private final FamilyMemberService service;

    public FamilyMemberController(
            FamilyMemberService service) {

        this.service = service;
    }

    @PostMapping
    public FamilyMember addMember(
            @RequestBody FamilyMember member) {

        return service.addMember(member);
    }

@PutMapping("/{id}")
public FamilyMember updateMember(

        @PathVariable Long id,

        @RequestBody
        FamilyMember member) {

    return service.updateMember(
            id,
            member);
}
@DeleteMapping("/{id}")
public void deleteMember(
        @PathVariable Long id) {

    service.deleteMember(id);
}
@GetMapping("/{id}")
public FamilyMember getMemberById(
        @PathVariable Long id) {

    return service.getMemberById(id);
}
@GetMapping
    public List<FamilyMember> getAllMembers() {

        return service.getAllMembers();
    }

    @PutMapping("/{id}/position")
    public FamilyMember updatePosition(
            @PathVariable Long id,
            @RequestBody FamilyMember updatedMember) {

        FamilyMember member =
                service.getMemberById(id);

        member.setPositionX(
                updatedMember.getPositionX());

        member.setPositionY(
                updatedMember.getPositionY());

        return service.addMember(member);
    }

    @PostMapping("/upload")
public String uploadImage(
        @RequestParam("file")
        MultipartFile file)
        throws IOException {

    String uploadDir =
            System.getProperty("user.dir")
            + "/uploads/";

    File directory =
            new File(uploadDir);

    if (!directory.exists()) {

        directory.mkdirs();
    }

    String fileName =
            file.getOriginalFilename();

    String filePath =
            uploadDir + fileName;

    file.transferTo(
            new File(filePath));

    return fileName;
}
}