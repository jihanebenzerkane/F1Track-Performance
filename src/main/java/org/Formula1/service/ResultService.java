package org.Formula1.service;

import org.Formula1.dao.DriverDAO;
import org.Formula1.dao.RaceDAO;
import org.Formula1.dao.RaceResultDAO;
import org.Formula1.models.Race;
import org.Formula1.models.RaceResult;
import org.Formula1.utils.TableRenderer;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class ResultService {
    public static void viewResults(RaceResultDAO resultDAO, RaceDAO raceDAO, Scanner scanner) {
        System.out.print("Enter Race ID (e.g., 100 for a historical race): ");
        int raceId = getValidInt(scanner);
        List<RaceResult> results = resultDAO.findByRaceId(raceId);
        
        Race race = raceDAO.findById(raceId);
        String title = (race != null) ? "Results: " + race.getGrandPrix() + " (" + race.getSeason() + ")" : "Race Results";
        
        String[] headers = {"POS", "DRIVER ID", "POINTS"};
        List<String[]> rows = new ArrayList<>();
        results.forEach(res -> rows.add(new String[]{
            String.valueOf(res.getFinishPosition()),
            res.getDriverStrId(),
            String.valueOf(res.getPointsEarned())
        }));
        TableRenderer.render(title, headers, rows);
    }

    public static void viewResultsByDriver(RaceResultDAO resultDAO, RaceDAO raceDAO, DriverDAO driverDAO, Scanner scanner) {
        System.out.print("Enter Driver ID string (e.g., max-verstappen): ");
        String driverId = scanner.next();
        scanner.nextLine();

        System.out.println("1. Filter by season year");
        System.out.println("2. View all-time history");
        System.out.print("Selection: ");
        int choice = getValidInt(scanner);

        List<RaceResult> results;
        String title;
        if (choice == 1) {
            System.out.print("Enter season year: ");
            int year = getValidInt(scanner);
            results = resultDAO.findByDriverAndSeason(driverId, year);
            title = "Results for " + driverId + " in " + year;
        } else {
            results = resultDAO.findByDriverId(driverId);
            title = "All-Time History: " + driverId;
        }

        String[] headers = {"RACE ID", "GRAND PRIX", "YEAR", "POS"};
        List<String[]> rows = new ArrayList<>();
        if (results != null) {
            for (RaceResult res : results) {
                Race r = raceDAO.findById(res.getRaceId());
                String gp = (r != null) ? r.getGrandPrix() : "Unknown";
                String yearStr = (r != null) ? String.valueOf(r.getSeason()) : "Unknown";
                rows.add(new String[]{String.valueOf(res.getRaceId()), gp, yearStr, "P" + res.getFinishPosition()});
            }
        }
        TableRenderer.render(title, headers, rows);
    }

    private static int getValidInt(Scanner scanner) {
        while (!scanner.hasNextInt()) {
            System.out.print("Please enter a valid number: ");
            scanner.next();
        }
        int val = scanner.nextInt();
        scanner.nextLine();
        return val;
    }
}