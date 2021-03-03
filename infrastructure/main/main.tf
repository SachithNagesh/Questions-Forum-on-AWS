##########################################
# Retrieve the latest AMI id
##########################################

data "aws_ami" "LATEST_AMI" {
  most_recent = true
  owners      = ["463176392124"]
}

provider "aws" {
  region = var.AWS_REGION
}

################################################################################

# VPC Resouce

# 1. Create VPC resource - csye6225_vpc

################################################################################

# Create VPC Resource
resource "aws_vpc" "csye6225_vpc" {
  cidr_block                       = "${element(var.CIDR_BLOCK, 0)}"
  enable_dns_hostnames             = true
  enable_dns_support               = true
  enable_classiclink_dns_support   = true
  assign_generated_ipv6_cidr_block = false

  tags = {
    Name = "${var.VPC_Name}",
  }
}

################################################################################

# CREATE 3 Sub Networks

# 1. Create Subnet 1
# 2. Create Subnet 2
# 3. Create Subnet 3

################################################################################

# Create Subnet 1 or A
resource "aws_subnet" "csye6225-subnet-a" {
  cidr_block              = "${element(var.CIDR_BLOCK, 1)}"
  vpc_id                  = "${aws_vpc.csye6225_vpc.id}"
  availability_zone       = "${var.Zone_1_Name}"
  map_public_ip_on_launch = true
  tags = {
    Name = "${var.SUBNET_A_Name}"
  }
}

# Create Subnet 2 or B
resource "aws_subnet" "csye6225-subnet-b" {
  cidr_block              = "${element(var.CIDR_BLOCK, 2)}"
  vpc_id                  = "${aws_vpc.csye6225_vpc.id}"
  availability_zone       = "${var.Zone_2_Name}"
  map_public_ip_on_launch = true
  tags = {
    Name = "${var.SUBNET_B_Name}"
  }
}

# Create Subnet 3 or C
resource "aws_subnet" "csye6225-subnet-c" {
  cidr_block              = "${element(var.CIDR_BLOCK, 3)}"
  vpc_id                  = "${aws_vpc.csye6225_vpc.id}"
  availability_zone       = "${var.Zone_3_Name}"
  map_public_ip_on_launch = true
  tags = {
    Name = "${var.SUBNET_C_Name}"
  }
}

################################################################################

# CREATE IP Gateway and Route Table

################################################################################

# Create IP Gateway
resource "aws_internet_gateway" "csye6225-igw" {
  vpc_id = "${aws_vpc.csye6225_vpc.id}"
  tags = {
    Name = "${var.IPGW_Name}"
  }
}

# Create Route Table
resource "aws_route_table" "csye6225-crt" {
  vpc_id = "${aws_vpc.csye6225_vpc.id}"

  route {
    //associated subnet can reach everywhere
    cidr_block = "0.0.0.0/0"
    //CRT uses this IGW to reach internet
    gateway_id = "${aws_internet_gateway.csye6225-igw.id}"
  }

  tags = {
    Name = "${var.Route_Table_Name}"
  }
}

################################################################################

# Associate the three created subnets to route table

################################################################################

# Associate route table to subnet-a
resource "aws_route_table_association" "csye6225-subnet-associationa" {
  subnet_id      = "${aws_subnet.csye6225-subnet-a.id}"
  route_table_id = "${aws_route_table.csye6225-crt.id}"
}

# Associate route table to subnet-b
resource "aws_route_table_association" "csye6225-subnet-associationb" {
  subnet_id      = "${aws_subnet.csye6225-subnet-b.id}"
  route_table_id = "${aws_route_table.csye6225-crt.id}"
}

# Associate route table to subnet-c
resource "aws_route_table_association" "csye6225-subnet-associationc" {
  subnet_id      = "${aws_subnet.csye6225-subnet-c.id}"
  route_table_id = "${aws_route_table.csye6225-crt.id}"
}

# Subnet group declaration
resource "aws_db_subnet_group" "csye6225-subnet-group" {
  name       = "csye6225-subnet-group"
  subnet_ids = ["${aws_subnet.csye6225-subnet-c.id}", "${aws_subnet.csye6225-subnet-a.id}", "${aws_subnet.csye6225-subnet-b.id}"]

  tags = {
    Name = var.SUBNET_GROUP_NAME
  }
}

