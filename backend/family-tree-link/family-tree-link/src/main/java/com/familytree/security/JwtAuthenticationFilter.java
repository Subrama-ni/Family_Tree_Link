package com.familytree.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;

import com.familytree.service.CustomUserDetailsService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final JwtService jwtService;

    private final CustomUserDetailsService
            userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService) {

        this.jwtService =
                jwtService;

        this.userDetailsService =
                userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader =
                request.getHeader("Authorization");

        String username = null;

        String jwt = null;


        /*
         * ======================================================
         * READ AUTHORIZATION HEADER
         * ======================================================
         */

        if (authHeader != null
                && authHeader.regionMatches(
                        true,
                        0,
                        "Bearer ",
                        0,
                        7)) {

            jwt =
                    authHeader.substring(7);

            try {

                username =
                        jwtService.extractEmail(jwt);

            } catch (Exception e) {

                System.out.println(
                        "Invalid JWT: "
                                + e.getMessage()
                );
            }
        }


        /*
         * ======================================================
         * AUTHENTICATE USER
         * ======================================================
         */

        if (username != null
                && SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        == null) {

            try {

                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(
                                        username
                                );

                boolean valid =
                        jwtService.isTokenValid(
                                jwt,
                                userDetailsService
                                        .getUserByEmail(
                                                username
                                        )
                        );

                if (valid) {

                    UsernamePasswordAuthenticationToken
                            authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(
                                    authentication
                            );

                    System.out.println(
                            "JWT authenticated: "
                                    + username
                    );
                }

            } catch (Exception e) {

                System.out.println(
                        "JWT authentication failed: "
                                + e.getMessage()
                );
            }
        }


        /*
         * ======================================================
         * CONTINUE REQUEST
         * ======================================================
         */

        filterChain.doFilter(
                request,
                response
        );
    }
}