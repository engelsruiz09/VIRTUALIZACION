provider "kubernetes" {
  config_path = "~/.kube/config"
}

// Deployment para la API
resource "kubernetes_deployment" "api" {
  metadata {
    name = "api"
  }
  spec {
    replicas = 2
    selector {
      match_labels = {
        app = "api"
      }
    }
    template {
      metadata {
        labels = {
          app = "api"
        }
      }
      spec {
        container {
          image = "jaerc09/preparcial-api:latest"
          name  = "api"
          port {
            container_port = 5000
          }
        }
      }
    }
  }
}

// Deployment para MongoDB
resource "kubernetes_deployment" "mongo" {
  metadata {
    name = "mongo"
  }
  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "mongo"
      }
    }
    template {
      metadata {
        labels = {
          app = "mongo"
        }
      }
      spec {
        container {
          image = "mongo:latest"
          name  = "mongo"
          port {
            container_port = 27017
          }
        }
      }
    }
  }
}

// Deployment para la Landing Page
resource "kubernetes_persistent_volume_claim" "site-content" {
  metadata {
    name = "site-content"
  }
  spec {
    access_modes = ["ReadWriteOnce"]
    resources {
      requests = {
        storage = "1Gi"
      }
    }
  }
}

resource "kubernetes_deployment" "landing_page" {
  metadata {
    name = "landing-page"
  }
  spec {
    replicas = 2
    selector {
      match_labels = {
        app = "landing-page"
      }
    }
    template {
      metadata {
        labels = {
          app = "landing-page"
        }
      }
      spec {
        container {
          image = "nginx:latest"
          name  = "landing-page"
          port {
            container_port = 80
          }
          #volume_mount {
            #name       = "site-content"
           # mount_path = "/usr/share/nginx/html"
          #}
        }
        #volume {
          #name = "site-content"
          #persistent_volume_claim {
            #claim_name = "site-content"
          #}
        #}
      }
    }
  }
}