################################################################################

# CREATE Load Balancer Security Group Bucket

# 1. Create AWS Load Balancer Security for application

################################################################################


resource "aws_security_group" "lb_security_group" {
  name        = "lb_security_group"
  description = "Load Balancer Security Group"
  vpc_id      = "${aws_vpc.csye6225_vpc.id}"

  ingress {
    description = "HTTP"
    from_port   = var.HTTP_PORT
    to_port     = var.HTTP_PORT
    protocol    = var.TCP_PROTOCOL
    cidr_blocks = [var.LOAD_BALANCER_SECURITY_CIDR]
  }

  ingress {
    description = "HTTPS"
    from_port   = var.HTTPS_PORT
    to_port     = var.HTTPS_PORT
    protocol    = var.TCP_PROTOCOL
    cidr_blocks = [var.LOAD_BALANCER_SECURITY_CIDR]
  }

  ingress {
    description = "SSH"
    from_port   = var.SSH_PORT
    to_port     = var.SSH_PORT
    protocol    = var.TCP_PROTOCOL
    cidr_blocks = [var.LOAD_BALANCER_SECURITY_CIDR]
  }


  egress {
    from_port   = var.EGRESS_PORT
    to_port     = var.EGRESS_PORT
    protocol    = var.EGRESS_PROTOCOL
    cidr_blocks = [var.LOAD_BALANCER_SECURITY_CIDR]
  }


  tags = {
    Name = "load balancer"
  }
}

################################################################################

# CREATE Application Security Group Bucket

# 1. Create AWS Security group for application

################################################################################

# EC2 SEcurity Group for Application
resource "aws_security_group" "application" {
  name        = "application"
  description = "Web Application Security Group"
  vpc_id      = "${aws_vpc.csye6225_vpc.id}"

  ingress {
    description     = "HTTP"
    from_port       = var.HTTP_PORT
    to_port         = var.HTTP_PORT
    protocol        = var.TCP_PROTOCOL
    security_groups = ["${aws_security_group.lb_security_group.id}"]
  }
  ingress {
    description     = "HTTPS"
    from_port       = var.HTTPS_PORT
    to_port         = var.HTTPS_PORT
    protocol        = var.TCP_PROTOCOL
    security_groups = ["${aws_security_group.lb_security_group.id}"]

  }

  ingress {
    description = "SSH"
    from_port   = var.SSH_PORT
    to_port     = var.SSH_PORT
    protocol    = var.TCP_PROTOCOL
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description     = "NodeJS Web Application"
    from_port       = var.NODEJS_PORT
    to_port         = var.NODEJS_PORT
    protocol        = var.TCP_PROTOCOL
    security_groups = ["${aws_security_group.lb_security_group.id}"]
  }

  # To communicate from Ec2 to outside world
  egress {
    from_port   = var.EGRESS_PORT
    to_port     = var.EGRESS_PORT
    protocol    = var.EGRESS_PROTOCOL
    cidr_blocks = [var.LOAD_BALANCER_SECURITY_CIDR]
  }

  tags = {
    Name = "application"
  }

}


################################################################################

# CREATE S3 Bucket

# 1. Create S3 Bucket

################################################################################



# aws kms key
# resource "aws_kms_key" "s3_ecryption_key" {
#   description             = "This key is used to encrypt bucket objects"
#   deletion_window_in_days = 10
# }

# S3 bucket Resource creation
resource "aws_s3_bucket" "webapp_sachith_nagesh" {

  bucket        = "${var.WEBAPP_BUCKET_NAME}"
  acl           = var.WEBAPP_BUCKET_ACL
  force_destroy = true

  versioning {
    enabled = true
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        # kms_master_key_id = "${aws_kms_key.s3_ecryption_key.arn}"
        sse_algorithm = var.WEBAPP_BUCKET_SEE_ALGORITHM
      }
    }
  }
  lifecycle_rule {
    enabled = true
    transition {
      days          = 30
      storage_class = var.WEBAPP_BUCKET_STORAGE_CLASS # or "ONEZONE_IA"
    }
    expiration {
      days = 90
    }
  }

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET", "DELETE"]
    allowed_origins = ["*"]
  }

  tags = {
    Name        = "S3_Sachith_Nagesh"
    Environment = "Dev"
  }
}


