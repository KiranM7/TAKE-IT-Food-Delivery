package com.takeit.config;

import com.takeit.security.JwtAuthenticationFilter;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    // Prevent Spring Boot from registering the JWT filter twice.
    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> jwtFilterRegistration(
            JwtAuthenticationFilter filter) {

        FilterRegistrationBean<JwtAuthenticationFilter> registration =
                new FilterRegistrationBean<>(filter);

        registration.setEnabled(false);
        return registration;
    }

    // Allow requests from the React development server.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of("http://localhost:5173", "http://127.0.0.1:5173")
        );

        configuration.setAllowedMethods(
                List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        );

        configuration.setAllowedHeaders(
                List.of("Authorization", "Content-Type", "Accept")
        );

        configuration.setExposedHeaders(
                List.of("Authorization")
        );

        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())

            .sessionManagement(session -> session
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .exceptionHandling(exceptions -> exceptions
                    .authenticationEntryPoint(
                            new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)
                    )
                    .accessDeniedHandler((request, response, exception) -> {
                        response.setStatus(HttpStatus.FORBIDDEN.value());
                        response.setContentType("application/json");
                        response.setCharacterEncoding("UTF-8");

                        response.getWriter().write(
                                "{\"message\":\"You do not have permission to access this resource\"}"
                        );
                    })
            )

            .authorizeHttpRequests(auth -> auth

                    // Allow browser preflight requests.
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                    // Public authentication endpoints.
                    .requestMatchers(
                            "/api/auth/register",
                            "/api/auth/login",
                            "/error"
                    ).permitAll()

                    // Public homepage endpoint.
                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/home"
                    ).permitAll()

                    // Public restaurant browsing.
                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/restaurants",
                            "/api/restaurants/*",
                            "/api/restaurants/search",
                            "/api/restaurants/cuisine"
                    ).permitAll()

                    // Public category and dish browsing.
                    // Remove these rules if your application requires login
                    // to browse categories or dishes.
                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/categories",
                            "/api/categories/**",
                            "/api/dishes",
                            "/api/dishes/**"
                    ).permitAll()

                    // Admin-only endpoints.
                    .requestMatchers("/api/admin/**").hasRole("ADMIN")

                    // Restaurant-owner-only endpoints.
                    .requestMatchers("/api/owner/**").hasRole("RESTAURANT_OWNER")

                    // User-only endpoints.
                    .requestMatchers("/api/user/**").hasRole("USER")

                    // All other endpoints require authentication.
                    .anyRequest().authenticated()
            )

            .addFilterBefore(
                    jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}