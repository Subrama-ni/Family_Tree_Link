package com.familytree.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.familytree.entity.User;
import com.familytree.repository.UserRepository;

@Service
public class CustomUserDetailsService
        implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(
            UserRepository userRepository) {

        this.userRepository =
                userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(
            String email)
            throws UsernameNotFoundException {

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () -> new UsernameNotFoundException(
                                        "User not found with email: "
                                                + email
                                )
                        );

        return new UserDetails() {

            @Override
            public String getUsername() {
                return user.getEmail();
            }

            @Override
            public String getPassword() {
                return user.getPassword();
            }

            @Override
            public java.util.Collection<
                    ? extends org.springframework.security.core.GrantedAuthority>
            getAuthorities() {

                return java.util.Collections.emptyList();
            }

            @Override
            public boolean isAccountNonExpired() {
                return true;
            }

            @Override
            public boolean isAccountNonLocked() {
                return true;
            }

            @Override
            public boolean isCredentialsNonExpired() {
                return true;
            }

            @Override
            public boolean isEnabled() {
                return true;
            }
        };
    }

    public User getUserByEmail(
            String email) {

        return userRepository
                .findByEmail(email)
                .orElseThrow(
                        () -> new UsernameNotFoundException(
                                "User not found with email: "
                                        + email
                        )
                );
    }
}