resource "aws_s3_bucket" "lambda_codedeploy_bucket" {
  bucket        = var.LAMBDA_BUCKET_NAME
  force_destroy = true
  acl           = var.LAMBDA_BUCKET_ACL
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
  cors_rule {
    allowed_headers = ["Authorization"]
    allowed_methods = ["GET", "POST", "DELETE"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }

  lifecycle_rule {
    enabled = true

    expiration {
      days = 30
    }
  }
}

################################################################################

# CREATE DATA Security Group and RDS Instance

# 1. Create Database Security Group - Point Application security group to it.
# 2. Create RDS Instance

################################################################################

# Database security group
resource "aws_security_group" "database" {
  name        = "database"
  description = "Database Security Group"
  vpc_id      = "${aws_vpc.csye6225_vpc.id}"

  ingress {
    description     = "Postgres"
    from_port       = var.POSTGRES_PORT
    to_port         = var.POSTGRES_PORT
    protocol        = var.TCP_PROTOCOL
    security_groups = [aws_security_group.application.id]
  }

  tags = {
    Name = "database"
  }

}

# RDS instance creation

resource "aws_db_parameter_group" "postgres-parameters" {
  name        = "postgres-parameters"
  family      = "postgres9.6"
  description = "Postgres parameter group"

  parameter {
    name         = "rds.force_ssl"
    value        = "1"
    apply_method = "pending-reboot"
  }
}

resource "aws_db_instance" "RDS_POSTGRES" {
  allocated_storage         = 20
  storage_type              = var.RDS_STORAGE_TYPE
  engine                    = var.RDS_ENGINE
  engine_version            = var.RDS_ENGINE_VERSION
  multi_az                  = var.RDS_MULTI_AZ
  identifier                = var.RDS_IDENTIFIER
  instance_class            = var.RDS_INSTANCE_CLASS
  username                  = var.RDS_USERNAME
  password                  = var.RDS_PASSWORD
  db_subnet_group_name      = "${aws_db_subnet_group.csye6225-subnet-group.id}"
  publicly_accessible       = var.RDS_PUBLIC_ACCESSIBILITY
  name                      = var.RDS_NAME
  vpc_security_group_ids    = [aws_security_group.database.id]
  final_snapshot_identifier = var.RDS_FINAL_SNAPSHOT_IDENTIFIER
  skip_final_snapshot       = var.RDS_SKIP_FINAL_SNAPSHOT
  storage_encrypted         = "true"
  parameter_group_name      = "${aws_db_parameter_group.postgres-parameters.name}"
}

################################################################################

# CREATE EC2 Instance and associate required parameters and Update DNS record with public_ip of created EC2

# 1. Create aws launch config
# 2. Create auto scale group
# 3. Add autoscaling policies for scale up and scale down
# 4. Add Cloud watch alarm for high and low CPU usage

################################################################################


resource "aws_launch_configuration" "asg_launch_config" {
  name                        = "asg_launch_config"
  image_id                    = "${data.aws_ami.LATEST_AMI.id}"
  instance_type               = var.ASG_INSTANCE_TYPE
  key_name                    = var.ASG_KEY_NAME
  associate_public_ip_address = true
  iam_instance_profile        = "${aws_iam_instance_profile.ec2instance_profile.name}"
  security_groups             = ["${aws_security_group.application.id}"]


  user_data = <<-EOF
                #!/bin/bash
                sudo touch /home/ubuntu/.env
                sudo echo "RDS_USERNAME=${aws_db_instance.RDS_POSTGRES.username}" >> /home/ubuntu/.env
                sudo echo "RDS_PASSWORD=${aws_db_instance.RDS_POSTGRES.password}" >> /home/ubuntu/.env
                sudo echo "RDS_HOSTNAME=${aws_db_instance.RDS_POSTGRES.address}" >> /home/ubuntu/.env
                sudo echo "S3_BUCKET_NAME=${aws_s3_bucket.webapp_sachith_nagesh.bucket}" >> /home/ubuntu/.env
                sudo echo "RDS_ENDPOINT=${aws_db_instance.RDS_POSTGRES.endpoint}" >> /home/ubuntu/.env
                sudo echo "RDS_DB_NAME=${aws_db_instance.RDS_POSTGRES.name}" >> /home/ubuntu/.env
                sudo echo "AWS_REGION=${var.AWS_REGION}" >> /home/ubuntu/.env
                sudo echo "SNS_TOPIC_ARN = "${aws_sns_topic.EmailSNSEndpoint.arn}"" >> /home/ubuntu/.env
        EOF

}

resource "aws_autoscaling_group" "asg" {
  default_cooldown     = 60
  launch_configuration = "${aws_launch_configuration.asg_launch_config.name}"
  min_size             = 3
  max_size             = 5
  desired_capacity     = 3
  health_check_type    = "EC2"
  vpc_zone_identifier  = ["${aws_subnet.csye6225-subnet-a.id}", "${aws_subnet.csye6225-subnet-b.id}", "${aws_subnet.csye6225-subnet-c.id}"]

  tag {
    key                 = "Instance_Name"
    value               = "ec2webapp"
    propagate_at_launch = true
  }
  target_group_arns = ["${aws_lb_target_group.aws_lg_target_group_webapp.arn}"]

}

resource "aws_autoscaling_policy" "WebServerScaleUpPolicy" {
  autoscaling_group_name = "${aws_autoscaling_group.asg.name}"
  name                   = "WebServerScaleUpPolicy"
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 60
  scaling_adjustment     = 1
}

resource "aws_autoscaling_policy" "WebServerScaleDownPolicy" {
  autoscaling_group_name = "${aws_autoscaling_group.asg.name}"
  name                   = "WebServerScaleDownPolicy"
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 60
  scaling_adjustment     = -1
}

resource "aws_cloudwatch_metric_alarm" "CPUAlarmHigh" {
  alarm_name          = "CPUAlarmHigh"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  threshold           = 5
  metric_name         = "CPUUtilization"
  statistic           = "Average"
  namespace           = "AWS/EC2"
  dimensions = {
    AutoScalingGroupName = "${aws_autoscaling_group.asg.name}"
  }
  alarm_actions     = [aws_autoscaling_policy.WebServerScaleUpPolicy.arn]
  alarm_description = "Scale-up if CPU > 5%"
  period            = 60
}

resource "aws_cloudwatch_metric_alarm" "CPUAlarmLow" {
  alarm_name          = "CPUAlarmLow"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  threshold           = 3
  metric_name         = "CPUUtilization"
  statistic           = "Average"
  namespace           = "AWS/EC2"
  dimensions = {
    AutoScalingGroupName = "${aws_autoscaling_group.asg.name}"
  }
  alarm_actions     = [aws_autoscaling_policy.WebServerScaleDownPolicy.arn]
  alarm_description = "Scale-down if CPU < 3%"
  period            = 60
}


################################################################################

# CREATE Load Balancer

# 1. Create target group for webapp
# 2. Create listener and forward to step 1's target group

################################################################################

resource "aws_lb" "csye-6225-lb" {
  name               = "csye-6225-lb"
  load_balancer_type = "application"
  subnets            = ["${aws_subnet.csye6225-subnet-a.id}", "${aws_subnet.csye6225-subnet-b.id}", "${aws_subnet.csye6225-subnet-c.id}"]
  security_groups    = ["${aws_security_group.lb_security_group.id}"]
  //  depends_on = [aws_security_group.loadBalancerSecurityGroup]
}

resource "aws_lb_target_group" "aws_lg_target_group_webapp" {
  name        = "aws-lg-target-group-webapp"
  target_type = "instance"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = "${aws_vpc.csye6225_vpc.id}"
  depends_on  = [aws_lb.csye-6225-lb]
}

resource "aws_lb_listener" "aws_lb_listener_backend" {
  load_balancer_arn = "${aws_lb.csye-6225-lb.arn}"
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = var.SSL_ARN
  default_action {
    type             = "forward"
    target_group_arn = "${aws_lb_target_group.aws_lg_target_group_webapp.arn}"
  }
}

data "aws_route53_zone" "zone" {
  name = "${var.HOSTED_ZONE}"
}


resource "aws_route53_record" "csye-dns" {
  allow_overwrite = true
  zone_id         = data.aws_route53_zone.zone.zone_id
  name            = "${data.aws_route53_zone.zone.name}"
  type            = var.API_DNS_RECORD_TYPE
  alias {
    name                   = "${aws_lb.csye-6225-lb.dns_name}"
    zone_id                = "${aws_lb.csye-6225-lb.zone_id}"
    evaluate_target_health = true
  }

}

output "ELB_IP" {
  value = "${aws_lb.csye-6225-lb.dns_name}"
}



################################################################################

# CREATE DynamoDB

################################################################################

resource "aws_dynamodb_table" "dynamo-db" {
  provider       = "aws"
  name           = var.DYNAMO_DB_NAME
  hash_key       = var.DYNAMO_DB_HASH_KEY
  read_capacity  = 1
  write_capacity = 1

  attribute {
    name = "id"
    type = "S"
  }
}

################################################################################

# CREATE CodeDeployEC2ServiceRole and create the following policies:

# 1. WebAppS3policy
# 2. CodeDeploy-EC2-S3

# Attach these policies to the to EC2 instance profile and link it to EC2 

################################################################################

resource "aws_iam_role" "CodeDeployEC2ServiceRole" {
  name = "CodeDeployEC2ServiceRole"

  assume_role_policy = <<EOF
{
      "Version": "2012-10-17",
      "Statement": [
        {
          "Action": "sts:AssumeRole",
          "Principal": {
            "Service": "ec2.amazonaws.com"
          },
          "Effect": "Allow",
          "Sid": ""
        }
      ]
}
EOF
}

resource "aws_iam_role_policy" "WebAppS3policy" {
  name = "WebAppS3policy"
  role = "${aws_iam_role.CodeDeployEC2ServiceRole.id}"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:Get*",
        "s3:List*",
        "s3:*Object"
      ],
      "Effect": "Allow",
      "Resource": [
                "arn:aws:s3:::${var.WEBAPP_BUCKET_NAME}",
                "arn:aws:s3:::${var.WEBAPP_BUCKET_NAME}/*"
            ]
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "CodeDeploy-EC2-S3" {
  name   = "CodeDeploy-EC2-S3"
  role   = "${aws_iam_role.CodeDeployEC2ServiceRole.id}"
  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "s3:Get*",
                "s3:List*"
            ],
            "Effect": "Allow",
            "Resource": [
                "arn:aws:s3:::${var.CODEDEPLOY_BUCKET_NAME}",
                "arn:aws:s3:::${var.CODEDEPLOY_BUCKET_NAME}/*"
              ]
        }
    ]
}
EOF
}


