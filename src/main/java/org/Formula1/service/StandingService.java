package org.Formula1.service;
public class StandingService {
    public int posToPoints (int position){
        int n;
        switch (position){
            case 1 : n = 25;
            break;
            case 2 : n = 18;
            break;
            case 3 : n = 15;
            break;
            case 4 : n = 12;
            break;
            case 5 : n = 10;
            break;
            case 6 : n = 8;
            break;
            case 7 : n = 6;
            break;
            case 8 : n = 4;
            break;
            case 9 : n = 2;
            break;
            case 10 : n = 1;
            break;
            default:n = 0;
        }
        return n;
    }
}
