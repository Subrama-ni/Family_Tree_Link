package com.familytree.dto;

public class UpdateFamilySettingsRequest {

    private boolean familyProfileVisible;

    private String familyName;

private String familyDescription;

    private boolean membersCanInvite;

    private boolean membersCanEditFamily;

    private boolean membersCanManageMembers;

    private boolean newMemberNotifications;

    private boolean birthdayNotifications;

    private boolean anniversaryNotifications;

    private boolean eventNotifications;

    private boolean whatsappNotifications;

    public UpdateFamilySettingsRequest() {
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

    public String getFamilyName() {
    return familyName;
}

public void setFamilyName(String familyName) {
    this.familyName = familyName;
}

public String getFamilyDescription() {
    return familyDescription;
}

public void setFamilyDescription(String familyDescription) {
    this.familyDescription = familyDescription;
}
}