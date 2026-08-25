package com.familytree.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.familytree.security.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter
            jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http)
            throws Exception {

        http

            /*
             * ==================================================
             * CORS
             * ==================================================
             */

            .cors(cors ->
                    cors.configurationSource(
                            corsConfigurationSource()
                    )
            )

            /*
             * ==================================================
             * CSRF
             * ==================================================
             *
             * JWT authentication is stateless,
             * therefore CSRF protection is disabled.
             */

            .csrf(csrf ->
                    csrf.disable()
            )

            /*
             * ==================================================
             * SESSION
             * ==================================================
             */

            .sessionManagement(session ->
                    session.sessionCreationPolicy(
                            SessionCreationPolicy.STATELESS
                    )
            )

            /*
             * ==================================================
             * AUTHORIZATION
             * ==================================================
             */

            .authorizeHttpRequests(auth -> auth

                /*
                 * Browser CORS preflight requests
                 * do not contain JWT.
                 */
                .requestMatchers(
                        HttpMethod.OPTIONS,
                        "/**"
                ).permitAll()

                /*
                 * Authentication endpoints.
                 */
                .requestMatchers(
                        "/api/auth/**"
                ).permitAll()

                /*
                 * Uploaded files.
                 */
                .requestMatchers(
                        "/uploads/**"
                ).permitAll()

                /*
                 * Everything else requires
                 * a valid JWT.
                 */
                .anyRequest()
                .authenticated()
            )

            /*
             * Disable Spring's default login page.
             */
            .formLogin(form ->
                    form.disable()
            )

            /*
             * Disable HTTP Basic.
             */
            .httpBasic(httpBasic ->
                    httpBasic.disable()
            )

            /*
             * JWT authentication filter.
             */
            .addFilterBefore(
                    jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }


    /*
     * ==========================================================
     * CORS CONFIGURATION
     * ==========================================================
     */

    @Bean
    public CorsConfigurationSource
    corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        /*
         * React frontend.
         */
        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5173"
                )
        );

        /*
         * HTTP methods used by the application.
         */
        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        /*
         * Headers that React/browser can send.
         */
        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept"
                )
        );

        /*
         * Allow credentials if needed.
         */
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}