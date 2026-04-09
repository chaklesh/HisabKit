package com.nayag.hisabkit.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@ToString(exclude = "passwordHash")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true)
    private String email;

    @Column(unique = true)
    private String mobile;

    @Column(name = "google_subject", unique = true)
    private String googleSubject;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "avatar_url", columnDefinition = "LONGTEXT")
    private String avatarUrl;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "is_active")
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;
}
