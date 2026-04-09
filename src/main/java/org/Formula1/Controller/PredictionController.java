package org.Formula1.controller;

import org.Formula1.dao.DriverDAO;
import org.Formula1.dao.RaceResultDAO;
import org.Formula1.models.Driver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/predictions")
public class PredictionController {

    @Autowired
    private DriverDAO driverDAO;

    @Autowired
    private RaceResultDAO resultDAO;

    // GET /api/predictions/winner/{year}
    @GetMapping("/winner/{year}")
    public List<Map<String, Object>> predictWinner(@PathVariable int year) {
        List<Driver> drivers = driverDAO.findBySeason(year);
        drivers.forEach(d -> d.setPoints(resultDAO.getTotalPointsByDriver(d.getId(), year)));
        drivers.sort(Comparator.comparingInt(Driver::getPoints).reversed());

        int totalTopPoints = drivers.stream()
                .limit(5)
                .mapToInt(Driver::getPoints)
                .sum();

        List<Map<String, Object>> result = new ArrayList<>();
        drivers.stream().limit(5).forEach(d -> {
            double prob = totalTopPoints > 0
                    ? Math.round((d.getPoints() / (double) totalTopPoints) * 1000.0) / 10.0
                    : 20.0;
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("driver", d.getName());
            entry.put("team", d.getTeam());
            entry.put("points", d.getPoints());
            entry.put("winProbability", prob + "%");
            entry.put("confidence", prob > 30 ? "HIGH" : "MEDIUM");
            result.add(entry);
        });
        return result;
    }

    // GET /api/predictions/champion/{year}
    @GetMapping("/champion/{year}")
    public List<Map<String, Object>> predictChampion(@PathVariable int year) {
        List<Driver> drivers = driverDAO.findBySeason(year);
        drivers.forEach(d -> d.setPoints(resultDAO.getTotalPointsByDriver(d.getId(), year)));
        drivers.sort(Comparator.comparingInt(Driver::getPoints).reversed());

        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 0; i < Math.min(5, drivers.size()); i++) {
            Driver d = drivers.get(i);
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("rank", "#" + (i + 1));
            entry.put("driver", d.getName());
            entry.put("team", d.getTeam());
            entry.put("currentPoints", d.getPoints());
            entry.put("projectedFinal", (int)(d.getPoints() * 1.1));
            entry.put("status", i == 0 ? "CHAMPION FAVORITE" : "CONTENDER");
            result.add(entry);
        }
        return result;
    }
}