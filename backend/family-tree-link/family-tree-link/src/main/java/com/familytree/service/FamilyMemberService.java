package com.familytree.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.familytree.entity.FamilyMember;
import com.familytree.repository.FamilyMemberRepository;

@Service
public class FamilyMemberService {

    private final FamilyMemberRepository repository;

    public FamilyMemberService(FamilyMemberRepository repository) {
        this.repository = repository;
    }

    public FamilyMember addMember(FamilyMember member) {
        return repository.save(member);
    }

    public List<FamilyMember> getAllMembers() {
        return repository.findAll();
    }
    public FamilyMember getMemberById(Long id) {
    return repository.findById(id).orElse(null);
}
public FamilyMember updateMember(
        Long id,
        FamilyMember updatedMember) {

    FamilyMember existing =
            repository.findById(id)
            .orElse(null);

    if (existing != null) {

        existing.setFullName(
                updatedMember.getFullName());

        existing.setGender(
                updatedMember.getGender());

        existing.setDateOfBirth(
                updatedMember.getDateOfBirth());

        existing.setBiography(
                updatedMember.getBiography());

        existing.setOccupation(
                updatedMember.getOccupation());

        existing.setImagePath(
                updatedMember.getImagePath());

        return repository.save(existing);
    }

    return null;
}
public void deleteMember(
        Long id) {

    repository.deleteById(id);
}

}