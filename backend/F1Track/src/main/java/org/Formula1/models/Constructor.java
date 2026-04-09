package org.Formula1.models;
import java.util.ArrayList;
import java.util.List;
public class Constructor {
    private String id;
    private String name;
    private String countryId;
    private List<Driver> drivers;
    private int points;
    private int numberOfPrizes;
    public Constructor(String id, String name, String countryId) {
        this.id = id;
        this.name = name;
        this.countryId = countryId;
        this.drivers = new ArrayList<>();
        this.points = 0;
        this.numberOfPrizes = 0;
    }
    public String getId() { return id; }
    public String getName() { return name; }
    public String getCountryId() { return countryId; }
    public List<Driver> getDrivers() { return drivers; }
    public int getPoints() { return points; }
    public int getNumberOfPrizes() { return numberOfPrizes; }
    public void setId(String id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setCountryId(String countryId) { this.countryId = countryId; }
    public void setDrivers(List<Driver> drivers) { this.drivers = drivers; }
    public void setPoints(int points) { this.points = points; }
    public void setNumberOfPrizes(int numberOfPrizes) { this.numberOfPrizes = numberOfPrizes; }
    public void addDriver(Driver driver) {
        drivers.add(driver);
    }
    @Override
    public String toString() {
        return "ID: " + id +
                " | Name: " + name +
                " | Country: " + countryId +
                " | Points: " + points +
                " | Number of Prizes: " + numberOfPrizes;
    }
}