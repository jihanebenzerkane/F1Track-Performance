package org.Formula1.service;
import org.Formula1.dao.DriverDAO;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import org.Formula1.models.Driver;
import org.Formula1.utils.TableRenderer;

public class DriverService {
    public static void manageDrivers(DriverDAO driverDAO, Scanner scanner) {
        while (true) {
            System.out.println("\n=== F1: Driver Directory ===");
            System.out.println("1. List All Drivers by Season ");
            System.out.println("2. Search Driver by Name");
            System.out.println("3. Search Drivers by Team ");
            System.out.println("4. Back to Main Menu");
            System.out.print("Choice: ");
            int choice = getValidInt(scanner);
            switch (choice) {
                case 1:
                    System.out.print("Enter season year: ");
                    int year = getValidInt(scanner);
                    printDriverTable("Drivers - Season " + year, driverDAO.findBySeason(year));
                    break;
                case 2:
                    System.out.print("Enter name: ");
                    String name = scanner.nextLine().trim();
                    printDriverTable("Search results: " + name, driverDAO.findByName(name));
                    break;
                case 3:
                    System.out.print("Enter team name: ");
                    String team = scanner.nextLine().trim();
                    printDriverTable("Historical results for: " + team, driverDAO.findByTeam(team));
                    break;
                case 4:
                    return;
                default:
                    System.out.println("Invalid choice.");
            }
        }
    }

    private static void printDriverTable(String title, List<Driver> drivers) {
        String[] headers = {"NAME", "CURRENT/LATEST TEAM", "ID", "CAR #"};
        List<String[]> rows = new ArrayList<>();
        for (Driver d : drivers) {
            rows.add(new String[]{d.getName(), d.getTeam(), d.getId(), d.getCarNumber()});
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
