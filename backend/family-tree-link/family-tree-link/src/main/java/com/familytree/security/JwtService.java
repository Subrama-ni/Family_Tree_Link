package com.familytree.security;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.familytree.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private final String secretKey;

    private static final long EXPIRATION_TIME =
            1000L * 60 * 60 * 24; // 24 hours

    public JwtService(
            @Value("${JWT_SECRET}") String secretKey) {

        this.secretKey = secretKey;
    }

    private Key getSigningKey() {

        return Keys.hmacShaKeyFor(
                secretKey.getBytes(
                        StandardCharsets.UTF_8
                )
        );
    }

    public String generateToken(User user) {

        Date now = new Date();

        Date expiration =
                new Date(
                        now.getTime()
                                + EXPIRATION_TIME
                );

        var builder =
                Jwts.builder()

                        .setSubject(
                                user.getEmail()
                        )

                        .claim(
                                "userId",
                                user.getId()
                        )

                        .claim(
                                "fullName",
                                user.getFullName()
                        );

        if (user.getFamily() != null) {

            builder.claim(
                    "familyId",
                    user.getFamily().getId()
            );
        }

        return builder

                .setIssuedAt(now)

                .setExpiration(expiration)

                .signWith(
                        getSigningKey(),
                        SignatureAlgorithm.HS256
                )

                .compact();
    }

    public String extractEmail(
            String token) {

        Claims claims =
                Jwts.parser()
                        .setSigningKey(
                                getSigningKey()
                        )
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

        return claims.getSubject();
    }

    public Long extractUserId(
            String token) {

        Claims claims =
                Jwts.parser()
                        .setSigningKey(
                                getSigningKey()
                        )
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

        Object userId =
                claims.get("userId");

        if (userId == null) {
            return null;
        }

        return ((Number) userId).longValue();
    }

    public Long extractFamilyId(
            String token) {

        Claims claims =
                Jwts.parser()
                        .setSigningKey(
                                getSigningKey()
                        )
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

        Object familyId =
                claims.get("familyId");

        if (familyId == null) {
            return null;
        }

        return ((Number) familyId).longValue();
    }

    public boolean isTokenValid(
            String token,
            User user) {

        try {

            String email =
                    extractEmail(token);

            if (!email.equals(user.getEmail())) {
                return false;
            }

            /*
             * ==================================================
             * VERIFY CURRENT FAMILY MEMBERSHIP
             * ==================================================
             *
             * The database is the source of truth.
             *
             * This prevents an old JWT from continuing to
             * access a family after the user has been removed.
             */

            Long tokenFamilyId =
                    extractFamilyId(token);

            Long currentFamilyId =
                    user.getFamily() != null
                            ? user.getFamily().getId()
                            : null;

            /*
             * Token says user belongs to a family,
             * but database says user has no family.
             */
            if (tokenFamilyId != null
                    && currentFamilyId == null) {

                return false;
            }

            /*
             * Token family and current database family
             * must match.
             */
            if (tokenFamilyId != null
                    && !tokenFamilyId.equals(
                            currentFamilyId)) {

                return false;
            }

            /*
             * Both are null.
             * User currently has no family.
             */
            return tokenFamilyId == null
                    && currentFamilyId == null
                    || tokenFamilyId != null
                    && tokenFamilyId.equals(
                            currentFamilyId);

        } catch (Exception e) {

            return false;
        }
    }
}
