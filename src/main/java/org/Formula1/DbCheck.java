package org.Formula1.utils;

import org.Formula1.db.DataBaseManager;
import java.sql.*;

public class DbCheck {
    public static void main(String[] args) throws Exception {
        Connection c = DataBaseManager.connect();
        Statement stmt = c.createStatement();
        ResultSet rs2 = stmt.executeQuery(
                "SELECT COUNT(*) FROM race_driver_standing rds " +
                        "JOIN race_data rd ON rds.race_id = rd.race_id AND rds.driver_id = rd.driver_id " +
                        "JOIN race r ON rd.race_id = r.id " +
                        "WHERE rd.driver_id = 'max-verstappen' AND r.year = 2023 AND rd.type = 'RACE_RESULT'"
        );
        System.out.println("Rows for Verstappen 2023: " + rs2.getInt(1));
        rs2.close();
        c.close();
        // add this to DbCheck.java temporarily

    }

}