resource "aws_iam_role_policy_attachment" "CloudwatchAdminAttachment1" {
  role       = "${aws_iam_role.CodeDeployEC2ServiceRole.name}"
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentAdminPolicy"
}
resource "aws_iam_role_policy_attachment" "CloudwatchAdminAttachment2" {
  role       = "${aws_iam_role.CodeDeployEC2ServiceRole.name}"
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "CloudwatchServerAttachment1" {
  role       = "${aws_iam_role.CodeDeployEC2ServiceRole.name}"
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}



//creating instance profile
resource "aws_iam_instance_profile" "ec2instance_profile" {
  name = "ec2instance_profile"
  role = "${aws_iam_role.CodeDeployEC2ServiceRole.name}"
}


################################################################################

# Attach following IAM policies to the ghactions IAM user:

# 1. GH-Upload-To-S3
# 2. GH-Code-Deploy
# 3. gh-ec2-ami

################################################################################

resource "aws_iam_user_policy" "Upload-To-S3" {

  user   = "lambda"
  name   = "Upload-To-S3"
  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:Get*",
                "s3:List*"
            ],
            "Resource": [
                "arn:aws:s3:::${var.CODEDEPLOY_BUCKET_NAME}",
                "arn:aws:s3:::${var.CODEDEPLOY_BUCKET_NAME}/*",
                "arn:aws:s3:::${var.LAMBDA_BUCKET_NAME}",
                "arn:aws:s3:::${var.LAMBDA_BUCKET_NAME}/*"
            ]
        }
    ]
}
EOF
}

