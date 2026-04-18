package org.Formula1.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.cache.annotation.Cacheable;
import java.util.*;
import java.util.stream.Collectors;


@Service
public class OpenF1Service {

    private final RestTemplate restTemplate;
    private final String BASE_URL = "https://api.openf1.org/v1";

    private static final Map<String, String> CIRCUIT_KEY_MAP = new HashMap<>();
    static {
        CIRCUIT_KEY_MAP.put("bahrain", "63");
        CIRCUIT_KEY_MAP.put("jeddah", "149");
        CIRCUIT_KEY_MAP.put("melbourne", "1"); // Albert Park
        CIRCUIT_KEY_MAP.put("suzuka", "102");
        CIRCUIT_KEY_MAP.put("shanghai", "103");
        CIRCUIT_KEY_MAP.put("miami", "151");
        CIRCUIT_KEY_MAP.put("imola", "55");
        CIRCUIT_KEY_MAP.put("monaco", "72");
        CIRCUIT_KEY_MAP.put("montreal", "69");
        CIRCUIT_KEY_MAP.put("catalunya", "9");
        CIRCUIT_KEY_MAP.put("spielberg", "96"); // Red Bull Ring
        CIRCUIT_KEY_MAP.put("silverstone", "10");
        CIRCUIT_KEY_MAP.put("hungaroring", "46");
        CIRCUIT_KEY_MAP.put("spa-francorchamps", "13");
        CIRCUIT_KEY_MAP.put("zandvoort", "142");
        CIRCUIT_KEY_MAP.put("monza", "16");
        CIRCUIT_KEY_MAP.put("baku", "17");
        CIRCUIT_KEY_MAP.put("marina-bay", "61"); 
        CIRCUIT_KEY_MAP.put("austin", "143"); // Americas
        CIRCUIT_KEY_MAP.put("mexico-city", "22");
        CIRCUIT_KEY_MAP.put("interlagos", "38");
        CIRCUIT_KEY_MAP.put("las-vegas", "152");
        CIRCUIT_KEY_MAP.put("lusail", "154");
        CIRCUIT_KEY_MAP.put("yas-marina", "24");

    }

    public OpenF1Service() {
        this.restTemplate = new RestTemplate();
    }

