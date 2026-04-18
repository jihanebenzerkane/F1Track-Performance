package org.Formula1.dto;

import java.util.List;

public class ConstructorStandingDTO {
    private String id;
    private String name;
    private double points;
    private String nationality;
    private int position;
    private int wins;
    private int podiums;
    private List<String> drivers;

    public ConstructorStandingDTO() {}

    public ConstructorStandingDTO(String id, String name, double points, String nationality, int position, int wins, int podiums, List<String> drivers) {
        this.id = id;
        this.name = name;
        this.points = points;
        this.nationality = nationality;
        this.position = position;
        this.wins = wins;
        this.podiums = podiums;
        this.drivers = drivers;
    }

    public ConstructorStandingDTO(String id, String name, double points, String nationality, int position, int wins, List<String> drivers) {
        this(id, name, points, nationality, position, wins, 0, drivers);
    }

    // Getters
    public String getId() { return id; }
    public String getName() { return name; }
    public double getPoints() { return points; }
    public String getNationality() { return nationality; }
    public int getPosition() { return position; }
    public int getWins() { return wins; }
    public int getPodiums() { return podiums; }
    public List<String> getDrivers() { return drivers; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setPoints(double points) { this.points = points; }
    public void setNationality(String nationality) { this.nationality = nationality; }
    public void setPosition(int position) { this.position = position; }
    public void setWins(int wins) { this.wins = wins; }
    public void setPodiums(int podiums) { this.podiums = podiums; }
    public void setDrivers(List<String> drivers) { this.drivers = drivers; }
}
