package com.familytree.controller;

import java.util.List;

import org.springframework.web.bind.annotation
        .CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.familytree.entity.LifeEvent;
import com.familytree.service.LifeEventService;


@RestController
@RequestMapping("/api/events")

@CrossOrigin(origins =
        "http://localhost:5173")

public class LifeEventController {

    private final LifeEventService
            service;

    public LifeEventController(
            LifeEventService service) {

        this.service = service;
    }

    @PostMapping
    public LifeEvent addEvent(
            @RequestBody
            LifeEvent event) {

        return service.addEvent(event);
    }

    @GetMapping
    public List<LifeEvent>
    getAllEvents() {

        return service.getAllEvents();
    }
    @PutMapping("/{id}")
public LifeEvent updateEvent(
        @PathVariable Long id,
        @RequestBody LifeEvent event) {

    return service.updateEvent(
            id,
            event);
}

@DeleteMapping("/{id}")
public void deleteEvent(
        @PathVariable Long id) {

    service.deleteEvent(id);
}
}