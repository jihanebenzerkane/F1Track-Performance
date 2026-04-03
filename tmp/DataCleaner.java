import java.sql.*;

public class DataCleaner {
    public static void main(String[] args) {
        String url = "jdbc:sqlite:c:\\Users\\jihane\\Downloads\\Java\\F1Track\\f1db.db";
        try (Connection conn = DriverManager.getConnection(url)) {
            conn.setAutoCommit(false);
            
            // 1. Remove orphans (no race)
            int orphansRace = conn.createStatement().executeUpdate(
                "DELETE FROM raceResult WHERE raceId NOT IN (SELECT id FROM race)"
            );
            System.out.println("Removed orphans (bad raceId): " + orphansRace);
            
            // 2. Remove orphans (no driver)
            // Note: driverId in raceResult was mapped from rowid in our DAO
            int orphansDriver = conn.createStatement().executeUpdate(
                "DELETE FROM raceResult WHERE driverId NOT IN (SELECT rowid FROM driver)"
            );
            System.out.println("Removed orphans (bad driverId): " + orphansDriver);
            
            // 3. Remove duplicates (keeping the one with higher ID if exists)
            int dupes = conn.createStatement().executeUpdate(
                "DELETE FROM raceResult WHERE id NOT IN (SELECT MAX(id) FROM raceResult GROUP BY raceId, driverId)"
            );
            System.out.println("Removed duplicate results: " + dupes);
            
            conn.commit();
            System.out.println("Data cleaning completed successfully.");
            
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
