package com.familytree.controller;

import java.io.File;
import java.io.IOException;
import java.util.List;

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

import com.familytree.entity.MemberPhoto;
import com.familytree.service.MemberPhotoService;

@RestController
@RequestMapping("/api/photos")
public class MemberPhotoController {

    private final MemberPhotoService service;

    public MemberPhotoController(
            MemberPhotoService service) {

        this.service = service;
    }

    /*
     * ============================================================
     * ADD PHOTO RECORD
     * ============================================================
     */

    @PostMapping
    public MemberPhoto addPhoto(
            @RequestBody MemberPhoto photo) {

        return service.addPhoto(photo);
    }

    /*
     * ============================================================
     * UPLOAD IMAGE
     * ============================================================
     */

    @PostMapping("/upload")
    public String uploadPhoto(
            @RequestParam("file")
            MultipartFile file,

            @RequestParam("memberId")
            Long memberId)
            throws IOException {

        /*
         * This validates that the selected member
         * belongs to the logged-in user's family.
         */
        service.getPhotosByMember(memberId);

        if (file == null
                || file.isEmpty()) {

            throw new IllegalArgumentException(
                    "Image file is required"
            );
        }

        String uploadDir =
                System.getProperty("user.dir")
                        + "/uploads/";

        File directory =
                new File(uploadDir);

        if (!directory.exists()) {

            directory.mkdirs();
        }

        String originalFileName =
                file.getOriginalFilename();

        String fileName =
                System.currentTimeMillis()
                        + "_"
                        + originalFileName;

        File destination =
                new File(
                        uploadDir + fileName
                );

        file.transferTo(destination);

        return fileName;
    }

    /*
     * ============================================================
     * UPDATE PHOTO
     * ============================================================
     */

    @PutMapping("/{id}")
    public MemberPhoto updatePhoto(
            @PathVariable Long id,
            @RequestBody MemberPhoto photo) {

        return service.updatePhoto(
                id,
                photo
        );
    }

    /*
     * ============================================================
     * GET ALL PHOTOS
     * ============================================================
     */

    @GetMapping
    public List<MemberPhoto> getAllPhotos() {

        return service.getAllPhotos();
    }

    /*
     * ============================================================
     * GET PHOTOS BY MEMBER
     * ============================================================
     */

    @GetMapping("/member/{id}")
    public List<MemberPhoto>
    getPhotosByMember(
            @PathVariable Long id) {

        return service.getPhotosByMember(id);
    }

    /*
     * ============================================================
     * DELETE PHOTO
     * ============================================================
     */

    @DeleteMapping("/{id}")
    public void deletePhoto(
            @PathVariable Long id) {

        service.deletePhoto(id);
    }
}