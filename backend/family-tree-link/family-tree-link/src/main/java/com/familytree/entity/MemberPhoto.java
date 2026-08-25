package com.familytree.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "member_photos")
public class MemberPhoto {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    private String imagePath;

    private String caption;

    private String category;

    @ManyToOne
    @JoinColumn(name = "member_id")
    private FamilyMember familyMember;

    public Long getId() {
        return id;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(
            String imagePath) {

        this.imagePath = imagePath;
    }

    public String getCaption() {
        return caption;
    }

    public void setCaption(
            String caption) {

        this.caption = caption;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(
            String category) {

        this.category = category;
    }

    public FamilyMember getFamilyMember() {
        return familyMember;
    }

    public void setFamilyMember(
            FamilyMember familyMember) {

        this.familyMember =
                familyMember;
    }
}