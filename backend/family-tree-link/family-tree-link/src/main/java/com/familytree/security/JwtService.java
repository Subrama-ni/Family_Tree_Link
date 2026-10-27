
package com.familytree.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.familytree.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private final SecretKey signingKey;

    private static final long EXPIRATION_TIME =
            1000L * 60 * 60 * 24; // 24 hours

    public JwtService(
            @Value("${JWT_SECRET}") String secretKey) {

        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalStateException(
                    "JWT_SECRET environment variable is required"
            );
        }

        this.signingKey = Keys.hmacShaKeyFor(
                secretKey.getBytes(StandardCharsets.UTF_8)
        );
    }

    private SecretKey getSigningKey() {
        return signingKey;
    }

    // Generate JWT
    public String generateToken(User user) {

        Date now = new Date();
        Date expiration = new Date(
                now.getTime() + EXPIRATION_TIME
        );

        var builder = Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("fullName", user.getFullName());

        if (user.getFamily() != null
                && user.getFamily().getId() != null) {

            builder.claim(
                    "familyId",
                    user.getFamily().getId()
            );
        }

        return builder
                .issuedAt(now)
                .expiration(expiration)
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    // Parse and verify JWT
    private Claims extractClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    public Long extractUserId(String token) {

        Object userId = extractClaims(token).get("userId");

        if (userId == null) {
            return null;
        }

        return ((Number) userId).longValue();
    }

    public Long extractFamilyId(String token) {

        Object familyId = extractClaims(token).get("familyId");

        if (familyId == null) {
            return null;
        }

        return ((Number) familyId).longValue();
    }

    // Validate token against the current database user
    public boolean isTokenValid(String token, User user) {

        try {
            Claims claims = extractClaims(token);

            if (user == null
                    || user.getEmail() == null
                    || !user.getEmail().equals(claims.getSubject())) {
                return false;
            }

            Long tokenUserId = extractUserId(token);

            if (tokenUserId == null
                    || user.getId() == null
                    || !tokenUserId.equals(user.getId())) {
                return false;
            }

            Long tokenFamilyId = extractFamilyId(token);

            Long currentFamilyId =
                    user.getFamily() != null
                            ? user.getFamily().getId()
                            : null;

            // Reject tokens when family membership has changed.
            // Both family IDs must match, including null values.
            return java.util.Objects.equals(
                    tokenFamilyId,
                    currentFamilyId
            );

        } catch (Exception e) {
            return false;
        }
    }
}
