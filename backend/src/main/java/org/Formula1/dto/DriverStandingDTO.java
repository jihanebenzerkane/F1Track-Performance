package org.Formula1.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * DTO for Driver Standings, mapping directly to frontend requirements.
 */
public class DriverStandingDTO implements Serializable {
    private String id;
    private String name;
    private String team;
    private int points;
    private String carNumber;
    private String nationality;
    private int position;
    private int wins;

    public DriverStandingDTO() {}

    public DriverStandingDTO(String id, String name, String team, int points, String carNumber, String nationality, int position, int wins) {
        this.id = id;
        this.name = name;
        this.team = team;
        this.points = points;
        this.carNumber = carNumber;
        this.nationality = nationality;
        this.position = position;
        this.wins = wins;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getTeam() { return team; }
    public void setTeam(String team) { this.team = team; }
    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }
    public String getCarNumber() { return carNumber; }
    public void setCarNumber(String carNumber) { this.carNumber = carNumber; }
    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }
    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }
    public int getWins() { return wins; }
    public void setWins(int wins) { this.wins = wins; }
}
