# AWS CREDENTIALS VARIABLES
variable "AWS_ACCESS_KEY_ID" { type = string }
variable "AWS_SECRET_ACCESS_KEY" { type = string }
variable "AWS_REGION" { type = string }
variable "AWS_ACCOUNT_ID" {}

# VPC VARIABLES
variable "CIDR_BLOCK" {
  type = list
  default = [
    "10.0.0.0/16",
    "10.0.1.0/24",
    "10.0.2.0/24",
    "10.0.3.0/24",
    "10.0.4.0/24"
  ]

}
variable "VPC_Name" { type = string }
variable "SUBNET_A_Name" { type = string }
variable "SUBNET_B_Name" { type = string }
variable "SUBNET_C_Name" { type = string }
variable "Zone_1_Name" { type = string }
variable "Zone_2_Name" { type = string }
variable "Zone_3_Name" { type = string }
variable "IPGW_Name" { type = string }
variable "Route_Table_Name" { type = string }
variable "SUBNET_GROUP_NAME" { type = string }

# SECURITY GROUP VARIABLES
variable "TCP_PROTOCOL" {}
variable "EGRESS_PROTOCOL" {}
variable "HTTP_PORT" {}
variable "HTTPS_PORT" {}
variable "SSH_PORT" {}
variable "NODEJS_PORT" {}
variable "POSTGRES_PORT" {}
variable "EGRESS_PORT" {}
variable "LOAD_BALANCER_SECURITY_CIDR" {}

# RDS VARIABLES

variable "RDS_STORAGE_TYPE" {}
variable "RDS_ENGINE" {}
variable "RDS_ENGINE_VERSION" {}
variable "RDS_MULTI_AZ" {}
variable "RDS_IDENTIFIER" {}
variable "RDS_INSTANCE_CLASS" {}
variable "RDS_NAME" {}
variable "RDS_FINAL_SNAPSHOT_IDENTIFIER" {}
variable "RDS_USERNAME" { type = string }
variable "RDS_PASSWORD" { type = string }
variable "RDS_PUBLIC_ACCESSIBILITY" {}
variable "RDS_SKIP_FINAL_SNAPSHOT" {}

# EC 2 Details
variable "EBS_DEVICE_NAME" { type = string }
variable "EBS_VOLUME_SIZE" {}
variable "EBS_VOLUME_TYPE" {}
variable "ASG_INSTANCE_TYPE" {}
variable "ASG_KEY_NAME" {}


# S3 BUCKET 

variable "WEBAPP_BUCKET_NAME" { type = string }
variable "WEBAPP_BUCKET_ACL" {}
variable "WEBAPP_BUCKET_STORAGE_CLASS" {}
variable "WEBAPP_BUCKET_SEE_ALGORITHM" {}

# DYNAMO DB 

variable "DYNAMO_DB_NAME" {}
variable "DYNAMO_DB_HASH_KEY" {}

# CODEDEPLOY 

variable "CODEDEPLOY_BUCKET_NAME" { type = string }
variable "CODEDEPLOY_APPLICATION_NAME" {}

# ROUTE 53

variable "HOSTED_ZONE" {}
variable "HOSTED_ZONE_ID" {}
variable "API_DNS_RECORD_NAME" {}
variable "API_DNS_RECORD_TYPE" {}

# LAMBDA

variable "LAMBDA_BUCKET_NAME" {}
variable "LAMBDA_BUCKET_ACL" {}

# SSL
variable "SSL_ARN" {}