resource "aws_iam_user_policy" "Deploy-Lambda" {

  user   = "lambda"
  name   = "Deploy-Lambda"
  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "ActionsWhichSupportResourceLevelPermissions",
            "Effect": "Allow",
            "Action": [
                "lambda:AddPermission",
                "lambda:RemovePermission",
                "lambda:CreateAlias",
                "lambda:UpdateAlias",
                "lambda:DeleteAlias",
                "lambda:UpdateFunctionCode",
                "lambda:UpdateFunctionConfiguration",
                "lambda:PutFunctionConcurrency",
                "lambda:DeleteFunctionConcurrency",
                "lambda:PublishVersion"
            ],
            "Resource": "arn:aws:lambda:${var.AWS_REGION}:${var.AWS_ACCOUNT_ID}:function:${aws_lambda_function.lambdaFunction.function_name}"
        }
]
}
EOF
}

resource "aws_iam_user_policy" "GH-Upload-To-S3" {

  user   = "ghactions"
  name   = "GH-Upload-To-S3"
  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:Get*",
                "s3:List*"
            ],
            "Resource": [
                "arn:aws:s3:::${var.CODEDEPLOY_BUCKET_NAME}",
                "arn:aws:s3:::${var.CODEDEPLOY_BUCKET_NAME}/*"
            ]
        }
    ]
}
EOF
}


