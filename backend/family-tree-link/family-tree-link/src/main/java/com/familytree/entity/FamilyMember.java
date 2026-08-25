package com.familytree.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "family_members")
public class FamilyMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;

    private String gender;

    private LocalDate dateOfBirth;

    @Column(columnDefinition = "TEXT")
    private String biography;

    private String occupation;

    private String imagePath;
    private Double positionX;

    @ManyToOne
private Family family;

private Double positionY;
    public FamilyMember() {
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getBiography() {
        return biography;
    }

    public void setBiography(String biography) {
        this.biography = biography;
    }

    public String getOccupation() {
        return occupation;
    }

    public void setOccupation(String occupation) {
        this.occupation = occupation;
    }

    public String getImagePath() {
    return imagePath;
}

public void setImagePath(String imagePath) {
    this.imagePath = imagePath;
}
public Double getPositionX() {
    return positionX;
}

public void setPositionX(Double positionX) {
    this.positionX = positionX;
}

public Double getPositionY() {
    return positionY;
}

public void setPositionY(Double positionY) {
    this.positionY = positionY;
}

public Family getFamily() {
    return family;
}

public void setFamily(Family family) {
    this.family = family;
}
}