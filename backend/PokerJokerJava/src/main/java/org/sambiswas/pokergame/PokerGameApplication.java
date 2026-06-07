package org.sambiswas.pokergame;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan
@EnableJpaRepositories
public class PokerGameApplication {
    public static void main(String[] args) {
        SpringApplication.run(PokerGameApplication.class, args);
    }
}
