package com.familytree.dto;

public class FamilyMembershipResponse {

    private Long userId;
    private String name;
    private String email;
    private boolean owner;

    public FamilyMembershipResponse() {
    }

    public FamilyMembershipResponse(
            Long userId,
            String name,
            String email,
            boolean owner) {

        this.userId = userId;
        this.name = name;
        this.email = email;
        this.owner = owner;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isOwner() {
        return owner;
    }

    public void setOwner(boolean owner) {
        this.owner = owner;
    }
}