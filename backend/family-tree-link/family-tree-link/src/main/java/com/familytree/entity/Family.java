package com.familytree.entity;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "families")
public class Family {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * ============================================================
     * FAMILY INFORMATION
     * ============================================================
     */

    private String name;

    private String description;

    /*
     * ============================================================
     * FAMILY OWNER
     * ============================================================
     *
     * The user who creates the family becomes its owner.
     *
     * Only the owner will be allowed to modify important
     * family-level settings.
     */

    @JsonIgnore
    @OneToOne
    @JoinColumn(
            name = "owner_id",
            unique = true
    )
    private User owner;

    /*
     * ============================================================
     * FAMILY MEMBERS
     * ============================================================
     *
     * Every user belongs to one family through the User.family
     * relationship.
     */

    @JsonIgnore
    @OneToMany(
            mappedBy = "family",
            cascade = CascadeType.ALL,
            orphanRemoval = false
    )
    private List<User> users = new ArrayList<>();

    /*
     * ============================================================
     * CONSTRUCTORS
     * ============================================================
     */

    public Family() {
    }

    public Family(
            String name,
            String description) {

        this.name = name;

        this.description = description;
    }

    /*
     * ============================================================
     * GETTERS AND SETTERS
     * ============================================================
     */

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(
            String name) {

        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description) {

        this.description = description;
    }

    /*
     * ============================================================
     * OWNER
     * ============================================================
     */

    public User getOwner() {
        return owner;
    }

    public void setOwner(
            User owner) {

        this.owner = owner;
    }

    /*
     * ============================================================
     * USERS
     * ============================================================
     */

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(
            List<User> users) {

        this.users = users;
    }
}