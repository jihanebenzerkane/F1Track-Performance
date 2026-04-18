package org.Formula1.Controller;

import org.Formula1.dao.RaceDAO;
import org.Formula1.dao.RaceResultDAO;
import org.Formula1.models.Race;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/races")
public class RaceController {

    @Autowired
    private RaceDAO raceDAO;

    @Autowired
    private RaceResultDAO raceResultDAO;

    
    @GetMapping("/latest-season-year")
    public Map<String, Integer> getLatestSeasonYearInDb() {
        return Map.of("year", raceResultDAO.getLatestSeasonYear());
    }

    
    @GetMapping
    public List<Race> getAllRaces() {
        return raceDAO.findAll();
    }

    
    @GetMapping("/season/{year}")
    public List<Race> getRacesBySeason(@PathVariable int year) {
        return raceDAO.findBySeason(year);
    }

    
    @GetMapping("/search/{name}")
    public List<Race> searchRaces(@PathVariable String name) {
        return raceDAO.findByName(name);
    }

    
    @GetMapping("/circuits")
    public List<java.util.Map<String, Object>> getCircuits() {
        return raceDAO.findAllCircuits();
    }

    
    @GetMapping("/{id}")
    public Race getRaceById(@PathVariable int id) {
        return raceDAO.findById(id);
    }
}