### TERRAFORM INFRASTRUCTURE

- Website: [https://www.terraform.io](https://www.terraform.io)
- Forums: [HashiCorp Discuss](https://discuss.hashicorp.com/c/terraform-core)
- Documentation: [https://www.terraform.io/docs/](https://www.terraform.io/docs/)
- Tutorials: [HashiCorp's Learn Platform](https://learn.hashicorp.com/terraform)


<img alt="Terraform" src="https://www.terraform.io/assets/images/logo-hashicorp-3f10732f.svg" width="600px">

Terraform is a tool for building, changing, and versioning infrastructure safely and efficiently. Terraform can manage existing and popular service providers as well as custom in-house solutions.

The key features of Terraform are:

- **Infrastructure as Code**: Infrastructure is described using a high-level configuration syntax. This allows a blueprint of your datacenter to be versioned and treated as you would any other code. Additionally, infrastructure can be shared and re-used.

- **Execution Plans**: Terraform has a "planning" step where it generates an *execution plan*. The execution plan shows what Terraform will do when you call apply. This lets you avoid any surprises when Terraform manipulates infrastructure.

- **Resource Graph**: Terraform builds a graph of all your resources, and parallelizes the creation and modification of any non-dependent resources. Because of this, Terraform builds infrastructure as efficiently as possible, and operators get insight into dependencies in their infrastructure.

- **Change Automation**: Complex changesets can be applied to your infrastructure with minimal human interaction. With the previously mentioned execution plan and resource graph, you know exactly what Terraform will change and in what order, avoiding many possible human errors.

For more information, see the [introduction section](http://www.terraform.io/intro) of the Terraform website.

Getting Started & Documentation
-------------------------------
Documentation is available on the [Terraform website](http://www.terraform.io):
  - [Intro](https://www.terraform.io/intro/index.html)
  - [Docs](https://www.terraform.io/docs/index.html)

If you're new to Terraform and want to get started creating infrastructure, please check out our [Getting Started guides](https://learn.hashicorp.com/terraform#getting-started) on HashiCorp's learning platform. There are also [additional guides](https://learn.hashicorp.com/terraform#operations-and-development) to continue your learning.

Show off your Terraform knowledge by passing a certification exam. Visit the [certification page](https://www.hashicorp.com/certification/) for information about exams and find [study materials](https://learn.hashicorp.com/terraform/certification/terraform-associate) on HashiCorp's learning platform.

## Steps to set-up on your system

1. Download this repo by using ssh

2. export your AWS profile by using aws-cli 

Learn more about aws-cli [here.](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html) 

```
You can export your AWS profile by using aws-cli by:

export AWS_PROFILE=xxx //aws_profile_name_you_created

or

You can export your Access keys and Secret keys as:
export AWS_ACCESS_KEY_ID=xxx
export AWS_SECRET_ACCESS_KEY=xxx
export AWS_DEFAULT_REGION=xxx
```

3. Import Certificate from AWS CLI using the command

```
$ aws acm import-certificate --certificate fileb://Certificate.pem \
      --certificate-chain fileb://CertificateChain.pem \
      --private-key fileb://PrivateKey.pem 	
```

3. Initialise Terraform 

```
terraform init
```

4. Check terraform file

This checks for any faults in your terraform file and if the resources can be created without any errors.

Enter variable names 

```
terraform plan
```
5. Terraform approve

Creates resources defined in main.tf file

```
terraform approve -auto-approve
```
6. Terraform destroy

Destroys terraform resources

```
terraform destroy -auto-approve
```

7. Error while destroying state.

If there is any errors while destroying state due to wrong associations or something, then destroy resources by logging onto the console and refreshing the local machine terraform state by running:

NOTE: MAKE SURE CHANGES ARE MADE TO REFRESH THE TERRAFORM STATE

```
terraform refresh
```


## Author
Sachith Nagesh