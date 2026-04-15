package com.nayag.hisabkit.modules.identity.service;


import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.nayag.hisabkit.core.config.HisabkitProperties;
import com.nayag.hisabkit.modules.identity.dto.AuthResponse;
import com.nayag.hisabkit.modules.identity.dto.GoogleSocialLoginRequest;
import com.nayag.hisabkit.modules.identity.model.User;
import com.nayag.hisabkit.modules.identity.repository.UserRepository;
import com.nayag.hisabkit.core.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GoogleSocialAuthService {

    private static final Logger log = LoggerFactory.getLogger(GoogleSocialAuthService.class);

    private final GoogleIdTokenVerifier googleIdTokenVerifier;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final HisabkitProperties properties;
    private final RestTemplate restTemplate = new RestTemplate();

    @Transactional
    public AuthResponse authenticate(GoogleSocialLoginRequest request) {
        String idToken = request.resolveIdToken();
        if (!StringUtils.hasText(idToken)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Google id token is required");
        }

        GoogleProfile profile = verifyToken(idToken);
        String email = normalizeEmail(profile.email());
        String mobile = trimToNull(profile.mobile());
        String googleSubject = trimToNull(profile.subject());

        Optional<User> userOptional = Optional.empty();
        if (StringUtils.hasText(googleSubject)) {
            userOptional = userRepository.findByGoogleSubject(googleSubject);
        }
        if (StringUtils.hasText(email)) {
            userOptional = userOptional
                    .or(() -> userRepository.findByEmailIgnoreCase(email))
                    .or(() -> userRepository.findByUsernameIgnoreCase(email));
        }
        if (userOptional.isEmpty() && StringUtils.hasText(mobile)) {
            userOptional = userRepository.findByMobile(mobile);
        }

        User user = userOptional.orElseThrow(() -> new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "You are not registered. Please use the same registered Google account."
        ));

        if (StringUtils.hasText(googleSubject)
                && StringUtils.hasText(user.getGoogleSubject())
                && !googleSubject.equals(user.getGoogleSubject())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "This Google account does not match your registered account."
            );
        }

        linkGoogleProfile(user, email, mobile, profile.name(), googleSubject, profile.picture());
        String normalizedAvatarUrl = normalizeAvatarUrl(user.getAvatarUrl());
        if (!Objects.equals(user.getAvatarUrl(), normalizedAvatarUrl)) {
            user.setAvatarUrl(normalizedAvatarUrl);
        }
        user.setLastLoginAt(LocalDateTime.now());
        user = userRepository.save(user);

        return buildAuthResponse(user);
    }

    private GoogleProfile verifyToken(String idToken) {
        if (!StringUtils.hasText(properties.getGoogle().getClientId())) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Google social login is not configured");
        }

        try {
            GoogleIdToken token = googleIdTokenVerifier.verify(idToken);
            if (token == null) {
                return verifyUsingTokenInfo(idToken, null);
            }

            GoogleIdToken.Payload payload = token.getPayload();
            if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google email is not verified");
            }

            return new GoogleProfile(
                    trimToNull(payload.getEmail()),
                    trimToNull((String) payload.get("name")),
                    trimToNull(payload.getSubject()),
                    trimToNull((String) payload.get("phone_number")),
                    trimToNull((String) payload.get("picture"))
            );
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            return verifyUsingTokenInfo(idToken, ex);
        }
    }

    private GoogleProfile verifyUsingTokenInfo(String idToken, Exception verifierException) {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                    "https://oauth2.googleapis.com/tokeninfo?id_token={idToken}",
                    Map.class,
                    idToken
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google ID token");
            }

            Map<?, ?> body = response.getBody();
            String aud = trimToNull(String.valueOf(body.get("aud")));
            String iss = trimToNull(String.valueOf(body.get("iss")));
            String exp = trimToNull(String.valueOf(body.get("exp")));
            String email = trimToNull(String.valueOf(body.get("email")));
            String emailVerified = trimToNull(String.valueOf(body.get("email_verified")));
            String subject = trimToNull(String.valueOf(body.get("sub")));
            String name = trimToNull(String.valueOf(body.get("name")));
            String mobile = trimToNull(String.valueOf(body.get("phone_number")));
            String picture = trimToNull(String.valueOf(body.get("picture")));

            if (!properties.getGoogle().getClientId().equals(aud)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google token audience mismatch");
            }

            if (!"accounts.google.com".equals(iss) && !"https://accounts.google.com".equals(iss)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google token issuer mismatch");
            }

            if (!StringUtils.hasText(exp) || Long.parseLong(exp) < OffsetDateTime.now().toEpochSecond()) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google token has expired");
            }

            if (!"true".equalsIgnoreCase(emailVerified)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google email is not verified");
            }

            return new GoogleProfile(email, name, subject, mobile, picture);
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            if (verifierException != null) {
                log.warn("Google token verification failed in verifier and tokeninfo fallback", verifierException);
            }
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unable to verify Google ID token", ex);
        }
    }

    private void linkGoogleProfile(
            User user,
            String email,
            String mobile,
            String googleName,
            String googleSubject,
            String profilePictureUrl
    ) {
        if (StringUtils.hasText(email) && !StringUtils.hasText(user.getEmail())) {
            user.setEmail(email);
        }

        if (StringUtils.hasText(mobile) && !StringUtils.hasText(user.getMobile())) {
            user.setMobile(mobile);
        }

        if (StringUtils.hasText(googleSubject) && !StringUtils.hasText(user.getGoogleSubject())) {
            user.setGoogleSubject(googleSubject);
        }

        if (StringUtils.hasText(googleName)) {
            user.setFullName(googleName.trim());
        }

        String normalizedAvatarUrl = resolveAvatarForStorage(profilePictureUrl);
        if (StringUtils.hasText(normalizedAvatarUrl)) {
            user.setAvatarUrl(normalizedAvatarUrl);
        }
    }

    private AuthResponse buildAuthResponse(User user) {
        String tenantId = user.getTenant().getId().toString();
        String token = jwtUtils.generateToken(user.getUsername(), tenantId, user.getRole());

        return AuthResponse.builder()
                .token(token)
                .tenantId(tenantId)
                .tenantSlug(user.getTenant().getSlug())
                .user(AuthResponse.UserSummary.builder()
                        .username(user.getUsername())
                        .role(user.getRole())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .mobile(user.getMobile())
                        .avatarUrl(user.getAvatarUrl())
                        .build())
                .build();
    }

    private String normalizeEmail(String email) {
        String normalized = trimToNull(email);
        return normalized == null ? null : normalized.toLowerCase(Locale.ROOT);
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        String normalized = value.trim();
        if ("null".equalsIgnoreCase(normalized) || "undefined".equalsIgnoreCase(normalized)) {
            return null;
        }
        return normalized;
    }

    private String normalizeAvatarUrl(String value) {
        String normalized = trimToNull(value);
        if (!StringUtils.hasText(normalized)) {
            return null;
        }
        if (normalized.startsWith("//")) {
            return "https:" + normalized;
        }
        if (normalized.startsWith("http://")) {
            return "https://" + normalized.substring("http://".length());
        }
        return normalized;
    }

    private String resolveAvatarForStorage(String value) {
        String normalized = normalizeAvatarUrl(value);
        if (!StringUtils.hasText(normalized)) {
            return null;
        }
        if (normalized.startsWith("data:")) {
            return normalized;
        }

        // Google-hosted profile photos can get rate-limited (429) on repeated client fetches.
        // Download once at login and persist as data URI to avoid broken avatars.
        if (normalized.contains("googleusercontent.com")) {
            String dataUri = downloadAsDataUri(normalized);
            if (StringUtils.hasText(dataUri)) {
                return dataUri;
            }
        }

        return normalized;
    }

    private String downloadAsDataUri(String url) {
        try {
            ResponseEntity<byte[]> response = restTemplate.getForEntity(url, byte[].class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null || response.getBody().length == 0) {
                return null;
            }

            MediaType mediaType = response.getHeaders().getContentType();
            String contentType = mediaType != null ? mediaType.toString() : "image/jpeg";
            if (!contentType.startsWith("image/")) {
                return null;
            }

            byte[] body = response.getBody();
            if (body.length > 1_500_000) {
                return null;
            }

            String base64 = Base64.getEncoder().encodeToString(body);
            return "data:" + contentType + ";base64," + base64;
        } catch (Exception ex) {
            log.debug("Could not cache Google profile image as data URI", ex);
            return null;
        }
    }

    private record GoogleProfile(String email, String name, String subject, String mobile, String picture) {
    }
}

