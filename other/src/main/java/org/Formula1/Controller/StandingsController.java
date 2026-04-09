package org.Formula1.controller;

import org.Formula1.dao.DriverDAO;
import org.Formula1.dao.RaceResultDAO;
import org.Formula1.models.Driver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/standings")
public class StandingsController {

    @Autowired
    private DriverDAO driverDAO;

    @Autowired
    private RaceResultDAO resultDAO;

    // GET /api/standings/2023
    @GetMapping("/{year}")
    public List<Driver> getStandings(@PathVariable int year) {
        List<Driver> drivers = driverDAO.findBySeason(year);
        drivers.forEach(d -> d.setPoints(
                resultDAO.getTotalPointsByDriver(d.getId(), year)
        ));
        drivers.sort(Comparator.comparingInt(Driver::getPoints).reversed());
        return drivers;
    }

    @GetMapping("/latest")
    public List<Driver> getLatestStandings() {
        int latestYear = resultDAO.getLatestSeasonYear();
        return getStandings(latestYear);
    }
}