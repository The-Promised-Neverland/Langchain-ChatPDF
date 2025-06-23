package com.pdfbot.knowledgebot.config;

import org.springframework.boot.http.client.ClientHttpRequestFactoryBuilder;
import org.springframework.boot.http.client.ClientHttpRequestFactorySettings;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class GroundControlTower {
    @Bean
    public RestClient restClient() {
        return RestClient
                .builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .requestFactory(getRequestFactory())
                .build();
    }

    private ClientHttpRequestFactory getRequestFactory() {
        ClientHttpRequestFactorySettings settings = ClientHttpRequestFactorySettings
                .defaults()
                .withConnectTimeout(Duration.ofSeconds(3))
                .withReadTimeout(Duration.ofSeconds(10));

        return ClientHttpRequestFactoryBuilder.detect().build(settings);
    }
}
