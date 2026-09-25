package com.familytree.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "relationships")
public class Relationship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * ============================================================
     * FIRST FAMILY MEMBER
     * ============================================================
     */

    @ManyToOne
    @JoinColumn(
            name = "member_one_id",
            nullable = false
    )
    private FamilyMember memberOne;

    /*
     * ============================================================
     * SECOND FAMILY MEMBER
     * ============================================================
     */

    @ManyToOne
    @JoinColumn(
            name = "member_two_id",
            nullable = false
    )
    private FamilyMember memberTwo;

    /*
     * ============================================================
     * RELATIONSHIP TYPE
     * ============================================================
     *
     * Examples:
     *
     * Parent
     * Child
     * Spouse
     * Sibling
     * Grandparent
     * Grandchild
     * Uncle
     * Aunt
     * Cousin
     */

    private String relationshipType;

    /*
     * ============================================================
     * CONSTRUCTOR
     * ============================================================
     */

    public Relationship() {
    }

    /*
     * ============================================================
     * GET ID
     * ============================================================
     */

    public Long getId() {
        return id;
    }

    /*
     * ============================================================
     * MEMBER ONE
     * ============================================================
     */

    public FamilyMember getMemberOne() {
        return memberOne;
    }

    public void setMemberOne(
            FamilyMember memberOne) {

        this.memberOne = memberOne;
    }

    /*
     * ============================================================
     * MEMBER TWO
     * ============================================================
     */

    public FamilyMember getMemberTwo() {
        return memberTwo;
    }

    public void setMemberTwo(
            FamilyMember memberTwo) {

        this.memberTwo = memberTwo;
    }

    /*
     * ============================================================
     * RELATIONSHIP TYPE
     * ============================================================
     */

    public String getRelationshipType() {
        return relationshipType;
    }

    public void setRelationshipType(
            String relationshipType) {

        this.relationshipType =
                relationshipType;
    }
}