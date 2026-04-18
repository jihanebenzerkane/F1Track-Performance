package org.Formula1.dto;

public class LeaderDTO {
    private String worldChampion;
    private int totalRaces;
    private String mostPodiumsDriver;
    private String mostWinsDriver;

    public LeaderDTO() {}

    public LeaderDTO(String worldChampion, int totalRaces, String mostPodiumsDriver, String mostWinsDriver) {
        this.worldChampion = worldChampion;
        this.totalRaces = totalRaces;
        this.mostPodiumsDriver = mostPodiumsDriver;
        this.mostWinsDriver = mostWinsDriver;
    }

    // Getters and Setters
    public String getWorldChampion() { return worldChampion; }
    public void setWorldChampion(String worldChampion) { this.worldChampion = worldChampion; }

    public int getTotalRaces() { return totalRaces; }
    public void setTotalRaces(int totalRaces) { this.totalRaces = totalRaces; }

    public String getMostPodiumsDriver() { return mostPodiumsDriver; }
    public void setMostPodiumsDriver(String mostPodiumsDriver) { this.mostPodiumsDriver = mostPodiumsDriver; }

    public String getMostWinsDriver() { return mostWinsDriver; }
    public void setMostWinsDriver(String mostWinsDriver) { this.mostWinsDriver = mostWinsDriver; }
}
