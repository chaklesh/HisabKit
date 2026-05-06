package com.nayag.hisabkit.modules.identity.repository;

import com.nayag.hisabkit.modules.identity.model.User;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
  Optional<User> findByUsername(String username);

  Optional<User> findByUsernameIgnoreCase(String username);

  Optional<User> findByEmailIgnoreCase(String email);

  Optional<User> findByMobile(String mobile);

  Optional<User> findByGoogleSubject(String googleSubject);
}
