import java.sql.*;

public class DataTester {
    public static void main(String[] args) {
        try {
            Class.forName("org.sqlite.JDBC");
            String dbUrl = "jdbc:sqlite:c:/Users/jihane/Downloads/Java/F1Track/f1db.db";
            try (Connection c = DriverManager.getConnection(dbUrl)) {
                 System.out.println("--- CHECKING SEASON COUNTS ---");
                 String s1 = "SELECT year, COUNT(*) as cnt FROM season_driver GROUP BY year ORDER BY year DESC LIMIT 10";
                 try (Statement st = c.createStatement(); ResultSet rs = st.executeQuery(s1)) {
                     while (rs.next()) {
                         System.out.println("Year: " + rs.getInt("year") + " | Drivers: " + rs.getInt("cnt"));
                     }
                 }

                 System.out.println("\n--- CHECKING 2026 STANDINGS ---");
                 String s2 = "SELECT COUNT(*) FROM season_driver_standing WHERE year = 2026";
                 try (Statement st = c.createStatement(); ResultSet rs = st.executeQuery(s2)) {
                     if (rs.next()) System.out.println("2026 Standing rows: " + rs.getInt(1));
                 }

                 System.out.println("\n--- CHECKING 2024 STANDINGS ---");
                 String s3 = "SELECT COUNT(*) FROM season_driver_standing WHERE year = 2024";
                 try (Statement st = c.createStatement(); ResultSet rs = st.executeQuery(s3)) {
                     if (rs.next()) System.out.println("2024 Standing rows: " + rs.getInt(1));
                 }

            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
