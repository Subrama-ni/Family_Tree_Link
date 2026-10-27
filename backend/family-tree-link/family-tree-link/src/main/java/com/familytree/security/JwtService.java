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

    /*
     * ============================================================
     * GENERATE TOKEN
     * ============================================================
     */

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

        /*
         * A user may exist without belonging
         * to any family.
         *
         * Therefore familyId is only included
         * when the user currently belongs to
         * a family.
         */

        if (user.getFamily() != null
                && user.getFamily().getId() != null) {

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

    /*
     * ============================================================
     * EXTRACT EMAIL
     * ============================================================
     */

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

    /*
     * ============================================================
     * EXTRACT USER ID
     * ============================================================
     */

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

    /*
     * ============================================================
     * EXTRACT FAMILY ID
     * ============================================================
     */

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

    /*
     * ============================================================
     * TOKEN VALIDATION
     * ============================================================
     *
     * IMPORTANT:
     *
     * We do NOT trust the familyId stored in an old JWT.
     *
     * The database is the current source of truth.
     *
     * Cases:
     *
     * 1. Token has familyId
     *    + User currently has same family
     *    -> VALID
     *
     * 2. Token has familyId
     *    + User no longer has a family
     *    -> INVALID
     *
     * 3. Token has familyId 4
     *    + User now belongs to family 5
     *    -> INVALID
     *
     * 4. Token has no familyId
     *    + User has no family
     *    -> VALID
     *
     * The last case is important because users who are not
     * currently members of a family must still be able to
     * authenticate and create/join a family.
     */

    public boolean isTokenValid(
            String token,
            User user) {

        try {

            String email =
                    extractEmail(token);

            /*
             * Basic identity validation.
             */

            if (!email.equals(
                    user.getEmail())) {

                return false;
            }

            /*
             * ==================================================
             * FAMILY VALIDATION
             * ==================================================
             */

            Long tokenFamilyId =
                    extractFamilyId(token);

            Long databaseFamilyId = null;

            if (user.getFamily() != null
                    && user.getFamily().getId() != null) {

                databaseFamilyId =
                        user.getFamily().getId();
            }

            /*
             * --------------------------------------------------
             * CASE 1:
             *
             * Token belongs to a family but the user
             * no longer belongs to any family.
             *
             * Example:
             *
             * JWT      -> familyId = 4
             * Database -> familyId = NULL
             *
             * This is exactly what happens after a member
             * is removed.
             * --------------------------------------------------
             */

            if (tokenFamilyId != null
                    && databaseFamilyId == null) {

                System.out.println(
                        "JWT rejected: user no longer belongs "
                                + "to the family in the token"
                );

                return false;
            }

            /*
             * --------------------------------------------------
             * CASE 2:
             *
             * Token family and current database family
             * are different.
             *
             * Example:
             *
             * JWT      -> familyId = 4
             * Database -> familyId = 7
             *
             * This prevents an old family token from being
             * reused after the user joins another family.
             * --------------------------------------------------
             */

            if (tokenFamilyId != null
                    && databaseFamilyId != null
                    && !tokenFamilyId.equals(
                            databaseFamilyId)) {

                System.out.println(
                        "JWT rejected: family mismatch"
                );

                return false;
            }

            /*
             * Token does not contain a familyId.
             *
             * This is valid for a user who currently has
             * no family.
             *
             * Such a user can still use authenticated
             * endpoints such as creating or joining a family.
             */

            return true;

        } catch (Exception e) {

            System.out.println(
                    "JWT validation failed: "
                            + e.getMessage()
            );

            return false;
        }
    }
}