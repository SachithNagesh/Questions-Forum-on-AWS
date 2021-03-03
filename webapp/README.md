# Network Structures and Cloud Computing - CYSE6225 - Webapps demo

> A simple web application using NodeJS, ExpressJS, PostgreSQL and PassportJS(Middleware Authentication)
1. Can create user account.
2. Can access protected endpoints to access and update user account information.
3. Has CI/CD - CI for testing - CD for Continuous Deploymenttt

## Table of contents

- [Project Name](#project-name)
  - [Prerequisites](#prerequisites)
  - [Table of contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Installation](#installation) 
  - [Steps for run, test and build](#usage)
    - [Serving the app](#serving-the-app)
    - [Running the tests](#running-the-tests)
    - [Building a distribution version](#building-a-distribution-version)
    - [Serving the distribution version](#serving-the-distribution-version)
  - [RESTful API Endpoints](#restful-api-endpoints)
  - [Built With](#built-with)
  - [Authors](#authors)

## Prerequisites
This project requires:

#### Operating System

Any Linux based OS
1. Ubuntu >18
2. Mac
3. Windows users can follow this [article](https://opensource.com/article/18/5/dual-boot-linux) to setup dual booting.
Virtual Machine Setup
Create a Ubuntu virtual machine with following specifications
    1. RAM: 8GB (or more)
    2. CPU: 2 (or more)
    3. Disk: 50GB (or more)
    4. Networking: Bridged
To improve performance of your virtual machine, install VirtualBox Guest Additions (Links to an external site.) or VMWare tools (Links to an external site.) in your guest operating system and reboot it before installing anything else.

#### NodeJS (version 8 or later) and NPM

[Node](http://nodejs.org/) and [NPM](https://npmjs.org/) are really easy to install.
To make sure you have them available on your machine,
try running the following command.

```sh
$ npm -v && node -v
6.4.1
v8.16.0
```
If not available, install by downloading node [here](https://nodejs.org/en/)

#### PostgreSQL

Install PostgreSQL > v10 downloading [here](https://www.postgresql.org/download/)

```sh
// - Starts PostgreSQL service
psql start 
// - Stops PostgreSQL service
psql stop 
```

Start PostgreSQL on PORT 5432


## Getting Started

Verify git has been configured on the command line. Check ~/.gitconfig to see if name and email address have been setup.
Verify student has setup SSH keys for GitHub authentication

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.


## Installation

**BEFORE YOU INSTALL:** please read the [prerequisites](#prerequisites)

Start with cloning this repo on your local machine:

```sh
$ git clone git@github.com:SachithNagesh/webapp.git //Always use SSH
$ cd webapp
```

Install Node Packages

```sh
$ npm install
$ npm install sequelize-cli -g
```

Create a .env file and copy the contents below to .env and update the values respectively.

```sh
PORT=xxx // PORT for App to run on
NODE_ENV=xxx // Specify run environment
# POSTGRES DB - Credentials
dev_postgres_host=xxx // postgres host name
dev_postgres_username=xxx // postgres user name
dev_postgres_password=xxx // postgres password
dev_postgres_db=xxx // postgres host data base name
prod_postgres_host=xxx
prod_postgres_username=xxx
prod_postgres_password=xxx
prod_postgres_db=xxx
test_postgres_host=xxx
test_postgres_username=xxx
test_postgres_password=xxx
test_postgres_db=xxx
```

Create DB and run Migrations. 

```sh
sequelize db:create
sequelize db:migrate
```

If you hit errors, just drop and then create and run migrations.

## Usage

### Serving the app

```sh
$ npm start
```

### Running the tests

```sh
$ npm test
```

### Building a distribution version

```sh
$ npm run build
```

This task will create a distribution version of the project
inside your local `dist/` folder

### Serving the distribution version

```sh
$ npm run serve:dist
```

This will use `lite-server` for servign your already
generated distribution version of the project.

*Note* this requires
[Building a distribution version](#building-a-distribution-version) first.

## RESTful API Endpoints
```sh
UserResponsePayload = {
  "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
  "first_name": "John",
  "last_name": "Doe",
  "email_address": "john.doe@example.com",
  "account_created": "2016-08-29T09:12:33.001Z",
  "account_updated": "2016-08-29T09:12:33.001Z"
}
```

### POST /v1/signup

1. Allows a user to create an account by providing following information: email_address, password, first_name and last_name
2. Stores password securely using BCrypt password hashing scheme with salt.
3. Return Bad Request on invalid email addresses and weak passwords

Returns:

| Request Type | Response Status Code | Response Payload
| --- | --- | --- |
| Create email and password with right credentials | 201 |UserResponsePayload |
| Create email and password with wrong credentials | 400 | Appropriate Error Message |
| Create account with duplicate email | 400 | Appropriate Error Message |


### GET /v1/self

1. Allows a user to get acccount information by authenticating basic auth as token. 
2. Returns UserResponsePayload on successfull authentication.

| Request Type | Response Status Code | Response Payload
| --- | --- | --- |
| GET with right credentials | 200 | UserResponsePayload |
| GET with wrong credentials | 403 | Unauthorized : *Appropriate Error Message* |

### PUT /v1/signup

1. Allows a user to update acccount information by authenticating basic auth as token.
2. Allows user to update only password, first_name and last_name fields
2. Returns 204 response status on successfull authentication and update.

| Request Type | Response Status Code | Response Payload
| --- | --- | --- |
| Update right credentials | 204 | No Content |
| Update with wrong credentials | 403 | Unauthorized : *Appropriate Error Message* |
| Update with weak password | 400 | *Appropriate Error Message* |
| Update with other fields than password, first_name and last_name | 400 |  *Appropriate Error Message* |
| Update with missing fields other than password, first_name, last_name and email_address | 400 |  *Appropriate Error Message* |
| Update with different email_address in request body | 400 |  *Appropriate Error Message* |




## Built With

* Nodejs - Bla bla bla - this guy
* Express - Maybe
* Jest - Supertester
* VSCode - prettier lol
* Love

## Authors

* **Sachith Nagesh** - [SachithNagesh](https://github.com/SachithNagesh)

