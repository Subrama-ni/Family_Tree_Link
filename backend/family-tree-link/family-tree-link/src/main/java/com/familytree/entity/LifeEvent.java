package com.familytree.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "life_events")
public class LifeEvent {

    @Id
    @GeneratedValue(strategy =
            GenerationType.IDENTITY)

    private Long id;
    private String eventType;

    private String title;
    public String getEventType() {
    return eventType;
}

public void setEventType(
        String eventType) {

    this.eventType = eventType;
}

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate eventDate;

    @ManyToOne
    @JoinColumn(name =
            "family_member_id")

    private FamilyMember familyMember;

    public LifeEvent() {
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(
            String title) {

        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description) {

        this.description = description;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public void setEventDate(
            LocalDate eventDate) {

        this.eventDate = eventDate;
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