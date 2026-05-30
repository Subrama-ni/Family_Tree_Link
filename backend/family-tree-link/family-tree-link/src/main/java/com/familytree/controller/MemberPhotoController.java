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

import com.familytree.entity.MemberPhoto;
import com.familytree.service.MemberPhotoService;

@RestController
@RequestMapping("/api/photos")
@CrossOrigin(origins =
        "http://localhost:5173")
public class MemberPhotoController {

    private final MemberPhotoService service;

    public MemberPhotoController(
            MemberPhotoService service) {

        this.service = service;
    }

    @PostMapping
    public MemberPhoto addPhoto(
            @RequestBody MemberPhoto photo) {

        return service.addPhoto(photo);
    }
    @PostMapping("/upload")
public String uploadPhoto(

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
            System.currentTimeMillis()
            + "_"
            + file.getOriginalFilename();

    file.transferTo(

            new File(
                    uploadDir
                    + fileName)

    );

    return fileName;
}
@PutMapping("/{id}")
public MemberPhoto updatePhoto(

        @PathVariable Long id,

        @RequestBody
        MemberPhoto photo) {

    return service.updatePhoto(
            id,
            photo);
}

    @GetMapping
    public List<MemberPhoto> getAllPhotos() {

        return service.getAllPhotos();
    }

    @GetMapping("/member/{id}")
    public List<MemberPhoto>
    getPhotosByMember(
            @PathVariable Long id) {

        return service.getPhotosByMember(id);
    }

    @DeleteMapping("/{id}")
    public void deletePhoto(
            @PathVariable Long id) {

        service.deletePhoto(id);
    }
}