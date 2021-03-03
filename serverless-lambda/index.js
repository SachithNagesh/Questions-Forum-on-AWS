const AWS = require("aws-sdk");

var ses = new AWS.SES({
  region: "us-east-1",
});

const docClient = new AWS.DynamoDB.DocumentClient({
  region: "us-east-1",
});

exports.handler = (event, context, callback) => {
  // console.log(event.Records[0].Sns);
  // var event_data = [JSON.parse(event).message];

  console.log("===========event============" + JSON.stringify(event));

  // var event_data = JSON.parse(event.Records[0].Sns.Message).question_email;

  console.log(JSON.parse(event.Records[0].Sns.Message).question_email);
  console.log(event.Records[0].Sns.MessageId);
   console.log(event.Records[0].Sns.Message);

  var params = {
    Item: {
      id: event.Records[0].Sns.Message,
      //message: event.Records[0].Sns.Message,
      data: JSON.parse(event.Records[0].Sns.Message),
    },
    TableName: "csye6225",
  };

  function putCheck() {
    return new Promise(function (resolve, reject) {
      docClient.put(params, function (err, data) {
        if (err) {
          reject(new Error(err));
        } else {
          resolve(data);
        }
      });
    });
  }

  const params2 = {
    TableName: "csye6225",
    KeyConditionExpression: "id = :i",
    ExpressionAttributeValues: {
      ":i": event.Records[0].Sns.Message,
    },
  };

  function getRecord() {
    return new Promise(function (resolve, reject) {
      docClient.query(params2, function (err, data) {
        if (err) {
          reject(new Error(err));
        } else {
          resolve(data);
        }
      });
    });
  }

  //let number;
  async function mainFunction() {
    let number;
    number = await getRecord();

    console.log(number);

    if (number.Items.length === 0) {
      let second;

      let key = JSON.parse(event.Records[0].Sns.Message).key;

      second = await putCheck();

      if (key === "answer") {
        await sendAnsweredEmail(
          JSON.parse(event.Records[0].Sns.Message).question_email
        );
        console.log("Email Sent for answering");
      } else if (key === "updated") {
        await sendUpdatedEmail(
          JSON.parse(event.Records[0].Sns.Message).question_email
        );
        console.log("Email Sent for updated");
      } else if (key === "deleted") {
        await sendDeletedEmail(
          JSON.parse(event.Records[0].Sns.Message).question_email
        );
        console.log("Email Sent for deleted");
      }
    }else{
      console.log("Duplicate Message")
    }
  }

  mainFunction();
  console.log("after async call");

  function sendAnsweredEmail(to_email) {
    var sender = "no-reply@" + process.env.DOMAIN_NAME;

    let question_id = JSON.parse(event.Records[0].Sns.Message).details
      .question_id;
    let question_firstname = JSON.parse(event.Records[0].Sns.Message)
      .question_firstname;
    let question_text = JSON.parse(event.Records[0].Sns.Message).details
      .question_text;
    let answer_userId = JSON.parse(event.Records[0].Sns.Message).details
      .user_id;
    let answer_id = JSON.parse(event.Records[0].Sns.Message).details.answer_id;
    let answer_created = JSON.parse(event.Records[0].Sns.Message).details
      .answer_created;
    let answer_text = JSON.parse(event.Records[0].Sns.Message).details
      .answer_text;

    var links = "http://${process.env.DOMAIN_NAME}/v1/update";

    console.log(links + "mine");

    return new Promise(function (resolve, reject) {
      var eParams = {
        Destination: {
          ToAddresses: [to_email],
        },
        Message: {
          Body: {
            Html: {
              //Data: links
              Data:
                "<html><head>" +
                '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' +
                "<title>" +
                "An answer has been posted to your Question" +
                "</title>" +
                "</head><body>" +
                "Hello " +
                question_firstname +
                "," +
                "<br><br>" +
                "An Answer has been posted to your question" +
                "<br><br>" +
                "Question: " +
                question_text +
                "<br>" +
                "Question Id: " +
                question_id +
                "<br><br>" +
                "Answer Details:" +
                "<br>" +
                "Answer Id: " +
                answer_id +
                "<br>" +
                "Answer posted by: " +
                answer_userId +
                "<br>" +
                "Answer Text: " +
                answer_text +
                "<br>" +
                "Answer Posted Time: " +
                answer_created +
                "<br><br>" +
                "You can visit the answer by clicking on the link below:" +
                "<br>" +
                '<a href="https://' +
                process.env.DOMAIN_NAME +
                "/v1/question/" +
                question_id +
                "/answer/" +
                answer_id +
                '">' +
                "https://" +
                process.env.DOMAIN_NAME +
                "/v1/question/" +
                question_id +
                "/answer/" +
                answer_id +
                "</a>" +
                "<br><br>" +
                "Thank you, have a great day!!!" +
                "<br>" +
                process.env.DOMAIN_NAME +
                "<br><br>" +
                "Please do not respond. This is an automated email and this email's inbox is not monitored." +
                "</body></html>",
            },
          },
          Subject: {
            Data: "Your question has an answer",
          },
        },
        Source: sender,
      };
      ses.sendEmail(eParams, function (err, data2) {
        if (err) {
          reject(new Error(err));
        } else {
          context.succeed(event);
          resolve(data2);
        }
      });
    });
  }

  function sendUpdatedEmail(to_email) {
    var sender = "no-reply@" + process.env.DOMAIN_NAME;

    let question_id = JSON.parse(event.Records[0].Sns.Message).details
      .question_id;
    let question_firstname = JSON.parse(event.Records[0].Sns.Message)
      .question_firstname;
    let question_text = JSON.parse(event.Records[0].Sns.Message).details
      .question_text;
    let answer_userId = JSON.parse(event.Records[0].Sns.Message).details
      .user_id;
    let answer_id = JSON.parse(event.Records[0].Sns.Message).details.answer_id;
    let answer_created = JSON.parse(event.Records[0].Sns.Message).details
      .answer_created;
    let answer_updated = JSON.parse(event.Records[0].Sns.Message).details
      .answer_updated;
    let answer_text = JSON.parse(event.Records[0].Sns.Message).details
      .answer_text;
    let updated_answer_text = JSON.parse(event.Records[0].Sns.Message).details
      .updated_answer_text;

    var links = "http://${process.env.DOMAIN_NAME}/v1/update";

    console.log(links + "mine");

    return new Promise(function (resolve, reject) {
      var eParams = {
        Destination: {
          ToAddresses: [to_email],
        },
        Message: {
          Body: {
            Html: {
              //Data: links
              Data:
                "<html><head>" +
                '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' +
                "<title>" +
                "An answer that was posted to your Question has been updated" +
                "</title>" +
                "</head><body>" +
                "Hello " +
                question_firstname +
                "," +
                "<br><br>" +
                "An Answer that was posted to your question has been updated" +
                "<br><br>" +
                "Question: " +
                question_text +
                "<br>" +
                "Question Id: " +
                question_id +
                "<br><br>" +
                "Answer Details:" +
                "<br>" +
                "Answer Id: " +
                answer_id +
                "<br>" +
                "Answer posted by: " +
                answer_userId +
                "<br>" +
                "Previous Answer Text: " +
                answer_text +
                "<br>" +
                "Updated Answer Text: " +
                updated_answer_text +
                "<br>" +
                "Answer Posted Time: " +
                answer_created +
                "<br>" +
                "Answer Updated Time: " +
                answer_updated +
                "<br><br>" +
                "You can visit the answer by clicking on the link below:" +
                "<br>" +
                '<a href="https://' +
                process.env.DOMAIN_NAME +
                "/v1/question/" +
                question_id +
                "/answer/" +
                answer_id +
                '">' +
                "https://" +
                process.env.DOMAIN_NAME +
                "/v1/question/" +
                question_id +
                "/answer/" +
                answer_id +
                "</a>" +
                "<br><br>" +
                "Thank you, have a great day!" +
                "<br>" +
                process.env.DOMAIN_NAME +
                "<br><br>" +
                "Please do not respond. This is an automated email and this email's inbox is not monitored." +
                "</body></html>",
            },
          },
          Subject: {
            Data: "An answer to your question has been updated",
          },
        },
        Source: sender,
      };
      ses.sendEmail(eParams, function (err, data2) {
        if (err) {
          reject(new Error(err));
        } else {
          context.succeed(event);
          resolve(data2);
        }
      });
    });
  }

  function sendDeletedEmail(to_email) {
    var sender = "no-reply@prod.sachithnageshcloud.me";

    let question_id = JSON.parse(event.Records[0].Sns.Message).details
      .question_id;
    let question_firstname = JSON.parse(event.Records[0].Sns.Message)
      .question_firstname;
    let question_text = JSON.parse(event.Records[0].Sns.Message).details
      .question_text;

    return new Promise(function (resolve, reject) {
      var eParams = {
        Destination: {
          ToAddresses: [to_email],
        },
        Message: {
          Body: {
            Html: {
              //Data: links
              Data:
                "<html><head>" +
                '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' +
                "<title>" +
                "An answer that was posted to your Question has been deleted" +
                "</title>" +
                "</head><body>" +
                "Hello " +
                question_firstname +
                "," +
                "<br><br>" +
                "An Answer that was posted to your question has been deleted" +
                "<br><br>" +
                "Question: " +
                question_text +
                "<br>" +
                "Question Id: " +
                question_id +
                "<br><br>" +
                "You can view your question and answers belonging to it by clicking on the link below:" +
                "<br>" +
                '<a href="https://' +
                process.env.DOMAIN_NAME +
                "/v1/question/" +
                question_id +
                '">' +
                "https://" +
                process.env.DOMAIN_NAME +
                "/v1/question/" +
                question_id +
                "</a>" +
                "<br><br>" +
                "Thank you, have a great day!" +
                "<br>" +
                process.env.DOMAIN_NAME +
                "<br><br>" +
                "Please do not respond. This is an automated email and this email's inbox is not monitored." +
                "</body></html>",
            },
          },
          Subject: {
            Data: "An answer to your question has been deleted",
          },
        },
        Source: sender,
      };
      ses.sendEmail(eParams, function (err, data2) {
        if (err) {
          reject(new Error(err));
        } else {
          context.succeed(event);
          resolve(data2);
        }
      });
    });
  }
};
