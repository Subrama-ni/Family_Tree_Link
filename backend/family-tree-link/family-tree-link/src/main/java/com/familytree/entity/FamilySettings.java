package com.familytree.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "family_settings")
public class FamilySettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * ============================================================
     * FAMILY
     * ============================================================
     *
     * Each family has exactly one settings record.
     */

    @OneToOne
    @JoinColumn(
            name = "family_id",
            nullable = false,
            unique = true
    )
    private Family family;

    /*
     * ============================================================
     * FAMILY INFORMATION
     * ============================================================
     */

    @Column(nullable = false)
    private boolean familyProfileVisible = true;

    /*
     * ============================================================
     * MEMBER PERMISSIONS
     * ============================================================
     */

    /*
     * Can normal family members invite other people?
     */
    @Column(nullable = false)
    private boolean membersCanInvite = true;

    /*
     * Can normal family members edit family information?
     */
    @Column(nullable = false)
    private boolean membersCanEditFamily = false;

    /*
     * Can normal family members add/edit family members?
     */
    @Column(nullable = false)
    private boolean membersCanManageMembers = false;

    @Column(nullable = false)
private boolean membersCanLeaveFamily = true;

    /*
     * ============================================================
     * NOTIFICATIONS
     * ============================================================
     */

    /*
     * New family member notification.
     */
    @Column(nullable = false)
    private boolean newMemberNotifications = true;

    /*
     * Birthday notifications.
     */
    @Column(nullable = false)
    private boolean birthdayNotifications = true;

    /*
     * Anniversary notifications.
     */
    @Column(nullable = false)
    private boolean anniversaryNotifications = true;

    /*
     * Family event notifications.
     */
    @Column(nullable = false)
    private boolean eventNotifications = true;

    /*
     * ============================================================
     * WHATSAPP
     * ============================================================
     *
     * We are preparing these fields now.
     *
     * Actual WhatsApp connection will be implemented later.
     */

    @Column(nullable = false)
    private boolean whatsappNotifications = false;

    /*
     * ============================================================
     * CONSTRUCTORS
     * ============================================================
     */

    public FamilySettings() {
    }

    public FamilySettings(Family family) {
        this.family = family;
    }

    /*
     * ============================================================
     * GETTERS AND SETTERS
     * ============================================================
     */

    public Long getId() {
        return id;
    }

    public Family getFamily() {
        return family;
    }

    public void setFamily(Family family) {
        this.family = family;
    }

    public boolean isFamilyProfileVisible() {
        return familyProfileVisible;
    }

    public void setFamilyProfileVisible(
            boolean familyProfileVisible) {

        this.familyProfileVisible =
                familyProfileVisible;
    }

    public boolean isMembersCanInvite() {
        return membersCanInvite;
    }

    public void setMembersCanInvite(
            boolean membersCanInvite) {

        this.membersCanInvite =
                membersCanInvite;
    }

    public boolean isMembersCanEditFamily() {
        return membersCanEditFamily;
    }

    public void setMembersCanEditFamily(
            boolean membersCanEditFamily) {

        this.membersCanEditFamily =
                membersCanEditFamily;
    }

    public boolean isMembersCanManageMembers() {
        return membersCanManageMembers;
    }

    public void setMembersCanManageMembers(
            boolean membersCanManageMembers) {

        this.membersCanManageMembers =
                membersCanManageMembers;
    }

    public boolean isNewMemberNotifications() {
        return newMemberNotifications;
    }

    public void setNewMemberNotifications(
            boolean newMemberNotifications) {

        this.newMemberNotifications =
                newMemberNotifications;
    }

    public boolean isBirthdayNotifications() {
        return birthdayNotifications;
    }

    public void setBirthdayNotifications(
            boolean birthdayNotifications) {

        this.birthdayNotifications =
                birthdayNotifications;
    }

    public boolean isAnniversaryNotifications() {
        return anniversaryNotifications;
    }

    public void setAnniversaryNotifications(
            boolean anniversaryNotifications) {

        this.anniversaryNotifications =
                anniversaryNotifications;
    }

    public boolean isEventNotifications() {
        return eventNotifications;
    }

    public void setEventNotifications(
            boolean eventNotifications) {

        this.eventNotifications =
                eventNotifications;
    }

    public boolean isWhatsappNotifications() {
        return whatsappNotifications;
    }

    public void setWhatsappNotifications(
            boolean whatsappNotifications) {

        this.whatsappNotifications =
                whatsappNotifications;
    }

    public boolean isMembersCanLeaveFamily() {
    return membersCanLeaveFamily;
}

public void setMembersCanLeaveFamily(
        boolean membersCanLeaveFamily) {

    this.membersCanLeaveFamily = membersCanLeaveFamily;
}

}