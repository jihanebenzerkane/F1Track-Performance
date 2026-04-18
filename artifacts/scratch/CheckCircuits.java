import java.sql.*;
import java.util.*;

public class CheckCircuits {
    private static final String URL =
        "jdbc:mysql://localhost:3306/f1track?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&characterEncoding=UTF-8";
    private static final String USER = "root";
    private static final String PASSWORD = "jihane123";

    public static void main(String[] args) throws Exception {
        try (Connection conn = DriverManager.getConnection(URL, USER, PASSWORD);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT id, name FROM circuit LIMIT 25")) {
            System.out.println("ID | Name");
            System.out.println("-------------------------");
            while (rs.next()) {
                System.out.println(rs.getString("id") + " | " + rs.getString("name"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
