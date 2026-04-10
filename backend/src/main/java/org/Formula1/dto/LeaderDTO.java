package org.Formula1.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * DTO for the Season Leader/KPI cards.
 */
public class LeaderDTO implements Serializable {
    private String worldChampion;
    private int totalRaces;
    private String mostWinsDriver;
    private String mostPodiumsDriver;

    public LeaderDTO() {}

    public LeaderDTO(String worldChampion, int totalRaces, String mostWinsDriver, String mostPodiumsDriver) {
        this.worldChampion = worldChampion;
        this.totalRaces = totalRaces;
        this.mostWinsDriver = mostWinsDriver;
        this.mostPodiumsDriver = mostPodiumsDriver;
    }

    public String getWorldChampion() { return worldChampion; }
    public void setWorldChampion(String worldChampion) { this.worldChampion = worldChampion; }
    public int getTotalRaces() { return totalRaces; }
    public void setTotalRaces(int totalRaces) { this.totalRaces = totalRaces; }
    public String getMostWinsDriver() { return mostWinsDriver; }
    public void setMostWinsDriver(String mostWinsDriver) { this.mostWinsDriver = mostWinsDriver; }
    public String getMostPodiumsDriver() { return mostPodiumsDriver; }
    public void setMostPodiumsDriver(String mostPodiumsDriver) { this.mostPodiumsDriver = mostPodiumsDriver; }
}
