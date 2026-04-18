package org.Formula1.models;

public class Race {
    private int id;
    private String raceDate;
    private String grandPrix;
    private int season;
    private int round;
    private String country;
    private String circuit;
    private String circuitSlug;

    public Race(int id, String raceDate, String grandPrix, int season, int round, String country, String circuit, String circuitSlug) {
        this.id = id;
        this.raceDate = raceDate;
        this.grandPrix = grandPrix;
        this.season = season;
        this.round = round;
        this.country = country;
        this.circuit = circuit;
        this.circuitSlug = circuitSlug;
    }

    public Race() {
    }

    public int getId() {
        return id;
    }

    public String getRaceDate() {
        return raceDate;
    }

    public String getGrandPrix() {
        return grandPrix;
    }

    public int getSeason() {
        return season;
    }

    public int getRound() {
        return round;
    }

    public String getCountry() {
        return country;
    }

    public String getCircuit() {
        return circuit;
    }

    public String getCircuitSlug() {
        return circuitSlug;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setRaceDate(String raceDate) {
        this.raceDate = raceDate;
    }

    public void setGrandPrix(String grandPrix) {
        this.grandPrix = grandPrix;
    }

    public void setSeason(int season) {
        this.season = season;
    }

    public void setRound(int round) {
        this.round = round;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public void setCircuit(String circuit) {
        this.circuit = circuit;
    }

    @Override
    public String toString() {
        return "ID: " + id +
                " | Round: " + round +
                " | Grand Prix: " + grandPrix +
                " | Season: " + season +
                " | Date: " + raceDate +
                " | Circuit: " + circuit +
                " | Country: " + country;
    }
}