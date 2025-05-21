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

resource "aws_security_group" "app_sg" {
  name        = "app-sg-microservices"
  description = "Allow traffic to/from services"

  dynamic "ingress" {
    for_each = toset([22, 80, 443, 5672, 15672, 27017, 27018, 27019, 3001, 3002, 3003, 3004, 3005])
    content {
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "microservices" {
  ami           = data.aws_ami.amazon_linux_2.id
  instance_type = "t2.micro"
  security_groups = [aws_security_group.app_sg.name]
  associate_public_ip_address = true

  tags = {
    Name = "microservices"
  }

  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    yum install -y docker
    systemctl start docker
    systemctl enable docker

    for i in {1..30}; do
      docker info && break
      echo "Waiting for Docker..."
      sleep 2
    done

    docker run -d --name app-reservation-service -p 3001:3001 -e RABBITMQ_URL="amqp://guest:guest@${var.IP}:5672" -e MONGO_URL="mongodb://${var.IP}:27019" marg4ryn/reservation-service
    docker run -d --name app-movie-service -p 3002:3002 -e RABBITMQ_URL="amqp://guest:guest@${var.IP}:5672" -e MONGO_URL="mongodb://${var.IP}:27018" marg4ryn/movie-service
    docker run -d --name app-payment-service -p 3003:3003 -e RABBITMQ_URL="amqp://guest:guest@${var.IP}:5672" marg4ryn/payment-service
    docker run -d --name app-ticket-service -p 3004:3004 -e RABBITMQ_URL="amqp://guest:guest@${var.IP}:5672" marg4ryn/ticket-service
    docker run -d --name app-notification-service -p 3005:3005 -e RABBITMQ_URL="amqp://guest:guest@${var.IP}:5672" marg4ryn/notification-service

  EOF
}

