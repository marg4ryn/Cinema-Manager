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
  name        = "app-sg-1"
  description = "Allow all necessary ports for app"

  dynamic "ingress" {
    for_each = toset([22, 80, 443, 5672, 15672, 27017, 27018, 27019, 3001, 3002, 3003, 3004, 3005])
    content {
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
      description = "Allow TCP port ${ingress.value}"
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      security_groups  = []
      self             = false
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
    ipv6_cidr_blocks = []
    prefix_list_ids  = []
    security_groups  = []
    self             = false
  }
}

resource "aws_instance" "db_and_mq" {
  ami           = data.aws_ami.amazon_linux_2.id
  instance_type = "t2.micro"
  security_groups = [aws_security_group.app_sg.name]
  associate_public_ip_address = true

  tags = {
    Name = "broker_and_db"
  }

  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    amazon-linux-extras install docker -y
    systemctl start docker
    systemctl enable docker

    curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

    cat > /home/ec2-user/docker-compose.yml << EOL
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
    EOL

    cd /home/ec2-user
    docker-compose up -d
  EOF
}
