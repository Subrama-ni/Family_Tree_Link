package com.familytree.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "family_invitations")
public class FamilyInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * The family to which the person is being invited.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "family_id", nullable = false)
    @JsonIgnore
    private Family family;

    /*
     * Email address to which the invitation belongs.
     */
    @Column(nullable = false)
    private String invitedEmail;

    /*
     * User who sent the invitation.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by_id", nullable = false)
    @JsonIgnore
    private User invitedBy;

    /*
     * Secure invitation token.
     */
    @Column(nullable = false, unique = true, length = 100)
    private String token;

    /*
     * PENDING / ACCEPTED / DECLINED / EXPIRED
     */
    @Column(nullable = false)
    private String status;

    /*
     * Invitation expiration time.
     */
    @Column(nullable = false)
    private LocalDateTime expiresAt;

    /*
     * Time at which invitation was created.
     */
    @Column(nullable = false)
    private LocalDateTime createdAt;

    /*
     * Time at which invitation was accepted.
     */
    private LocalDateTime acceptedAt;

    public FamilyInvitation() {
    }

    public Long getId() {
        return id;
    }

    public Family getFamily() {
        return family;
    }

    public void setFamily(Family family) {
        this.family = family;
    }

    public String getInvitedEmail() {
        return invitedEmail;
    }

    public void setInvitedEmail(String invitedEmail) {
        this.invitedEmail = invitedEmail;
    }

    public User getInvitedBy() {
        return invitedBy;
    }

    public void setInvitedBy(User invitedBy) {
        this.invitedBy = invitedBy;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getAcceptedAt() {
        return acceptedAt;
    }

    public void setAcceptedAt(LocalDateTime acceptedAt) {
        this.acceptedAt = acceptedAt;
    }
}