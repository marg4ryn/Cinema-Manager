output "public_ip" {
  value = aws_instance.db_and_mq.public_ip
}