resource "aws_iam_user_policy" "GH-Code-Deploy" {
  user = "ghactions"
  name = "GH-Code-Deploy"

  policy = <<EOF
{
    "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "codedeploy:RegisterApplicationRevision",
        "codedeploy:GetApplicationRevision",
        "codedeploy:ListApplicationRevisions"
      ],
      "Resource": [
        "arn:aws:codedeploy:${var.AWS_REGION}:${var.AWS_ACCOUNT_ID}:application:${var.CODEDEPLOY_APPLICATION_NAME}"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "codedeploy:CreateDeployment",
        "codedeploy:GetDeployment",
        "codedeploy:GetDeploymentConfig"
      ],
      "Resource": [
        "*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "codedeploy:GetDeploymentConfig",
        "codedeploy:RegisterApplicationRevision",
        "codedeploy:ListApplicationRevisions",
        "codedeploy:GetApplicationRevision"
      ],
      "Resource": [
        "arn:aws:codedeploy:${var.AWS_REGION}:${var.AWS_ACCOUNT_ID}:deploymentconfig:CodeDeployDefault.OneAtATime",
        "arn:aws:codedeploy:${var.AWS_REGION}:${var.AWS_ACCOUNT_ID}:deploymentconfig:CodeDeployDefault.HalfAtATime",
        "arn:aws:codedeploy:${var.AWS_REGION}:${var.AWS_ACCOUNT_ID}:deploymentconfig:CodeDeployDefault.AllAtOnce"
      ]
    }
  ]
}
EOF
}

resource "aws_iam_user_policy" "gh-ec2-ami" {

  name = "gh-ec2-ami"
  user = "ghactions"

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:AttachVolume",
                "ec2:AuthorizeSecurityGroupIngress",
                "ec2:CopyImage",
                "ec2:CreateImage",
                "ec2:CreateKeypair",
                "ec2:CreateSecurityGroup",
                "ec2:CreateSnapshot",
                "ec2:CreateTags",
                "ec2:CreateVolume",
                "ec2:DeleteKeyPair",
                "ec2:DeleteSecurityGroup",
                "ec2:DeleteSnapshot",
                "ec2:DeleteVolume",
                "ec2:DeregisterImage",
                "ec2:DescribeImageAttribute",
                "ec2:DescribeImages",
                "ec2:DescribeInstances",
                "ec2:DescribeInstanceStatus",
                "ec2:DescribeRegions",
                "ec2:DescribeSecurityGroups",
                "ec2:DescribeSnapshots",
                "ec2:DescribeSubnets",
                "ec2:DescribeTags",
                "ec2:DescribeVolumes",
                "ec2:DetachVolume",
                "ec2:GetPasswordData",
                "ec2:ModifyImageAttribute",
                "ec2:ModifyInstanceAttribute",
                "ec2:ModifySnapshotAttribute",
                "ec2:RegisterImage",
                "ec2:RunInstances",
                "ec2:StopInstances",
                "ec2:TerminateInstances"
            ],
            "Resource": "*"
        }
    ]
}
EOF
}

