package org.Formula1.scratch;
import org.Formula1.db.DataBaseManager;
import java.sql.*;

public class ListTables {
    public static void main(String[] args) {
        try (Connection conn = DataBaseManager.connect();
             ResultSet rs = conn.getMetaData().getTables(null, null, "%", new String[]{"TABLE"})) {
            while (rs.next()) {
                String tableName = rs.getString("TABLE_NAME");
                System.out.println("Table: " + tableName);
                // Also list columns for 'driver' if it exists
                if (tableName.equalsIgnoreCase("driver") || tableName.equalsIgnoreCase("drivers")) {
                    try (ResultSet cols = conn.getMetaData().getColumns(null, null, tableName, "%")) {
                        while (cols.next()) {
                            System.out.println("  Col: " + cols.getString("COLUMN_NAME"));
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
