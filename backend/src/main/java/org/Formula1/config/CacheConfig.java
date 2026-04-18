package org.Formula1.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager();
        // Register the specific caches used in StandingService and others
        cacheManager.setCacheNames(Arrays.asList(
            "driverStandings", 
            "constructorStandings", 
            "leaderInfo", 
            "pitStrategy", 
            "raceResults",
            "sessions",
            "laps",
            "carData",
            "stints",
            "drivers"
        ));
        return cacheManager;
    }
}
