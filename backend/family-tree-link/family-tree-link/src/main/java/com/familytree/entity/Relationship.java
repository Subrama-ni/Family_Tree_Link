package com.familytree.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "relationships")
public class Relationship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "member_one_id")
    private FamilyMember memberOne;

    @ManyToOne
    @JoinColumn(name = "member_two_id")
    private FamilyMember memberTwo;

    private String relationshipType;

    public Relationship() {
    }

    public Long getId() {
        return id;
    }

    public FamilyMember getMemberOne() {
        return memberOne;
    }

    public void setMemberOne(FamilyMember memberOne) {
        this.memberOne = memberOne;
    }

    public FamilyMember getMemberTwo() {
        return memberTwo;
    }

    public void setMemberTwo(FamilyMember memberTwo) {
        this.memberTwo = memberTwo;
    }

    public String getRelationshipType() {
        return relationshipType;
    }

    public void setRelationshipType(String relationshipType) {
        this.relationshipType = relationshipType;
    }
}