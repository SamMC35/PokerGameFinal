package org.sambiswas.pokergame.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaFallbackController {

    // Only catch single-segment extension-free paths (/room, /game, etc.)
    // Multi-segment paths like /assets/index.js are left to Spring's static resource handler.
    @GetMapping(value = "/{path:[^\\.]*}", headers = "!Upgrade")
    public String forward() {
        return "forward:/index.html";
    }
}
