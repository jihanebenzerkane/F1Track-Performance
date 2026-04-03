package org.Formula1.service;
import org.Formula1.dao.DriverDAO;
import org.Formula1.dao.RaceResultDAO;
import org.Formula1.models.Driver;
import org.Formula1.utils.TableRenderer;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
public class StatisticsService {
    private final DriverDAO driverDAO;
    private final RaceResultDAO resultDAO;
    public StatisticsService(DriverDAO driverDAO, RaceResultDAO resultDAO) {
        this.driverDAO = driverDAO;
        this.resultDAO = resultDAO;
    }
    public void showGeneralStatistics() {
        int targetYear = resultDAO.getLatestSeasonYear();
        List<Driver> drivers = driverDAO.findBySeason(targetYear);
        drivers.forEach(d -> d.setPoints(resultDAO.getTotalPointsByDriver(d.getId())));
        
        int totalDrivers = drivers.size();
        int totalPoints = drivers.stream().mapToInt(Driver::getPoints).sum();
        
        String[] statsHeaders = {"Category", "Value"};
        List<String[]> statsRows = new ArrayList<>();
        statsRows.add(new String[]{"Total Active Drivers", String.valueOf(totalDrivers)});
        statsRows.add(new String[]{"Total Teams", String.valueOf(drivers.stream().map(Driver::getTeam).distinct().count())});
        statsRows.add(new String[]{"Total Points Distributed", String.valueOf(totalPoints)});
        TableRenderer.render("Stats Overview - " + targetYear, statsHeaders, statsRows);
        
        String[] topHeaders = {"POS", "NAME", "POINTS", "TEAM"};
        List<String[]> topRows = new ArrayList<>();
        AtomicInteger rank = new AtomicInteger(1);
        drivers.stream()
                .sorted((d1, d2) -> d2.getPoints() - d1.getPoints())
                .limit(5)
                .forEach(d -> topRows.add(new String[]{
                        "#" + rank.getAndIncrement(), d.getName(), String.valueOf(d.getPoints()), d.getTeam()
                }));
        TableRenderer.render("Current Top 5 Standings", topHeaders, topRows);
    }
    public void showTeamStatistics() {
        int targetYear = resultDAO.getLatestSeasonYear();
        List<Driver> drivers = driverDAO.findBySeason(targetYear);
        drivers.forEach(d -> d.setPoints(resultDAO.getTotalPointsByDriver(d.getId())));
        
        String[] headers = {"TEAM", "STANDOUT DRIVER", "TOTAL POINTS"};
        List<String[]> rows = new ArrayList<>();
        drivers.stream()
                .collect(Collectors.groupingBy(Driver::getTeam, Collectors.summingInt(Driver::getPoints)))
                .entrySet().stream()
                .sorted((e1, e2) -> e2.getValue() - e1.getValue())
                .forEach(e -> {
                    String bestDriver = drivers.stream()
                            .filter(d -> d.getTeam().equals(e.getKey()))
                            .max((d1, d2) -> d1.getPoints() - d2.getPoints())
                            .map(Driver::getName).orElse("N/A");
                    rows.add(new String[]{e.getKey(), bestDriver, String.valueOf(e.getValue())});
                });
        TableRenderer.render("Constructor Standings - " + targetYear, headers, rows);
    }
}