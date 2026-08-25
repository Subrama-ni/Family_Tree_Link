package com.familytree.security;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

import org.springframework.stereotype.Service;

import com.familytree.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private static final String SECRET_KEY =
            "FamilyTreeLinkSuperSecretKeyForJWTAuthentication2026";

    private static final long EXPIRATION_TIME =
            1000L * 60 * 60 * 24; // 24 hours

    private Key getSigningKey() {

        return Keys.hmacShaKeyFor(
                SECRET_KEY.getBytes(
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

        return Jwts.builder()

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
)

.claim(
        "familyId",
        user.getFamily().getId()
)

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

            return email.equals(
                    user.getEmail()
            );

        } catch (Exception e) {

            return false;
        }
    }
}