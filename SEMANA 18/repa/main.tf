provider "kubernetes" {
  config_path = "~/.kube/config"
}

resource "kubernetes_deployment" "python-api" {
  metadata {
    name = "python-api"
  }
  spec {
    replicas = 2
    selector {
      match_labels = {
        app = "python-api"
      }
    }
    template {
      metadata {
        labels = {
          app = "python-api"
        }
      }
      spec {
        container {
          image = "jaerc09/python-api:latest"
          name  = "python-api"
          port {
            container_port = 5000
          }
        }
      }
    }
  }
}

resource "kubernetes_deployment" "postgres" {
  metadata {
    name = "postgres"
  }
  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "postgres"
      }
    }
    template {
      metadata {
        labels = {
          app = "postgres"
        }
      }
      spec {
        container {
          image = "postgres:latest"
          name  = "postgres"
          env {
            name  = "POSTGRES_DB"
            value = "exampledb"
          }
          env {
            name  = "POSTGRES_USER"
            value = "user"
          }
          env {
            name  = "POSTGRES_PASSWORD"
            value = "password"
          }
          port {
            container_port = 5432
          }
        }
      }
    }
  }
}
