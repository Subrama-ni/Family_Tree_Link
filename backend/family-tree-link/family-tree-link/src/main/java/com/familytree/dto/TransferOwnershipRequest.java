package com.familytree.dto;

public class TransferOwnershipRequest {

    private Long newOwnerId;

    public TransferOwnershipRequest() {
    }

    public Long getNewOwnerId() {

        return newOwnerId;
    }

    public void setNewOwnerId(
            Long newOwnerId) {

        this.newOwnerId = newOwnerId;
    }
}