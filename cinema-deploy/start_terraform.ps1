$env:AWS_ACCESS_KEY_ID = ""
$env:AWS_SECRET_ACCESS_KEY = ""
$env:AWS_SESSION_TOKEN = ""

terraform init
terraform plan
terraform apply
