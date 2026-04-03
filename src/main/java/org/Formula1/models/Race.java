package org.Formula1.models;
public class Race {
    private int id;
    private String raceDate;      
    private String grandPrix;
    private int season;
    private String country;
    private String circuit;
    public Race(int id, String raceDate, String grandPrix, int season, String country, String circuit) {
        this.id = id;
        this.raceDate = raceDate;
        this.grandPrix = grandPrix;
        this.season = season;
        this.country = country;
        this.circuit = circuit;
    }
    public Race() {
    }
    public int getId() { return id; }
    public String getRaceDate() { return raceDate; }
    public String getGrandPrix() { return grandPrix; }
    public int getSeason() { return season; }
    public String getCountry() { return country; }
    public String getCircuit() { return circuit; }
    public void setId(int id) { this.id = id; }
    public void setRaceDate(String raceDate) { this.raceDate = raceDate; }
    public void setGrandPrix(String grandPrix) { this.grandPrix = grandPrix; }
    public void setSeason(int season) { this.season = season; }
    public void setCountry(String country) { this.country = country; }
    public void setCircuit(String circuit) { this.circuit = circuit; }
    @Override
    public String toString() {
        return "ID: " + id +
                " | Grand Prix: " + grandPrix +
                " | Season: " + season +
                " | Date: " + raceDate +
                " | Circuit: " + circuit +
                " | Country: " + country;
    }
}