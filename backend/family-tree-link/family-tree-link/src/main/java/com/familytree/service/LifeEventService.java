package com.familytree.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.familytree.entity.LifeEvent;
import com.familytree.repository.LifeEventRepository;

@Service
public class LifeEventService {

    private final LifeEventRepository repository;

    public LifeEventService(
            LifeEventRepository repository) {

        this.repository = repository;
    }

    public LifeEvent addEvent(
            LifeEvent event) {

        return repository.save(event);
    }

    public List<LifeEvent> getAllEvents() {

        return repository.findAll();
    }

    public LifeEvent updateEvent(
            Long id,
            LifeEvent event) {

        LifeEvent existing =
                repository.findById(id)
                        .orElseThrow();

        existing.setTitle(
                event.getTitle());

        existing.setDescription(
                event.getDescription());

        existing.setEventDate(
                event.getEventDate());

        existing.setFamilyMember(
                event.getFamilyMember());

        return repository.save(existing);
    }

    public void deleteEvent(
            Long id) {

        repository.deleteById(id);
    }
}