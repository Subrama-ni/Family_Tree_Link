package com.familytree.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.familytree.entity.MemberPhoto;
import com.familytree.repository.MemberPhotoRepository;

@Service
public class MemberPhotoService {

    private final MemberPhotoRepository repository;

    public MemberPhotoService(
            MemberPhotoRepository repository) {

        this.repository = repository;
    }

    public MemberPhoto addPhoto(
            MemberPhoto photo) {

        return repository.save(photo);
    }

    public List<MemberPhoto> getAllPhotos() {

        return repository.findAll();
    }

    public List<MemberPhoto>
    getPhotosByMember(
            Long memberId) {

        return repository
                .findByFamilyMemberId(
                        memberId);
    }

    public void deletePhoto(
            Long id) {

        repository.deleteById(id);
    }
    public MemberPhoto updatePhoto(

        Long id,

        MemberPhoto photo) {

    MemberPhoto existing =
            repository.findById(id)
            .orElseThrow();

    existing.setCaption(
            photo.getCaption());

    existing.setCategory(
            photo.getCategory());

    existing.setImagePath(
            photo.getImagePath());

    existing.setFamilyMember(
            photo.getFamilyMember());

    return repository.save(
            existing);
}
}