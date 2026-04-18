package org.Formula1.Controller;

import org.Formula1.dao.DriverDAO;
import org.Formula1.models.Driver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;



import java.util.List;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    @Autowired
    private DriverDAO driverDAO;

    
    @GetMapping
    public List<Driver> getAllDrivers() {
        return driverDAO.findAll();
    }

    
    @GetMapping("/{id}")
    public Driver getDriverById(@PathVariable String id) {
        return driverDAO.findById(id);
    }

    
    @GetMapping("/season/{year}")
    public List<Driver> getDriversBySeason(@PathVariable int year) {
        return driverDAO.findBySeason(year);
    }

    @GetMapping("/name/{name}")
    public List<Driver> getDriversByName(@PathVariable String name) {
        return driverDAO.findByName(name);
    }

    
    @GetMapping("/team/{team}")
    public List<Driver> getDriversByTeam(@PathVariable String team) {
        return driverDAO.findByTeam(team);
    }

    
    @GetMapping("/nationality/{nationality}")
    public List<Driver> getDriversByNationality(@PathVariable String nationality) {
        return driverDAO.findByNationality(nationality);
    }
    @GetMapping("/standings/{year}")
    public List<Driver> getStandings(@PathVariable int year) {
        return driverDAO.findBySeason(year);
    }
    
}