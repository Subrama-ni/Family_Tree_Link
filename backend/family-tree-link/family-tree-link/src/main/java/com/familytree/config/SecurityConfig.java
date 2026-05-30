package com.familytree.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http)
            throws Exception {

        http

            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth

                .requestMatchers(

                    "/api/auth/**",

                    "/api/members/**",

                    "/api/relationships/**",

                    "/api/events/**",
                    "/api/photos/**",

                    "/uploads/**"

                )

                .permitAll()

                .anyRequest()

                .authenticated()

            )

            .formLogin(form -> form.disable())

            .httpBasic(httpBasic -> httpBasic.disable());

        return http.build();
    }
}