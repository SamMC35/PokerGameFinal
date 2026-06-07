package org.sambiswas.pokergame.service;

import org.sambiswas.pokergame.common.entity.User;
import org.sambiswas.pokergame.common.request.UserRequestDTO;

public interface UserService {
    User getUser(UserRequestDTO userRequestDTO);

    User createUser(User user);
}
