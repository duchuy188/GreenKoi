package com.koipond.backend.security;

import com.koipond.backend.model.User;
import com.koipond.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.GrantedAuthority;
import java.util.Collection;
import java.util.Collections;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.info("Attempting to load user: {}", username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.error("User not found: {}", username);
                    return new UsernameNotFoundException("User not found with username: " + username);
                });
        logger.info("User found: {}", user);

        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRoleId());
        logger.info("Created authority for user {}: {}", username, authority);

        return new CustomUserDetails(
                user.getId(),
                user.getUsername(),
                user.getPassword(),
                Collections.singletonList(authority)
        );
    }

    // Inner class CustomUserDetails
    public static class CustomUserDetails implements UserDetails {
        private String id;
        private String username;
        private String password;
        private Collection<? extends GrantedAuthority> authorities;

        public CustomUserDetails(String id, String username, String password, Collection<? extends GrantedAuthority> authorities) {
            this.id = id;
            this.username = username;
            this.password = password;
            this.authorities = authorities;
        }

        public String getId() {
            return id;
        }

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            return authorities;
        }

        @Override
        public String getPassword() {
            return password;
        }

        @Override
        public String getUsername() {
            return username;
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
    }
}
