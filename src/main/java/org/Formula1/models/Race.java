package org.Formula1.models;


import java.util.Date;

public class Race {
    private int id;
    private Date raceDate;
    private String grandPrix;
    private int season;
    private String country;
    private String circuit;

    public Race (int id, String country, String circuit, int season, String grandPrix){
        this.grandPrix = grandPrix;
        this.season = season ;
        this.id = id;
        this.country =country ;
        this.circuit = circuit;
        this.raceDate = new Date() ;
    }

    public String getGrandPrix() {return this.grandPrix;}
    public int getSeason(){return this.season;}
    public int getId(){return this.id;}
    public String getCountry(){return this.country;}
    public Date getRaceDate(){return this.raceDate;}
    public String getCircuit(){return this.circuit;}

    public void setId(int id){ this.id = id;}
    public void setCountry(String country){ this.country = country;}
    public void setCircuit(String circuit){ this.circuit = circuit;}
    public void setGrandPrix(String grandPrix){ this.grandPrix = grandPrix;}
    public void setSeason(int season){this.season = season;}
    public void setRaceDate(Date raceDate){this.raceDate = raceDate;}


}

