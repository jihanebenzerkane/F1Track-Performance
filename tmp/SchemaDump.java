import java.sql.*;

public class SchemaDump {
    public static void main(String[] args) {
        String url = "jdbc:sqlite:c:\\Users\\jihane\\Downloads\\Java\\F1Track\\f1db.db";
        try (Connection conn = DriverManager.getConnection(url)) {
            DatabaseMetaData dbm = conn.getMetaData();
            String[] types = {"TABLE"};
            ResultSet rs = dbm.getTables(null, null, "%", types);
            while (rs.next()) {
                String tableName = rs.getString("TABLE_NAME");
                System.out.println("Table: " + tableName);
                ResultSet cols = dbm.getColumns(null, null, tableName, "%");
                while (cols.next()) {
                    System.out.println("  Column: " + cols.getString("COLUMN_NAME") + " (" + cols.getString("TYPE_NAME") + ")");
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