################################################################################

# CREATE DEPLOYMENT ROLE, APPLICATION AND GROUP

# 1. Create CodeDeployServiceRole for deployment
# 2. Create AWS Codedeploy Application called "csye6225-webapp"
# 3. Create AWS aws_codedeploy_deployment_group for created AWS Codedeploy Application called "csye6225-webapp"

################################################################################

resource "aws_iam_role" "CodeDeployServiceRole" {

  name = "CodeDeployServiceRole"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "codedeploy.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

}

resource "aws_iam_role_policy_attachment" "AWSCodeDeployRole" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSCodeDeployRole"
  role       = aws_iam_role.CodeDeployServiceRole.name
}


resource "aws_codedeploy_app" "csye6225-webapp" {
  compute_platform = "Server" //This is EC2/On-premises
  name             = var.CODEDEPLOY_APPLICATION_NAME
}

resource "aws_codedeploy_deployment_group" "csye6225-webapp-deployment" {

  app_name              = "${aws_codedeploy_app.csye6225-webapp.name}"
  deployment_group_name = "csye6225-webapp-deployment"
  service_role_arn      = "${aws_iam_role.CodeDeployServiceRole.arn}"
  deployment_style {
    deployment_option = "WITHOUT_TRAFFIC_CONTROL"
    deployment_type   = "IN_PLACE"
  }
  deployment_config_name = "CodeDeployDefault.AllAtOnce"
  autoscaling_groups     = ["${aws_autoscaling_group.asg.name}"]

  ec2_tag_set {
    ec2_tag_filter {
      key   = "Name"
      type  = "KEY_AND_VALUE"
      value = "ec2webapp"
    }

  }
  auto_rollback_configuration {
    enabled = true
    events  = ["DEPLOYMENT_FAILURE"]
  }

}


################################################################################

# Lambda

################################################################################

resource "aws_iam_role" "LambdaExecutionServiceRole" {
  name               = "LambdaExecutionServiceRole"
  path               = "/"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": ["lambda.amazonaws.com","codedeploy.us-east-1.amazonaws.com"]
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
  tags = {
    Name = "CodeDeployLambdaServiceRole"
  }
}

resource "aws_lambda_function" "lambdaFunction" {
  function_name                  = "csye6225"
  filename                       = "${data.archive_file.dummy.output_path}"
  role                           = "${aws_iam_role.LambdaExecutionServiceRole.arn}"
  handler                        = "index.handler"
  runtime                        = "nodejs12.x"
  memory_size                    = 256
  timeout                        = 180
  reserved_concurrent_executions = 5

  environment {
    variables = {
      DOMAIN_NAME = var.HOSTED_ZONE
      table       = aws_dynamodb_table.dynamo-db.name
    }
  }
  tags = {
    Name = "Lambda Email"
  }
}


data "archive_file" "dummy" {
  type        = "zip"
  output_path = "${path.module}/lambda_function_payload.zip"

  source {
    content  = "dummy content"
    filename = "dummy.txt"

  }
}

resource "aws_sns_topic" "EmailSNSEndpoint" {
  name = "EmailSNSEndpoint"
}

resource "aws_sns_topic_subscription" "topicId" {
  topic_arn  = "${aws_sns_topic.EmailSNSEndpoint.arn}"
  protocol   = "lambda"
  endpoint   = "${aws_lambda_function.lambdaFunction.arn}"
  depends_on = [aws_lambda_function.lambdaFunction]
}

