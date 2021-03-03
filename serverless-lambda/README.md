# serverless

## Steps to run the application

1. Configure your envs
2. Export AWS profile using aws-cli
3. Run index.js
4. You could also copy you indx.js to your lambda function.

## Worflow

Any pushes to this repository will initiate lambda deploy.

## What my lambda function on trigger from SNS does:

1. Lambda function will be invoked by the SNS notification. Lambda function is responsible for sending email to the user.
2. As a user, you will receive email notification when an answer is posted to question you asked.
3. As a user, you should receive email notification when an answer to the question you posted is updated or deleted.
4. As a user, you should NOT receive duplicate email notifications.
5. Track emails being sent in DynamoDB so that user does not get duplicate emails even if duplicate messages are posted to the SNS topic.

## Authors

* **Sachith Nagesh** - [SachithNagesh](https://github.com/SachithNagesh)