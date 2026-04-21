package org.Formula1.Controller;

import org.Formula1.service.LocalTelemetryService;
import org.Formula1.service.OpenF1Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/telemetry")
public class TelemetryController {

    @Autowired
    private OpenF1Service openF1Service;

    @Autowired
    private LocalTelemetryService localTelemetryService;

    @GetMapping("/sessions/{year}")
    public List<Map<String, Object>> getSessions(@PathVariable int year, @RequestParam(required = false) String sessionName) {
        return openF1Service.getSessions(year, sessionName);
    }

    @GetMapping("/sessions/{year}/default-session-key")
    public Map<String, String> getDefaultSessionKey(@PathVariable int year) {
        String key = openF1Service.pickSessionKeyWithDriverRoster(year);
        return Map.of("session_key", key != null ? key : "");
    }

    @GetMapping("/laps/{sessionKey}")
    public List<Map<String, Object>> getLaps(@PathVariable String sessionKey, @RequestParam(required = false) String driverNumber) {
        return openF1Service.getLaps(sessionKey, driverNumber);
    }

    @GetMapping("/car_data/{sessionKey}")
    public List<Map<String, Object>> getCarData(@PathVariable String sessionKey, @RequestParam(required = false) String driverNumber) {
        return openF1Service.getCarData(sessionKey, driverNumber);
    }

    @GetMapping("/stints/{sessionKey}")
    public List<Map<String, Object>> getStints(@PathVariable String sessionKey, @RequestParam(required = false) String driverNumber) {
        return openF1Service.getStints(sessionKey, driverNumber);
    }
    @GetMapping("/pit-strategy/{circuitKey}")
    public Map<String, Object> getPitStrategy(
        @PathVariable String circuitKey,
        @RequestParam(required = false) String driverNumber,
        @RequestParam(required = false) String driverId) {
        if (driverId != null && !driverId.isBlank()) {
            return localTelemetryService.pitStrategy(circuitKey, driverId.trim());
        }
        String num = driverNumber != null ? driverNumber : "";
        return openF1Service.getPitStrategy(circuitKey, num);
    }

    // Pit strategy from local f1db.db (historical race_pit_stops per Grand Prix). 
    @GetMapping("/db/pit-strategy/{circuitId}")
    public Map<String, Object> getDbPitStrategy(
            @PathVariable String circuitId,
            @RequestParam String driverId) {
        return localTelemetryService.pitStrategy(circuitId, driverId);
    }

    // Races in a season 
    @GetMapping("/db/sessions/{year}")
    public List<Map<String, Object>> getDbSessions(@PathVariable int year) {
        return localTelemetryService.sessionsForYear(year);
    }

    // One point per round 
    @GetMapping("/db/season/{year}/laps")
    public List<Map<String, Object>> getDbSeasonLaps(
            @PathVariable int year,
            @RequestParam String driverId) {
        return localTelemetryService.seasonLapsForDriver(year, driverId);
    }

    @GetMapping("/db/race/{raceId}/summary")
    public List<Map<String, Object>> getDbRaceSummary(
            @PathVariable int raceId,
            @RequestParam String driverId) {
        return localTelemetryService.raceSummaryForDriver(raceId, driverId);
    }

    @GetMapping("/drivers")
    public List<Map<String, Object>> getDrivers(@RequestParam(name = "session_key") String sessionKey) {
        return openF1Service.getDrivers(sessionKey);
    }
}
