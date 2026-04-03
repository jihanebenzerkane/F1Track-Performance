package org.Formula1.models;
public class Driver {
    private String name;
    private String team;
    private String id;
    private int points;
    private int numberOfPrizes;
    private String nationality;
    private String carNumber;

    public Driver (String name, String team, String id, String carNumber, String nationality){
         this.name = name;
         this.team = team;
         this.id = id;
         this.carNumber = carNumber;
         this.nationality = nationality;
         this.points = 0;
         this.numberOfPrizes = 0;
    }

    public String getName() {return this.name;}
    public int getPoints() {return this.points;}
    public String getTeam(){return this.team;}
    public String getId(){return this.id;}
    public int getNumberOfPrizes(){return this.numberOfPrizes;}
    public String getCarNumber(){return this.carNumber;}
    public String getNationality(){return this.nationality;}
    public void setPoints(int points){ this.points = points;}
    public void setId(String id){ this.id = id;}
    public void setCarNumber(String carNumber){ this.carNumber = carNumber;}
    public void setNumberOfPrizes(int numberOfPrizes){ this.numberOfPrizes = numberOfPrizes;}
    public void setNationality(String nationality){ this.nationality = nationality;}
    public void setName(String name){ this.name = name;}
    public void setTeam(String team){this.team = team;}
    
    @Override
    public String toString() {
         return "ID: " + id +
                 " | Name: "+ name +
                 " | Nationality: " + nationality +
                 " | Car :  " + carNumber +
                 " | Team: " + team +
                 " | Points: " + points;
    }
}
