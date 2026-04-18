package org.Formula1.dto;

public class DriverStandingDTO {
    private String id;
    private String name;
    private String team;
    private int points;
    private String number;
    private String nationality;
    private int position;
    private int wins;
    private int podiums;

    public DriverStandingDTO() {}

    public DriverStandingDTO(String id, String name, String team, int points, String number, String nationality, int position, int wins, int podiums) {
        this.id = id;
        this.name = name;
        this.team = team;
        this.points = points;
        this.number = number;
        this.nationality = nationality;
        this.position = position;
        this.wins = wins;
        this.podiums = podiums;
    }

    public DriverStandingDTO(String id, String name, String team, int points, String number, String nationality, int position, int wins) {
        this(id, name, team, points, number, nationality, position, wins, 0);
    }

    // Explicit Getters
    public String getId() { return id; }
    public String getName() { return name; }
    public String getTeam() { return team; }
    public int getPoints() { return points; }
    public String getNumber() { return number; }
    public String getNationality() { return nationality; }
    public int getPosition() { return position; }
    public int getWins() { return wins; }
    public int getPodiums() { return podiums; }

    // Explicit Setters
    public void setId(String id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setTeam(String team) { this.team = team; }
    public void setPoints(int points) { this.points = points; }
    public void setNumber(String number) { this.number = number; }
    public void setNationality(String nationality) { this.nationality = nationality; }
    public void setPosition(int position) { this.position = position; }
    public void setWins(int wins) { this.wins = wins; }
    public void setPodiums(int podiums) { this.podiums = podiums; }
}
