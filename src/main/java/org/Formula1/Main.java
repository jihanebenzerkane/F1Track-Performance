package org.Formula1;
import org.Formula1.dao.DriverDAO;
import org.Formula1.dao.RaceDAO;
import org.Formula1.dao.RaceResultDAO;
import org.Formula1.service.PredictionService;
import org.Formula1.service.StatisticsService;
import java.util.Scanner;
import static org.Formula1.service.DriverService.manageDrivers;
import static org.Formula1.service.RaceService.manageRaces;
public class Main {
    public static void main(String[] args) {
        DriverDAO driverDAO = new DriverDAO();
        RaceDAO raceDAO = new RaceDAO();
        RaceResultDAO resultDAO = new RaceResultDAO();
        Scanner scanner = new Scanner(System.in);
        System.out.println("=== Formula 1 Track System ===");
        if (org.Formula1.db.DataBaseManager.verifyData()) {
            System.out.println("Base de données initialisée avec succès.\n");
        } else {
            System.err.println("WARNING: Database is empty or file not found.");
            System.err.println("Please ensure 'f1db.db' (73MB) is in the project directory.");
        }
        while (true) {
            System.out.println("\n=== Formula 1 Historical Data System ===");
            System.out.println("1. View Drivers");
            System.out.println("2. View Races");
            System.out.println("3. Statistics & Records");
            System.out.println("4. AI Predictions (2026 Season)");
            System.out.println("0. Exit");
            System.out.print("Choose an option: ");
            int choice = getValidInt(scanner);
            switch (choice) {
                case 1:
                    manageDrivers(driverDAO, scanner);
                    break;
                case 2:
                    manageRaces(raceDAO, resultDAO, scanner);
                    break;
                case 3:
                    StatisticsService statsService = new StatisticsService(driverDAO, resultDAO);
                    statsService.showGeneralStatistics();
                    statsService.showTeamStatistics();
                    break;
                case 4:
                    PredictionService predictionService = new PredictionService(driverDAO, resultDAO);
                    System.out.println("\nChoose prediction type:");
                    System.out.println("1. Predict Next Race Winner");
                    System.out.println("2. Predict Season Champion");
                    System.out.print("Choice: ");
                    int predChoice = getValidInt(scanner);
                    if (predChoice == 1) {
                        predictionService.predictNextRaceWinner();
                    } else if (predChoice == 2) {
                        predictionService.predictChampion();
                    } else {
                        System.out.println("Invalid choice.");
                    }
                    break;
                case 0:
                    System.out.println("Exiting... Thank you!");
                    scanner.close();
                    return;
                default:
                    System.out.println("Invalid choice. Please try again.");
            }
        }
    }
    private static int getValidInt(Scanner scanner) {
        while (!scanner.hasNextInt()) {
            System.out.print("Please enter a valid number: ");
            scanner.nextLine();
        }
        int value = scanner.nextInt();
        scanner.nextLine();
        return value;
    }
}
