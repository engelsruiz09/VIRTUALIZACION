terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 2.13"
    }
  }
}

provider "docker" {
  host = "npipe:////.//pipe//docker_engine"
}

resource "docker_container" "mi_app_monolitica" {
  name  = "app-monolitica-terraform"
  image = "app-monolitica-app-monolitica:latest" 
  must_run = true
  
  # Configura los puertos si tu contenedor necesita puertos expuestos
  ports {
    internal = 8080
    external = 8090
  }
}



