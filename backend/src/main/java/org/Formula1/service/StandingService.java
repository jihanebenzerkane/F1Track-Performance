package org.Formula1.service;

import org.Formula1.dao.StandingsDAO;
import org.Formula1.dto.ConstructorStandingDTO;
import org.Formula1.dto.DriverStandingDTO;
import org.Formula1.dto.LeaderDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StandingService {

    @Autowired
    private StandingsDAO standingsDAO;

    @Autowired
    private PredictionService predictionService;

    @Cacheable(value = "driverStandings", key = "#year + #mode")
    public List<DriverStandingDTO> getDriverStandings(int year, String mode) {
        if ("prediction".equalsIgnoreCase(mode) || year >= 2026) {
            return predictionService.simulateSeasonDrivers(year);
        }
        return standingsDAO.getDriverStandingsByYear(year);
    }

    @Cacheable(value = "constructorStandings", key = "#year + #mode")
    public List<ConstructorStandingDTO> getConstructorStandings(int year, String mode) {
        if ("prediction".equalsIgnoreCase(mode) || year >= 2026) {
            return predictionService.simulateSeasonConstructors(year);
        }
        return standingsDAO.getConstructorStandingsByYear(year);
    }

    @Cacheable(value = "leaderInfo", key = "#year")
    public LeaderDTO getLeaderInfo(int year) {
        if (year >= 2026) {
            List<DriverStandingDTO> simulated = predictionService.simulateSeasonDrivers(year);
            return new LeaderDTO(simulated.get(0).getName(), 24, simulated.get(0).getName(), simulated.get(0).getName());
        }
        return standingsDAO.getLeaderInfo(year);
    }
}
