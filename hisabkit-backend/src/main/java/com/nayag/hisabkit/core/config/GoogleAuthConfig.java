package com.nayag.hisabkit.core.config;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

@Configuration
public class GoogleAuthConfig {

    private final HisabkitProperties properties;

    public GoogleAuthConfig(HisabkitProperties properties) {
        this.properties = properties;
    }

    @Bean
    public NetHttpTransport googleHttpTransport() throws GeneralSecurityException, IOException {
        return GoogleNetHttpTransport.newTrustedTransport();
    }

    @Bean
    public JsonFactory googleJsonFactory() {
        return JacksonFactory.getDefaultInstance();
    }

    @Bean
    public GoogleIdTokenVerifier googleIdTokenVerifier(NetHttpTransport googleHttpTransport, JsonFactory googleJsonFactory) {
        return new GoogleIdTokenVerifier.Builder(googleHttpTransport, googleJsonFactory)
                .setAudience(List.of(properties.getGoogle().getClientId()))
                .build();
    }
}

