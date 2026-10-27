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

<<<<<<< HEAD
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
=======
        if (user.getFamily() != null) {
>>>>>>> c7b61ee503c7cbdb5f4980f931cd30796724d39b

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

<<<<<<< HEAD
    /*
     * ============================================================
     * EXTRACT EMAIL
     * ============================================================
     */

=======
>>>>>>> c7b61ee503c7cbdb5f4980f931cd30796724d39b
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

<<<<<<< HEAD
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

=======
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

>>>>>>> c7b61ee503c7cbdb5f4980f931cd30796724d39b
        if (userId == null) {
            return null;
        }

        return ((Number) userId).longValue();
    }

<<<<<<< HEAD
    /*
     * ============================================================
     * EXTRACT FAMILY ID
     * ============================================================
     */

=======
>>>>>>> c7b61ee503c7cbdb5f4980f931cd30796724d39b
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
<<<<<<< HEAD

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
=======
>>>>>>> c7b61ee503c7cbdb5f4980f931cd30796724d39b

    public boolean isTokenValid(
            String token,
            User user) {

        try {

            String email =
                    extractEmail(token);

<<<<<<< HEAD
            /*
             * Basic identity validation.
             */

            if (!email.equals(
                    user.getEmail())) {

=======
            if (!email.equals(user.getEmail())) {
>>>>>>> c7b61ee503c7cbdb5f4980f931cd30796724d39b
                return false;
            }

            /*
             * ==================================================
<<<<<<< HEAD
             * FAMILY VALIDATION
             * ==================================================
=======
             * VERIFY CURRENT FAMILY MEMBERSHIP
             * ==================================================
             *
             * The database is the source of truth.
             *
             * This prevents an old JWT from continuing to
             * access a family after the user has been removed.
>>>>>>> c7b61ee503c7cbdb5f4980f931cd30796724d39b
             */

            Long tokenFamilyId =
                    extractFamilyId(token);

<<<<<<< HEAD
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
=======
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
>>>>>>> c7b61ee503c7cbdb5f4980f931cd30796724d39b

                return false;
            }

            /*
<<<<<<< HEAD
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
=======
             * Token family and current database family
             * must match.
             */
            if (tokenFamilyId != null
                    && !tokenFamilyId.equals(
                            currentFamilyId)) {
>>>>>>> c7b61ee503c7cbdb5f4980f931cd30796724d39b

                return false;
            }

            /*
<<<<<<< HEAD
             * Token does not contain a familyId.
             *
             * This is valid for a user who currently has
             * no family.
             *
             * Such a user can still use authenticated
             * endpoints such as creating or joining a family.
             */

            return true;
=======
             * Both are null.
             * User currently has no family.
             */
            return tokenFamilyId == null
                    && currentFamilyId == null
                    || tokenFamilyId != null
                    && tokenFamilyId.equals(
                            currentFamilyId);
>>>>>>> c7b61ee503c7cbdb5f4980f931cd30796724d39b

        } catch (Exception e) {

            System.out.println(
                    "JWT validation failed: "
                            + e.getMessage()
            );

            return false;
        }
    }
}
