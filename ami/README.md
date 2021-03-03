# AMI CSYE-6225 

[![PkgGoDev](https://pkg.go.dev/badge/github.com/hashicorp/packer)](https://pkg.go.dev/github.com/hashicorp/packer)

* Website: [https://www.packer.io](https://www.packer.io)

Packer is a tool for building identical machine images for multiple platformm
from a single source configuration.

Packer is lightweight, runs on every major operating system, and is highly
performant, creating machine images for multiple platforms in parallel. Packer
comes out of the box with support for many platforms, the full list of which can
be found at https://www.packer.io/docs/builders/index.html.

Support for other platforms can be added via plugins.

The images that Packer creates can easily be turned into
[Vagrant](http://www.vagrantup.com) boxes.

## About this Packer

This packer will create an AMI in your DEV AWS Account and replicate the same image onto your PROD AWS Account when a there is push to **master** branch

1. This packer creates a AMI with a source-id 

```
Ubuntu 18 LTS (AMI ID ami-0817d428a6fb68645)
```

2. It installs the following packages:

* Update
* Curl
* Latest stable NodeJS 12.xx version
* Zip and Unzip
* Ruby
* Wget
* AWS Codedeploy at path /home/ubuntu - region us-east-1

Below is the provisioner code

```
"sudo apt update -y",
"sudo apt-get install curl -y",
"curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -",
"sudo apt-get install nodejs -y",
"sudo apt-get install zip unzip",
"sudo apt-get install ruby -y",
"sudo apt-get install wget -y",
"cd /home/ubuntu",
"sudo wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install",
"sudo chmod +x ./install",
"sudo ./install auto"
```

On every pull-request merged or every push to the master branch, it builds an AMI.

## Quick Start

**Note:** There is a great
[introduction and getting started guide](https://www.packer.io/intro)
for those with a bit more patience. Otherwise, the quick start below
will get you up and running quickly, at the sacrifice of not explaining some
key points.

First, [download a pre-built Packer
binary](https://www.packer.io/downloads.html) for your operating system or
[compile Packer
yourself](https://github.com/hashicorp/packer/blob/master/.github/CONTRIBUTING.md#setting-up-go-to-work-on-packer).

Follow instructions from [here](https://learn.hashicorp.com/tutorials/packer/getting-started-install) to install packer for different versions.

After Packer is installed, create your first template, which tells Packer
what platforms to build images for and how you want to build them. In our
case, we'll create a simple AMI that has Redis pre-installed. Save this
file as `quick-start.json`. Export your AWS credentials as the
`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables.
In your GitHub workflows secrets in your repository enter these keys as your env varibales.

```json
        AWS_ACCESS_KEY: YOUR SECRET 
        AWS_SECRET_KEY: YOUR SECRET 
        AMI_USERS: YOUR SECRET 
        AWS_REGION: YOUR SECRET 
```

Next, tell Packer to validate the image:

```
$ packer validate ami.json

```

Next, tell Packer to build the image:

```
$ packer build ami.json

```

Packer will build an AMI according to the "quick-start" template. The AMI
will be available in your AWS account. To delete the AMI, you must manually
delete it using the [AWS console](https://console.aws.amazon.com/). Packer
builds your images, it does not manage their lifecycle. Where they go, how
they're run, etc., is up to you.

## Documentation

Comprehensive documentation is viewable on the Packer website:

[https://www.packer.io/docs](https://www.packer.io/docs)

## Author

Sachith Nagesh