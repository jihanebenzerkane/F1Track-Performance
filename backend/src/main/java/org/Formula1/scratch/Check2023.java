package org.Formula1.scratch;
import org.Formula1.db.DataBaseManager;
import java.sql.*;

public class Check2023 {
    public static void main(String[] args) throws Exception {
        Connection c = DataBaseManager.connect();
        Statement stmt = c.createStatement();
        
        System.out.println("Checking races for 2023...");
        ResultSet rs = stmt.executeQuery("SELECT COUNT(*) as count, MAX(round) as max_round FROM races WHERE year = 2023");
        if (rs.next()) {
            System.out.println("Count: " + rs.getInt("count") + ", Max Round: " + rs.getInt("max_round"));
        }
        
        int maxRound = rs.getInt("max_round");
        System.out.println("\nChecking driver_standings for 2023 round " + maxRound + "...");
        ResultSet rs2 = stmt.executeQuery(
            "SELECT COUNT(*) as count FROM driver_standings ds " +
            "JOIN races r ON ds.raceId = r.raceId " +
            "WHERE r.year = 2023 AND r.round = " + maxRound
        );
        if (rs2.next()) {
            System.out.println("Standings count: " + rs2.getInt("count"));
        }
        
        System.out.println("\nChecking first few standings for 2023...");
        ResultSet rs3 = stmt.executeQuery(
            "SELECT d.surname, ds.points FROM driver_standings ds " +
            "JOIN races r ON ds.raceId = r.raceId " +
            "JOIN drivers d ON ds.driverId = d.driverId " +
            "WHERE r.year = 2023 LIMIT 5"
        );
        while (rs3.next()) {
            System.out.println(rs3.getString("surname") + ": " + rs3.getDouble("points"));
        }
        
        c.close();
    }
}
