package org.sambiswas.pokergame.repository;

import org.sambiswas.pokergame.common.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    User getByUserName(String userName);

    Boolean existsByUserName(String userName);
}
