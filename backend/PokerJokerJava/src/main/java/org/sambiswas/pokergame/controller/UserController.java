package org.sambiswas.pokergame.controller;

import org.sambiswas.pokergame.common.entity.User;
import org.sambiswas.pokergame.common.request.UserRequestDTO;
import org.sambiswas.pokergame.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/getUser")
    public ResponseEntity<User> getUser(@RequestBody UserRequestDTO userRequestDTO) {
        return ResponseEntity.ok(userService.getUser(userRequestDTO));
    }

    @PostMapping("/createUser")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.createUser(user));
    }
}
