package com.sistema.gestion.sistema_gestion_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

//@SpringBootApplication
//Esto es solo hasta configurar una base de datos, para que no tire error de conexion a la base de datos
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class SistemaGestionApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(SistemaGestionApiApplication.class, args);
	}

}
