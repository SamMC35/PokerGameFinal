package org.sambiswas.pokergame.controller;

import org.sambiswas.pokergame.common.exception.RoomException;
import org.sambiswas.pokergame.common.exception.UserException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ExceptionHandlerController {

    @ExceptionHandler(UserException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public void handleUserException(UserException e) {}

    @ExceptionHandler(RoomException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public void handleRoomException(RoomException e) {}


}