    @Cacheable(value = "sessions", key = "#year + ':' + (#sessionName != null ? #sessionName : '')", unless = "#result == null || #result.isEmpty()")
    public List<Map<String, Object>> getSessions(int year, String sessionName) {
        String url = BASE_URL + "/sessions?year=" + year;
        if (sessionName != null && !sessionName.isEmpty()) {
            url += "&session_name=" + sessionName;
        }
        try {
            ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);
            return response.getBody();
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    /**
     * First non-cancelled session (chronologically) whose OpenF1 driver roster is non-empty.
     * Used so the UI does not default to a session that has no /drivers data.
     */
    public String pickSessionKeyWithDriverRoster(int year) {
        String url = BASE_URL + "/sessions?year=" + year;
        List<Map<String, Object>> sessions = fetchList(url);
        if (sessions.isEmpty()) {
            return null;
        }
        List<Map<String, Object>> sorted = sessions.stream()
                .filter(s -> !Boolean.TRUE.equals(s.get("is_cancelled")))
                .sorted(Comparator.comparing(s -> String.valueOf(s.getOrDefault("date_start", ""))))
                .toList();
        List<Map<String, Object>> attempt = sorted.isEmpty() ? sessions : sorted;
        for (Map<String, Object> s : attempt) {
            Object sk = s.get("session_key");
            if (sk == null) {
                continue;
            }
            String key = String.valueOf(sk);
            List<Map<String, Object>> drivers = fetchList(BASE_URL + "/drivers?session_key=" + key);
            if (drivers != null && !drivers.isEmpty()) {
                return key;
            }
        }
        Object fallback = attempt.get(0).get("session_key");
        return fallback != null ? String.valueOf(fallback) : null;
    }

    @Cacheable("laps")
    public List<Map<String, Object>> getLaps(String sessionKey, String driverNumber) {
        String url = BASE_URL + "/laps?session_key=" + sessionKey;
        if (driverNumber != null && !driverNumber.isEmpty()) {
            url += "&driver_number=" + driverNumber;
        }
        try {
            ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);
            return response.getBody();
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    @Cacheable("carData")
    public List<Map<String, Object>> getCarData(String sessionKey, String driverNumber) {
        String url = BASE_URL + "/car_data?session_key=" + sessionKey;
        if (driverNumber != null && !driverNumber.isEmpty()) {
            url += "&driver_number=" + driverNumber;
        }
        try {
            ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);
            return response.getBody();
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    @Cacheable("stints")
    public List<Map<String, Object>> getStints(String sessionKey, String driverNumber) {
        String url = BASE_URL + "/stints?session_key=" + sessionKey;
        if (driverNumber != null && !driverNumber.isEmpty()) {
            url += "&driver_number=" + driverNumber;
        }
        ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);
        return response.getBody();
    }

    @Cacheable("pitStrategy")
    public Map<String, Object> getPitStrategy(String circuitKey, String driverNumber) {
        String resolvedKey = CIRCUIT_KEY_MAP.getOrDefault(circuitKey, circuitKey);

        // 1. Get all sessions for this circuit
        String sessionsUrl = BASE_URL + "/sessions?circuit_key=" + resolvedKey;
        ResponseEntity<List> sessionsResponse = restTemplate.getForEntity(sessionsUrl, List.class);
        List<Map<String, Object>> sessions = sessionsResponse.getBody();

        if (sessions == null || sessions.isEmpty()) {
            Map<String, Object> emptyMap = new HashMap<>();
            emptyMap.put("strategy", "No historical data found for this circuit.");
            emptyMap.put("historicalStops", List.of());
            return emptyMap;
        }

        // 2. Filter race sessions only
        List<Map<String, Object>> raceSessions = sessions.stream()
                .filter(s -> "Race".equalsIgnoreCase((String) s.get("session_name")))
                .toList();

        if (raceSessions.isEmpty()) {
            Map<String, Object> emptyMap = new HashMap<>();
            emptyMap.put("strategy", "No race sessions found for this circuit.");
            emptyMap.put("historicalStops", List.of());
            return emptyMap;
        }

        // 3. Fetch stints for each race session and collect historical stops
        List<Map<String, Object>> historicalStops = new java.util.ArrayList<>();
        Map<Integer, List<Integer>> stopLapMap = new java.util.HashMap<>();

        for (Map<String, Object> session : raceSessions) {
            String sessionKey = String.valueOf(session.get("session_key"));
            Integer year = (Integer) session.get("year");

            String stintsUrl = BASE_URL + "/stints?session_key=" + sessionKey
                    + "&driver_number=" + driverNumber;
            try {
                ResponseEntity<List> stintsResponse = restTemplate.getForEntity(stintsUrl, List.class);
                List<Map<String, Object>> stints = stintsResponse.getBody();

                if (stints == null || stints.isEmpty())
                    continue;

                // Each stint after the first represents a pit stop entry
                for (int i = 1; i < stints.size(); i++) {
                    Map<String, Object> stint = stints.get(i);
                    int stopNumber = i;
                    int lapStart = (Integer) stint.get("lap_start");
                    String compound = (String) stint.getOrDefault("compound", "UNKNOWN");

                    // Collect for averaging
                    stopLapMap.computeIfAbsent(stopNumber, k -> new java.util.ArrayList<>()).add(lapStart);

                    // Add to historical display list
                    Map<String, Object> stopEntry = new HashMap<>();
                    stopEntry.put("year", year != null ? year : "—");
                    stopEntry.put("stopNumber", stopNumber);
                    stopEntry.put("lap", lapStart);
                    stopEntry.put("compound", compound);
                    historicalStops.add(stopEntry);
                }
            } catch (Exception e) {
                // Skip sessions that fail silently
            }
        }

        // 4. Build strategy recommendations by averaging lap per stop number
        List<Map<String, Object>> strategy = stopLapMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    int stopNumber = entry.getKey();
                    List<Integer> laps = entry.getValue();
                    int avgLap = (int) laps.stream().mapToInt(Integer::intValue).average().orElse(0);
                    Map<String, Object> rec = new HashMap<>();
                    rec.put("stopNumber", stopNumber);
                    rec.put("recommendedLap", avgLap);
                    rec.put("basedOnRaces", laps.size());
                    return rec;
                })
                .toList();

        Map<String, Object> finalResult = new HashMap<>();
        finalResult.put("driver", driverNumber);
        finalResult.put("strategy", strategy.isEmpty() ? "Insufficient data to generate strategy." : strategy);
        finalResult.put("historicalStops", historicalStops);
        return finalResult;
    }

