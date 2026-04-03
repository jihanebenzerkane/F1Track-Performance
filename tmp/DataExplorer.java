import java.sql.*;

public class DataExplorer {
    public static void main(String[] args) {
        String url = "jdbc:sqlite:c:\\Users\\jihane\\Downloads\\Java\\F1Track\\f1db.db";
        try (Connection conn = DriverManager.getConnection(url)) {
            // Find current season
            ResultSet rs = conn.createStatement().executeQuery("SELECT MAX(year) FROM season");
            if (rs.next()) {
                int currentYear = rs.getInt(1);
                System.out.println("Current Season: " + currentYear);
                
                // Active drivers in current year
                rs = conn.createStatement().executeQuery("SELECT COUNT(*) FROM season_driver_standing WHERE year = " + currentYear);
                if (rs.next()) System.out.println("Active Drivers in " + currentYear + ": " + rs.getInt(1));
            }
            
            // Check race results table link
            rs = conn.createStatement().executeQuery("SELECT r.year, rd.race_id, rd.driver_id, rd.position_number, c.name FROM race_data rd JOIN race r ON rd.race_id = r.id JOIN constructor c ON rd.constructor_id = c.id LIMIT 5");
            System.out.println("\nSample Race Data (rd join race join constructor):");
            while (rs.next()) {
                System.out.println(rs.getInt("year") + " | " + rs.getInt("race_id") + " | " + rs.getString("driver_id") + " | Pos: " + rs.getInt("position_number") + " | Team: " + rs.getString("name"));
            }

            // Check race date column
            rs = conn.createStatement().executeQuery("SELECT date FROM race LIMIT 5");
            System.out.println("\nSample Race Dates:");
            while (rs.next()) {
                System.out.println(rs.getString("date"));
            }
            
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
