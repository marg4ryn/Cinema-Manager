variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "dockerhub_username" {
  description = "DockerHub username"
  type        = string
  default     = "marg4ryn"
}

provider "aws" {
  region = var.region
}

data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

# --- GRUPA BEZPIECZEŃSTWA ---
# Jedna grupa bezpieczeństwa dla obu instancji, aby ułatwić komunikację między nimi.
resource "aws_security_group" "app_sg_common" {
  name        = "app-sg-common-microservices"
  description = "Allow necessary ports for DB/MQ and Microservices communication"

  # Porty dla instancji DB i MQ (dostępne z internetu i od instancji Microservices)
  # SSH(22), Nginx(80), RabbitMQ(5672, 15672), MongoDB(27018, 27019)
  dynamic "ingress" {
    for_each = toset([22, 80, 5672, 15672, 27018, 27019])
    content {
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
      description = "Allow TCP port ${ingress.value} for DB/MQ"
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }
}


# --- ETAP 1: INSTANCJA DLA BAZ DANYCH I BROKERA WIADOMOŚCI ---
resource "aws_instance" "db_and_mq_server" {
  ami           = data.aws_ami.amazon_linux_2.id
  instance_type = "t2.micro"
  security_groups = [aws_security_group.app_sg_common.name]
  associate_public_ip_address = true

  tags = {
    Name  = "broker_and_db_server"
    Stage = "1"
  }

  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    amazon-linux-extras install docker -y
    systemctl start docker
    systemctl enable docker

    # Instalacja Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose

    # Czekaj na Docker
    for i in {1..30}; do docker info && break; echo "Waiting for Docker (DB/MQ)..."; sleep 2; done

    # Utwórz katalog dla konfiguracji
    DB_MQ_APP_DIR="/opt/db_mq_app"
    mkdir -p $DB_MQ_APP_DIR
    cd $DB_MQ_APP_DIR

    # Generowanie pliku docker-compose.yml dla baz i brokera
    cat > $DB_MQ_APP_DIR/docker-compose.yml << EOLComposeDBMQ
    version: "3.8"
    services:
      rabbitmq:
        image: rabbitmq:3-management
        container_name: rabbitmq
        ports:
          - "5672:5672"   # Wystawiony na hosta EC2
          - "15672:15672" # Wystawiony na hosta EC2
        environment:
          RABBITMQ_DEFAULT_USER: guest
          RABBITMQ_DEFAULT_PASS: guest

      mongo_movie:
        image: mongo:6
        container_name: mongo_movie
        ports:
          - "27018:27017" # Wystawiony na hosta EC2
        volumes:
          - mongo_movie_data:/data/db

      mongo_reservation:
        image: mongo:6
        container_name: mongo_reservation
        ports:
          - "27019:27017" # Wystawiony na hosta EC2
        volumes:
          - mongo_reservation_data:/data/db

    volumes:
      mongo_movie_data:
      mongo_reservation_data:
EOLComposeDBMQ

    # Uruchomienie Docker Compose dla baz i brokera
    /usr/local/bin/docker-compose -f $DB_MQ_APP_DIR/docker-compose.yml up -d
  EOF
}


# --- ETAP 2: INSTANCJA DLA MIKROSERWISÓW I NGINX ---
resource "aws_instance" "microservices_server" {
  ami           = data.aws_ami.amazon_linux_2.id
  instance_type = "t2.medium"
  security_groups = [aws_security_group.app_sg_common.name]
  associate_public_ip_address = true

  tags = {
    Name  = "microservices_app_server"
    Stage = "2"
  }

  # Zależność - ta instancja powinna być tworzona PO db_and_mq_server
  depends_on = [aws_instance.db_and_mq_server]

  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    amazon-linux-extras install docker -y
    systemctl start docker
    systemctl enable docker

    # Instalacja Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose

    # Czekaj na Docker
    for i in {1..30}; do docker info && break; echo "Waiting for Docker (Microservices)..."; sleep 2; done

    # Utwórz katalog dla konfiguracji
    MICROSERVICES_APP_DIR="/opt/microservices_app"
    mkdir -p $MICROSERVICES_APP_DIR
    cd $MICROSERVICES_APP_DIR

    # Adres IP instancji z bazami danych i RabbitMQ - przekazany z Terraform
    DB_MQ_SERVER_IP="${aws_instance.db_and_mq_server.public_ip}"

    # --- Generowanie pliku nginx.conf ---
    cat <<EONginx > $MICROSERVICES_APP_DIR/nginx.conf
    # Wewnątrz user_data, generowany jako /opt/microservices_app/nginx.conf
    events { worker_connections 1024; }

    http {
        # Definicje upstream dla serwisów
        upstream reservation_service_upstream {
            server reservation-service:3001;
        }
        upstream payment_service_upstream {
            server payment-service:3003;
        }
        # Dodaj pozostałe upstreamy dla innych serwisów (movie, ticket, notification)
        upstream movie_service_upstream {
            server movie-service:3002;
        }
        upstream ticket_service_upstream {
            server ticket-service:3004;
        }
        upstream notification_service_upstream {
            server notification-service:3005;
        }


        server {
            listen 80; # Nginx nasłuchuje na porcie 80 instancji EC2

            # Endpoint dla reservation-service: /select-session
            location = /select-session { # Używamy location = dla dokładnego dopasowania ścieżki
                proxy_pass http://reservation_service_upstream/select-session;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
            }

            # Endpoint dla reservation-service: /select-seat
            location = /select-seat { # Dokładne dopasowanie
                proxy_pass http://reservation_service_upstream/select-seat;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
            }

            # Endpoint dla payment-service: /respond
            location = /respond { # Dokładne dopasowanie
                proxy_pass http://payment_service_upstream/respond;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
            }

            # Domyślna odpowiedź dla innych ścieżek
            location / {
                return 200 'Microservices App (Stage 2) via Nginx - Available endpoints: /select-session, /select-seat, /respond\n';
            }
        }
    }
EONginx

    # --- Generowanie pliku docker-compose.yml dla mikroserwisów ---
    cat <<EODockerComposeMS > $MICROSERVICES_APP_DIR/docker-compose.yml
    version: '3.8'
    services:
      nginx-proxy:
        image: nginx:latest
        ports: ["80:80"]
        volumes: ["./nginx.conf:/etc/nginx/nginx.conf:ro"]
        depends_on: [reservation-service, movie-service, payment-service, ticket-service, notification-service]
        networks: [app_net]

      reservation-service:
        image: ${var.dockerhub_username}/reservation-service:latest
        depends_on: [] # Zależności od RabbitMQ/Mongo są teraz zewnętrzne
        environment:
          RABBITMQ_URL: amqp://guest:guest@$${DB_MQ_SERVER_IP}:5672 # Użycie IP serwera DB/MQ
          MONGO_URL: mongodb://$${DB_MQ_SERVER_IP}:27019/reservations # Użycie IP serwera DB/MQ
          PORT: 3001
        deploy: { replicas: 2 }
        networks: [app_net]

      movie-service:
        image: ${var.dockerhub_username}/movie-service:latest
        environment:
          RABBITMQ_URL: amqp://guest:guest@$${DB_MQ_SERVER_IP}:5672
          MONGO_URL: mongodb://$${DB_MQ_SERVER_IP}:27018/movies
          PORT: 3002
        deploy: { replicas: 2 }
        networks: [app_net]

      payment-service:
        image: ${var.dockerhub_username}/payment-service:latest
        environment:
          RABBITMQ_URL: amqp://guest:guest@$${DB_MQ_SERVER_IP}:5672
          PORT: 3003
        deploy: { replicas: 2 }
        networks: [app_net]

      ticket-service:
        image: ${var.dockerhub_username}/ticket-service:latest
        environment:
          RABBITMQ_URL: amqp://guest:guest@$${DB_MQ_SERVER_IP}:5672
          PORT: 3004
        deploy: { replicas: 2 }
        networks: [app_net]

      notification-service:
        image: ${var.dockerhub_username}/notification-service:latest
        environment:
          RABBITMQ_URL: amqp://guest:guest@$${DB_MQ_SERVER_IP}:5672
          PORT: 3005
        deploy: { replicas: 2 }
        networks: [app_net]
    networks:
      app_net:
        driver: overlay
EODockerComposeMS

    # Uruchomienie Docker Compose dla mikroserwisów
    /usr/local/bin/docker-compose -f $MICROSERVICES_APP_DIR/docker-compose.yml up -d
  EOF
}

# --- WYJŚCIA (OUTPUTS) ---
output "db_and_mq_server_public_ip" {
  value = aws_instance.db_and_mq_server.public_ip
  description = "Public IP of the DB and MQ server (Stage 1)"
}

output "microservices_server_public_ip" {
  value = aws_instance.microservices_server.public_ip
  description = "Public IP of the Microservices server (Stage 2)"
}

output "rabbitmq_management_url" {
  value = "http://${aws_instance.db_and_mq_server.public_ip}:15672"
  description = "URL for RabbitMQ Management UI"
}