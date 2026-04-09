package org.Formula1.controller;

import org.Formula1.dao.RaceDAO;
import org.Formula1.models.Race;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/races")
public class RaceController {

    @Autowired
    private RaceDAO raceDAO;

    // GET /api/races
    @GetMapping
    public List<Race> getAllRaces() {
        return raceDAO.findAll();
    }

    // GET /api/races/season/2023
    @GetMapping("/season/{year}")
    public List<Race> getRacesBySeason(@PathVariable int year) {
        return raceDAO.findBySeason(year);
    }

    // GET /api/races/search/monaco
    @GetMapping("/search/{name}")
    public List<Race> searchRaces(@PathVariable String name) {
        return raceDAO.findByName(name);
    }

    // GET /api/races/100
    @GetMapping("/{id}")
    public Race getRaceById(@PathVariable int id) {
        return raceDAO.findById(id);
    }
}