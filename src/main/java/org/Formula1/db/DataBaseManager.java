package org.Formula1.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;


public class DataBaseManager {
    private static final String URL = "jdbc:sqlite:f1track.db"; //our database address
    public static Connection connect() throws SQLException { //openning the database connection
        Connection conn = DriverManager.getConnection(URL);
        try(Statement stmt = conn.createStatement()){
            stmt.execute("PRAGMA foreign_keys=ON");
        } catch (SQLException ignored){
        }return conn;
    }
    public static void createTables(){
        String driver = """
                CREATE TABLE IF NOT EXISTS driver (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT,
                    name TEXT,
                    team TEXT,
                    points INTEGER,
                    numberOfPrizes INTEGER,
                    natinality TEXT,
                    carNumber INTEGER
                    );
                """;
        String race = """
                CREATE TABLE IF NOT EXISTS race (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    grandPrix TEXT,
                    raceDate DATE,
                    season INTEGER,
                    country TEXT,
                    circuit TEXT
                    );
                """;
        String raceResult ="""
                CREATE TABLE IF NOT EXISTS raceResult(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    raceId INTEGER,
                    driverId INTEGER,
                    finishPosition INTEGER,
                    gridPosition INTEGER,
                    pointsEarned INTEGER,
                    fastestLap BOOLEAN,
                    dnf BOOLEAN,
                    dnfReason TEXT
                    );
                """;
        try (Connection conn = connect();
             Statement stmt = conn.createStatement()) {
            stmt.execute("PRAGMA foreign_keys=ON");
            stmt.execute(driver);
            stmt.execute(raceResult);
            stmt.execute(race);
            System.out.println("Base de donnees initialisee !");
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

}
