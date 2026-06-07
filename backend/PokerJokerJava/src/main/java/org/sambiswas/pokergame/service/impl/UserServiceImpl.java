package org.sambiswas.pokergame.service.impl;

import org.sambiswas.pokergame.common.entity.User;
import org.sambiswas.pokergame.common.exception.UserException;
import org.sambiswas.pokergame.common.request.UserRequestDTO;
import org.sambiswas.pokergame.repository.UserRepository;
import org.sambiswas.pokergame.service.UserService;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User getUser(UserRequestDTO userRequestDTO) {
        User byUserName = userRepository.getByUserName(userRequestDTO.getUserName());

        if(byUserName == null) {
            throw new UserException("User not found");
        }else if(!userRequestDTO.getPassword().equals(byUserName.getPassword())) {
            throw new UserException("Password mismatch");
        } else {
            return byUserName;
        }
    }

    @Override
    public User createUser(User user) {
        if(userRepository.existsByUserName(user.getUserName())){
            throw new UserException("Username already exists");
        }
        return userRepository.save(user);
    }
}
