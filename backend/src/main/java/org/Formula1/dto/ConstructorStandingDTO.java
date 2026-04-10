package org.Formula1.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

import java.util.List;

/**
 * DTO for Constructor Standings.
 */
public class ConstructorStandingDTO implements Serializable {
    private String id;
    private String name;
    private double points;
    private String nationality;
    private int position;
    private int wins;
    private List<String> drivers;

    public ConstructorStandingDTO() {}

    public ConstructorStandingDTO(String id, String name, double points, String nationality, int position, int wins, List<String> drivers) {
        this.id = id;
        this.name = name;
        this.points = points;
        this.nationality = nationality;
        this.position = position;
        this.wins = wins;
        this.drivers = drivers;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public double getPoints() { return points; }
    public void setPoints(double points) { this.points = points; }
    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }
    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }
    public int getWins() { return wins; }
    public void setWins(int wins) { this.wins = wins; }
    public List<String> getDrivers() { return drivers; }
    public void setDrivers(List<String> drivers) { this.drivers = drivers; }
}