resource "aws_lambda_permission" "lambda_permission" {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  principal     = "sns.amazonaws.com"
  source_arn    = "${aws_sns_topic.EmailSNSEndpoint.arn}"
  function_name = "${aws_lambda_function.lambdaFunction.function_name}"
  depends_on    = [aws_lambda_function.lambdaFunction]
}

resource "aws_iam_policy" "lambda_policy" {
  name       = "lambda"
  depends_on = [aws_sns_topic.EmailSNSEndpoint]
  policy     = <<EOF
{
          "Version" : "2012-10-17",
          "Statement": [
            {
              "Sid": "LambdaDynamoDBAccess",
              "Effect": "Allow",
              "Action": ["dynamodb:GetItem",
              "dynamodb:PutItem",
              "dynamodb:UpdateItem"],
              "Resource": "arn:aws:dynamodb:${var.AWS_REGION}:${var.AWS_ACCOUNT_ID}:table/${var.DYNAMO_DB_NAME}"
            },
            {
              "Sid": "LambdaSESAccess",
              "Effect": "Allow",
              "Action": ["ses:VerifyEmailAddress",
              "ses:SendEmail",
              "ses:SendRawEmail"],
              "Resource": "arn:aws:ses:${var.AWS_REGION}:${var.AWS_ACCOUNT_ID}:identity/*"
            },
            {
              "Sid": "LambdaS3Access",
              "Effect": "Allow",
              "Action": ["s3:GetObject","s3:PutObject"],
              "Resource": "arn:aws:s3:::${var.LAMBDA_BUCKET_NAME}/*"
            },
            {
              "Sid": "LambdaSNSAccess",
              "Effect": "Allow",
              "Action": ["sns:ConfirmSubscription"],
              "Resource": "${aws_sns_topic.EmailSNSEndpoint.arn}"
            }
          ]
        }
EOF
}

resource "aws_iam_policy" "topic_policy" {
  name        = "Topic"
  description = ""
  depends_on  = [aws_sns_topic.EmailSNSEndpoint]
  policy      = <<EOF
{
          "Version" : "2012-10-17",
          "Statement": [
            {
              "Sid": "AllowEC2ToPublishToSNSTopic",
              "Effect": "Allow",
              "Action": ["sns:Publish",
              "sns:CreateTopic"],
              "Resource": "${aws_sns_topic.EmailSNSEndpoint.arn}"
            }
          ]
        }
EOF
}

resource "aws_iam_role_policy_attachment" "topic_policy_attach" {
  role       = "${aws_iam_role.CodeDeployEC2ServiceRole.name}"
  depends_on = [aws_iam_policy.topic_policy]
  policy_arn = "${aws_iam_policy.topic_policy.arn}"
}

resource "aws_iam_role_policy_attachment" "sns_policy_attach" {
  role       = "${aws_iam_role.CodeDeployEC2ServiceRole.name}"
  policy_arn = "arn:aws:iam::aws:policy/AmazonSNSFullAccess"

}

resource "aws_iam_role_policy_attachment" "lambda_policy_attach_predefinedrole" {
  role       = "${aws_iam_role.LambdaExecutionServiceRole.name}"
  depends_on = [aws_iam_role.LambdaExecutionServiceRole]
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_policy_attach_role" {
  role       = "${aws_iam_role.LambdaExecutionServiceRole.name}"
  depends_on = [aws_iam_role.LambdaExecutionServiceRole]
  policy_arn = "${aws_iam_policy.lambda_policy.arn}"
}

resource "aws_iam_role_policy_attachment" "dynamoDB_policy_attach_role" {
  role       = "${aws_iam_role.LambdaExecutionServiceRole.name}"
  depends_on = [aws_iam_role.LambdaExecutionServiceRole]
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

resource "aws_iam_role_policy_attachment" "ses_policy_attach_role" {
  role       = "${aws_iam_role.LambdaExecutionServiceRole.name}"
  depends_on = [aws_iam_role.LambdaExecutionServiceRole]
  policy_arn = "arn:aws:iam::aws:policy/AmazonSESFullAccess"
}


