import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import java.util.*;

public class TestOpenF1 {
    public static void main(String[] args) {
        RestTemplate restTemplate = new RestTemplate();
        String BASE_URL = "https://api.openf1.org/v1";
        
        try {
            String resolvedKey = "103"; // shanghai
            String sessionsUrl = BASE_URL + "/sessions?circuit_key=" + resolvedKey;
            
            System.out.println("Calling: " + sessionsUrl);
            ResponseEntity<List> sessionsResponse = restTemplate.getForEntity(sessionsUrl, List.class);
            List sessions = sessionsResponse.getBody();
            System.out.println("Sessions found: " + (sessions != null ? sessions.size() : 0));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
