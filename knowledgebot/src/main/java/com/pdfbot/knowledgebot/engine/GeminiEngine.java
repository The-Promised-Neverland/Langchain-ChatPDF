package com.pdfbot.knowledgebot.engine;

import com.pdfbot.knowledgebot.payload.GeminiRequest;
import com.pdfbot.knowledgebot.payload.GeminiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class GeminiEngine {


    private final RestClient restClient;
    private final String apiKey;

    public GeminiEngine(RestClient restClient, @Value("${gemini.api.key}") String apiKey) {
        this.restClient = restClient;
        this.apiKey = apiKey;
    }

    private GeminiRequest buildRequest(String userInput) {
        return new GeminiRequest(
                List.of(
                        new GeminiRequest.Content(
                                List.of(
                                        new GeminiRequest.Part(userInput)
                                )
                        )
                )
        );
    }

    public String fireUpEngines(String userInput){
        String endpoint="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + apiKey;
        GeminiRequest requestPayload=buildRequest(userInput);

        try{
            GeminiResponse response=restClient
                    .post()
                    .uri(endpoint)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestPayload)
                    .retrieve()
                    .body(GeminiResponse.class);

            // Extract text from response
            return response.candidates().get(0).content().parts().get(0).text();
        } catch (Exception e) {
            e.printStackTrace();
            return "⚠️ GeminiEngine encountered turbulence. Try again.";
        }
    }
}
