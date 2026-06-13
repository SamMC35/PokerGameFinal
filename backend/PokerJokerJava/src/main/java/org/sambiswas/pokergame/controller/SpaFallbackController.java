package org.sambiswas.pokergame.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.server.ResponseStatusException;

@Controller
public class SpaFallbackController {

    @GetMapping(value = {"/{path:[^\\.]*}", "/{path:[^\\.]*}/**"}, headers = "!Upgrade")
    public String forward(HttpServletRequest request) {
        // Let Spring's static resource handler serve files with extensions (.js, .css, etc.)
        if (request.getRequestURI().contains(".")) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return "forward:/index.html";
    }
}
