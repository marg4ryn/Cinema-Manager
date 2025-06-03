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
resource "aws_security_group" "app_sg_common" {
  name        = "app-sg-common-microservices"
  description = "Allow necessary ports for DB/MQ and Microservices communication"

  dynamic "ingress" {
    # Porty: SSH(22), RabbitMQ(5672, 15672), MongoDB(27018, 27019)
    for_each = toset([22, 5672, 15672, 27018, 27019, 3001, 3002, 3003, 3004, 3005])
    content {
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
      description = "Allow TCP port ${ingress.value}"
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
  ami                         = data.aws_ami.amazon_linux_2.id
  instance_type               = "t2.micro"
  security_groups             = [aws_security_group.app_sg_common.name]
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

    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose

    for i in {1..30}; do docker info && break; echo "Waiting for Docker (DB/MQ)..."; sleep 2; done

    DB_MQ_APP_DIR="/opt/db_mq_app"
    mkdir -p $DB_MQ_APP_DIR
    cd $DB_MQ_APP_DIR

    cat > $DB_MQ_APP_DIR/docker-compose.yml << EOLComposeDBMQ
    version: "3.8"
    services:
      rabbitmq:
        image: rabbitmq:3-management
        container_name: rabbitmq
        ports:
          - "5672:5672"
          - "15672:15672"
        environment:
          RABBITMQ_DEFAULT_USER: guest
          RABBITMQ_DEFAULT_PASS: guest

      mongo_movie:
        image: mongo:6
        container_name: mongo_movie
        ports:
          - "27018:27017"
        volumes:
          - mongo_movie_data:/data/db

      mongo_reservation:
        image: mongo:6
        container_name: mongo_reservation
        ports:
          - "27019:27017"
        volumes:
          - mongo_reservation_data:/data/db

    volumes:
      mongo_movie_data:
      mongo_reservation_data:
EOLComposeDBMQ

    /usr/local/bin/docker-compose -f $DB_MQ_APP_DIR/docker-compose.yml up -d
  EOF
}


# --- ETAP 2: INSTANCJA DLA MIKROSERWISÓW ---
resource "aws_instance" "microservices_server" {
  ami                         = data.aws_ami.amazon_linux_2.id
  instance_type               = "t2.medium"
  security_groups             = [aws_security_group.app_sg_common.name]
  associate_public_ip_address = true

  tags = {
    Name  = "microservices_app_server"
    Stage = "2"
  }

  depends_on = [aws_instance.db_and_mq_server]

  user_data = <<-EOF
    #!/bin/bash
    exec > /var/log/user-data.log 2>&1
    set -x

    echo "=== [START] user_data ==="

    yum update -y
    amazon-linux-extras install docker -y
    systemctl start docker
    systemctl enable docker

    echo "== Installing Docker Compose =="
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

    echo "== Waiting for Docker daemon =="
    for i in {1..30}; do
      docker info && break
      echo "Waiting for Docker to be ready..."
      sleep 2
    done

    MICROSERVICES_APP_DIR="/opt/microservices_app"
    mkdir -p "$MICROSERVICES_APP_DIR"
    cd "$MICROSERVICES_APP_DIR"

    DB_MQ_SERVER_IP="${aws_instance.db_and_mq_server.public_ip}"

    echo "== Generating docker-compose.yml =="

    cat <<EODockerComposeMS > "$MICROSERVICES_APP_DIR/docker-compose.yml"
    version: '3.8'
    services:
      reservation-service:
        image: ${var.dockerhub_username}/reservation-service:latest
        deploy:
          replicas: 2
        environment:
          RABBITMQ_URL: amqp://guest:guest@${aws_instance.db_and_mq_server.public_ip}:5672
          MONGO_URL: mongodb://${aws_instance.db_and_mq_server.public_ip}:27019/reservations
          PORT: 3001

      movie-service:
        image: ${var.dockerhub_username}/movie-service:latest
        deploy:
          replicas: 2
        environment:
          RABBITMQ_URL: amqp://guest:guest@${aws_instance.db_and_mq_server.public_ip}:5672
          MONGO_URL: mongodb://${aws_instance.db_and_mq_server.public_ip}:27018/movies
          PORT: 3002

      payment-service:
        image: ${var.dockerhub_username}/payment-service:latest
        deploy:
          replicas: 2
        environment:
          RABBITMQ_URL: amqp://guest:guest@${aws_instance.db_and_mq_server.public_ip}:5672
          PORT: 3003

      ticket-service:
        image: ${var.dockerhub_username}/ticket-service:latest
        deploy:
          replicas: 2
        environment:
          RABBITMQ_URL: amqp://guest:guest@${aws_instance.db_and_mq_server.public_ip}:5672
          PORT: 3004

      notification-service:
        image: ${var.dockerhub_username}/notification-service:latest
        deploy:
          replicas: 2
        environment:
          RABBITMQ_URL: amqp://guest:guest@${aws_instance.db_and_mq_server.public_ip}:5672
          PORT: 3005

    EODockerComposeMS

    echo "== Running docker-compose up =="

    docker-compose -f "$MICROSERVICES_APP_DIR/docker-compose.yml" up -d

    echo "=== [END] user_data ==="
  EOF
}

# --- WYJŚCIA (OUTPUTS) ---
output "db_and_mq_server_public_ip" {
  value       = aws_instance.db_and_mq_server.public_ip
  description = "Public IP of the DB and MQ server (Stage 1)"
}

output "microservices_server_public_ip" {
  value       = aws_instance.microservices_server.public_ip
  description = "Public IP of the Microservices server (Stage 2)."
}