    /**
     * Drivers for a session. OpenF1 sometimes returns an empty {@code /drivers?session_key=…}
     * (e.g. testing days or before rosters sync). We then try {@code meeting_key} and merge
     * any {@code driver_number} seen in laps/stints so the grid list is as complete as possible.
     */
    @Cacheable(value = "drivers", key = "#sessionKey", unless = "#result == null || #result.isEmpty()")
    public List<Map<String, Object>> getDrivers(String sessionKey) {
        if (sessionKey == null || sessionKey.isBlank()) {
            return List.of();
        }
        Map<Integer, Map<String, Object>> byNumber = new TreeMap<>();

        List<Map<String, Object>> fromSession = fetchList(BASE_URL + "/drivers?session_key=" + sessionKey);
        mergeDriverMaps(byNumber, fromSession);

        if (byNumber.isEmpty()) {
            Integer meetingKey = resolveMeetingKey(sessionKey);
            if (meetingKey != null) {
                mergeDriverMaps(byNumber, fetchList(BASE_URL + "/drivers?meeting_key=" + meetingKey));
            }
        }

        mergeDriverNumbersFromLaps(sessionKey, byNumber);
        mergeDriverNumbersFromStints(sessionKey, byNumber);

        return new ArrayList<>(byNumber.values());
    }

    private void mergeDriverMaps(Map<Integer, Map<String, Object>> target, List<Map<String, Object>> rows) {
        if (rows == null) {
            return;
        }
        for (Map<String, Object> row : rows) {
            Integer num = parseDriverNumber(row.get("driver_number"));
            if (num == null) {
                continue;
            }
            target.merge(num, row, (existing, incoming) -> {
                if (hasDisplayName(existing)) {
                    return existing;
                }
                if (hasDisplayName(incoming)) {
                    return incoming;
                }
                return existing;
            });
        }
    }

    private static boolean hasDisplayName(Map<String, Object> d) {
        if (d == null) {
            return false;
        }
        Object fn = d.get("full_name");
        if (fn != null && !String.valueOf(fn).isBlank()) {
            return true;
        }
        Object ln = d.get("last_name");
        Object first = d.get("first_name");
        return (ln != null && !String.valueOf(ln).isBlank())
                || (first != null && !String.valueOf(first).isBlank());
    }

    private void mergeDriverNumbersFromLaps(String sessionKey, Map<Integer, Map<String, Object>> byNumber) {
        try {
            List<Map<String, Object>> laps = getLaps(sessionKey, null);
            if (laps == null) {
                return;
            }
            for (Map<String, Object> lap : laps) {
                Integer num = parseDriverNumber(lap.get("driver_number"));
                if (num != null) {
                    byNumber.putIfAbsent(num, placeholderDriver(num));
                }
            }
        } catch (Exception ignored) {
            // laps may be unavailable for some sessions
        }
    }

    private void mergeDriverNumbersFromStints(String sessionKey, Map<Integer, Map<String, Object>> byNumber) {
        try {
            List<Map<String, Object>> stints = getStints(sessionKey, null);
            if (stints == null) {
                return;
            }
            for (Map<String, Object> stint : stints) {
                Integer num = parseDriverNumber(stint.get("driver_number"));
                if (num != null) {
                    byNumber.putIfAbsent(num, placeholderDriver(num));
                }
            }
        } catch (Exception ignored) {
        }
    }

    private Integer resolveMeetingKey(String sessionKey) {
        try {
            ResponseEntity<List> response = restTemplate.getForEntity(
                    BASE_URL + "/sessions?session_key=" + sessionKey, List.class);
            List<?> body = response.getBody();
            if (body == null || body.isEmpty()) {
                return null;
            }
            Object first = body.get(0);
            if (!(first instanceof Map)) {
                return null;
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> session = (Map<String, Object>) first;
            return parseDriverNumber(session.get("meeting_key"));
        } catch (Exception e) {
            return null;
        }
    }

    private List<Map<String, Object>> fetchList(String url) {
        try {
            ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);
            List<?> raw = response.getBody();
            if (raw == null) {
                return List.of();
            }
            return raw.stream()
                    .filter(Map.class::isInstance)
                    .map(o -> {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> m = (Map<String, Object>) o;
                        return m;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            return List.of();
        }
    }

    private static Integer parseDriverNumber(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number n) {
            return n.intValue();
        }
        try {
            return Integer.parseInt(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static Map<String, Object> placeholderDriver(int driverNumber) {
        Map<String, Object> d = new HashMap<>();
        d.put("driver_number", driverNumber);
        d.put("first_name", "");
        d.put("last_name", "");
        d.put("full_name", "Driver #" + driverNumber);
        return d;
    }
}
