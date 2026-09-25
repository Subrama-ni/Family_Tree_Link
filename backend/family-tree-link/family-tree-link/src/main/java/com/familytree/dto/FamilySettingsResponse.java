package com.familytree.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class FamilySettingsResponse {

    private Long id;

    private Long familyId;

    /*
     * ============================================================
     * FAMILY OWNER
     * ============================================================
     *
     * true  = currently logged-in user is the family owner
     * false = currently logged-in user is a normal member
     *
     * @JsonProperty is important here because the React
     * frontend expects the JSON property to be:
     *
     *     isFamilyOwner
     */

    @JsonProperty("isFamilyOwner")
    private boolean isFamilyOwner;

    /*
 * ============================================================
 * FAMILY DETAILS
 * ============================================================
 */

private String familyName;

private String familyDescription;

    /*
     * ============================================================
     * FAMILY INFORMATION
     * ============================================================
     */

    private boolean familyProfileVisible;

    /*
     * ============================================================
     * MEMBER PERMISSIONS
     * ============================================================
     */

    private boolean membersCanInvite;

    private boolean membersCanEditFamily;

    private boolean membersCanManageMembers;

    /*
     * ============================================================
     * NOTIFICATIONS
     * ============================================================
     */

    private boolean newMemberNotifications;

    private boolean birthdayNotifications;

    private boolean anniversaryNotifications;

    private boolean eventNotifications;

    /*
     * ============================================================
     * WHATSAPP
     * ============================================================
     */

    private boolean whatsappNotifications;

    /*
     * ============================================================
     * CONSTRUCTOR
     * ============================================================
     */

    public FamilySettingsResponse() {
    }

    public FamilySettingsResponse(
            Long id,
            Long familyId,
            boolean isFamilyOwner,
            String familyName,
        String familyDescription,
            boolean familyProfileVisible,
            boolean membersCanInvite,
            boolean membersCanEditFamily,
            boolean membersCanManageMembers,
            boolean newMemberNotifications,
            boolean birthdayNotifications,
            boolean anniversaryNotifications,
            boolean eventNotifications,
            boolean whatsappNotifications) {

        this.id = id;

        this.familyId = familyId;

        this.isFamilyOwner = isFamilyOwner;

        this.familyName = familyName;

    this.familyDescription = familyDescription;

        this.familyProfileVisible =
                familyProfileVisible;

        this.membersCanInvite =
                membersCanInvite;

        this.membersCanEditFamily =
                membersCanEditFamily;

        this.membersCanManageMembers =
                membersCanManageMembers;

        this.newMemberNotifications =
                newMemberNotifications;

        this.birthdayNotifications =
                birthdayNotifications;

        this.anniversaryNotifications =
                anniversaryNotifications;

        this.eventNotifications =
                eventNotifications;

        this.whatsappNotifications =
                whatsappNotifications;
    }

    /*
     * ============================================================
     * GETTERS
     * ============================================================
     */

    public Long getId() {
        return id;
    }

    public Long getFamilyId() {
        return familyId;
    }

    /*
     * IMPORTANT:
     *
     * Explicitly expose the JSON property as:
     *
     *     isFamilyOwner
     */

    @JsonProperty("isFamilyOwner")
    public boolean isFamilyOwner() {
        return isFamilyOwner;
    }

    public String getFamilyName() {
    return familyName;
}

public String getFamilyDescription() {
    return familyDescription;
}

    public boolean isFamilyProfileVisible() {
        return familyProfileVisible;
    }

    public boolean isMembersCanInvite() {
        return membersCanInvite;
    }

    public boolean isMembersCanEditFamily() {
        return membersCanEditFamily;
    }

    public boolean isMembersCanManageMembers() {
        return membersCanManageMembers;
    }

    public boolean isNewMemberNotifications() {
        return newMemberNotifications;
    }

    public boolean isBirthdayNotifications() {
        return birthdayNotifications;
    }

    public boolean isAnniversaryNotifications() {
        return anniversaryNotifications;
    }

    public boolean isEventNotifications() {
        return eventNotifications;
    }

    public boolean isWhatsappNotifications() {
        return whatsappNotifications;
    }
}