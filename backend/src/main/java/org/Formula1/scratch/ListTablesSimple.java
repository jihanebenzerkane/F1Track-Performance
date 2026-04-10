package org.Formula1.scratch;
import org.Formula1.db.DataBaseManager;
import java.sql.*;

public class ListTablesSimple {
    public static void main(String[] args) throws Exception {
        Connection c = DataBaseManager.connect();
        DatabaseMetaData md = c.getMetaData();
        ResultSet rs = md.getTables(null, null, "%", null);
        System.out.println("Tables found:");
        while (rs.next()) {
            System.out.println(rs.getString(3));
        }
        c.close();
    }
}
