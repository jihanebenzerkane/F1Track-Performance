package org.Formula1.models;

public class RaceResult {
    private int id;
    private int raceId;
    private int driverId;
    private int finishPosition;
    private int gridPosition;
    private int pointsEarned;
    private boolean fastestLap;
    private boolean dnf;
    private String dnfReason;

    public RaceResult (int driverId,int raceId,int finishPosition, int id, int gridPosition, int pointsEarned){
        this.driverId = driverId;
        this.finishPosition = finishPosition ;
        this.id = id;
        this.gridPosition =gridPosition ;
        this.pointsEarned = pointsEarned;
        this.fastestLap = false;
        this.dnf = false;
        this.dnfReason = "N/A" ;
    }

    public int getDriverId() {return this.driverId;}
    public boolean getFastestLap() {return this.fastestLap;}
    public int getFinishPosition(){return this.finishPosition;}
    public int getId(){return this.id;}
    public boolean getDnf(){return this.dnf;}
    public int getGridPosition(){return this.gridPosition;}
    public String getDnfReason(){return this.dnfReason;}
    public int getRaceId(){return this.raceId;}
    public int getPointsEarned(){return this.pointsEarned;}

    public void setFastestLap(boolean fastestLap){ this.fastestLap = fastestLap;}
    public void setId(int id){ this.id = id;}
    public void setGridPosition(int gridPosition){ this.gridPosition = gridPosition;}
    public void setDnf(boolean dnf){ this.dnf = dnf;}
    public void setPointsEarned(int pointsEarned){ this.pointsEarned = pointsEarned;}
    public void setDriverId(int driverId){ this.driverId = driverId;}
    public void setFinishPosition(int finishPosition){this.finishPosition = finishPosition;}
    public void setDnfReason(String dnfReason){this.dnfReason = dnfReason;}
    public void setRaceId(int raceId){this.raceId = raceId;}

}
