package org.Formula1.models;
public class RaceResult {
    private int id;
    private int driverId;
    private String driverStrId; // Added for string-based ID support
    private int raceId;
    private int finishPosition;
    private int gridPosition;
    private int pointsEarned;
    private String driverName;
    private boolean fastestLap;
    private boolean dnf;
    private String dnfReason;
    public RaceResult(int driverId, int raceId, int finishPosition, int gridPosition, int pointsEarned) {
        this.driverId = driverId;
        this.raceId = raceId;
        this.finishPosition = finishPosition;
        this.gridPosition = gridPosition;
        this.pointsEarned = pointsEarned;
    }
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public int getDriverId() { return driverId; }
    public String getDriverStrId() { return driverStrId; }
    public void setDriverStrId(String driverStrId) { this.driverStrId = driverStrId; }
    public int getRaceId() { return raceId; }
    public int getFinishPosition() { return finishPosition; }
    public int getGridPosition() { return gridPosition; }
    public int getPointsEarned() { return pointsEarned; }
    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }
    public boolean getFastestLap() { return fastestLap; }
    public void setFastestLap(boolean fastestLap) { this.fastestLap = fastestLap; }
    public boolean getDnf() { return dnf; }
    public void setDnf(boolean dnf) { this.dnf = dnf; }
    public String getDnfReason() { return dnfReason; }
    public void setDnfReason(String dnfReason) { this.dnfReason = dnfReason; }
}