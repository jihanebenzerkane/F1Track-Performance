package org.Formula1.service;
import org.Formula1.dao.RaceDAO;
import org.Formula1.dao.RaceResultDAO;
import org.Formula1.models.Race;
import org.Formula1.utils.TableRenderer;
import java.util.ArrayList;
import java.util.Scanner;
import java.util.List;
public class RaceService {
    public static void manageRaces(RaceDAO raceDAO, RaceResultDAO resultDAO, Scanner scanner) {
        while (true) {
            System.out.println("\n=== F1: Grand Prix Calendar ===");
            System.out.println("1. List Races by Season");
            System.out.println("2. Search Race by Name");
            System.out.println("3. View Specific Race Results");
            System.out.println("4. Back to Main Menu");
            System.out.print("Choice: ");
            int choice = getValidInt(scanner);
            switch (choice) {
                case 1:
                    System.out.print("Enter season year: ");
                    int year = getValidInt(scanner);
                    printRaceTable("Grand Prix Calendar - Season " + year, raceDAO.findBySeason(year));
                    break;
                case 2:
                    System.out.print("Enter Grand Prix name: ");
                    String gp = scanner.nextLine().trim();
                    printRaceTable("Search results: " + gp, raceDAO.findByName(gp));
                    break;
                case 3:
                    ResultService.viewResults(resultDAO, raceDAO, scanner);
                    break;
                case 4:
                    return;
                default:
                    System.out.println("Invalid choice.");
            }
        }
    }
    private static void printRaceTable(String title, List<Race> races) {
        String[] headers = {"ID", "GRAND PRIX", "DATE", "CIRCUIT"};
        List<String[]> rows = new ArrayList<>();
        for (Race r : races) {
            rows.add(new String[]{String.valueOf(r.getId()), r.getGrandPrix(), r.getRaceDate(), r.getCircuit()});
        }
        TableRenderer.render(title, headers, rows);
    }
    private static int getValidInt(Scanner scanner) {
        while (!scanner.hasNextInt()) {
            System.out.print("Enter a number: ");
            scanner.nextLine();
        }
        int val = scanner.nextInt();
        scanner.nextLine();
        return val;
    }
}