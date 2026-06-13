package org.sambiswas.pokergame.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaFallbackController {

    // Forward any path without a file extension to index.html so React Router works.
    // Static assets (*.js, *.css, *.svg …) are served normally by Spring's resource handler.
    @GetMapping(value = {"/{path:[^\\.]*}", "/{path:[^\\.]*}/**"}, headers = "!Upgrade")
    public String forward() {
        return "forward:/index.html";
    }
}
