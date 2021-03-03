var express = require("express");
var router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
require("../config/passport")(passport);
const Questions = require("../models").Questions;
const User = require("../models").User;
const Category = require("../models").Category;
const CategoryQuestion = require("../models").CategoryQuestion;
const Answers = require("../models").Answer;
const QuestionFiles = require("../models").QuestionFile;
const AnswerFiles = require("../models").AnswerFile;

const s3 = require("../config/awsbucket");
const StatsD = require("node-statsd");
const statsClient = new StatsD();
const logger = require("../config/winston");

// s3.listBuckets(function (err, data) {
//   if (err) console.log(err, err.stack);
//   // an error occurred
//   else console.log(data); // successful response
// });

/*
AWS S3 routes
*/

// Add a file to a question
router.post("/question/:questionId/file", function (req, res, next) {
  passport.authenticate("basic", { session: false }, async function (
    err,
    user,
    info
  ) {
    
    let start = Date.now()
    logger.info('POST ​/v1​/question/:questionId/file called')
    statsClient.increment('question_file_upload');

    if (err) {

      let end = Date.now()
      statsClient.timing('question_file_upload_timing', end-start)

      return res
        .status(401)
        .set("Content-Type", "application/json")
        .send({ message: err });
    }
    if (!user) {

      let end = Date.now()
      statsClient.timing('question_file_upload_timing', end-start)
      return res
        .status(401)
        .set("Content-Type", "application/json")
        .send({ message: err });
    }

    try{

      for (var prop in req.files) {
        if (prop === "image") {
          // do nothing
        } else {

      let end = Date.now()
      statsClient.timing('question_file_upload_timing', end-start)
          return res.status(400).set("Content-Type", "application/json").send({
            message: "Can accept only 'image' as KEY field in form-data",
          });
        }
      }
  
      // Check for file KEY is 'image' only
  
      if (!req.files.image) {

      let end = Date.now()
      statsClient.timing('question_file_upload_timing', end-start)
        return res
          .status(400)
          .set("Content-Type", "application/json")
          .send({ message: "Pass image KEY fields" });
      }
  
      //  check for image file format
      if (
        /([0-9a-zA-Z\._-]+.(png|PNG|jp[e]?g|JP[E]?G))/.test(req.files.image.name)
      ) {
        // if valid filename do nothing
      } else {

      let end = Date.now()
      statsClient.timing('question_file_upload_timing', end-start)
        return res.status(400).set("Content-Type", "application/json").send({
          message: "Can accept only images of format jpeg, jpg and png",
        });
      }
  
      let dbQueryStart = Date.now()
      // Find the question from the route
      const question = await Questions.findOne({
        where: {
          id: req.params.questionId,
        },
      });
  
      // If question does not exist then send approriate route
      if (!question) {

      let end = Date.now()
      statsClient.timing('question_file_upload_timing', end-start)

        return res
          .status(400)
          .set("Content-Type", "application/json")
          .send({ message: "Please check your question ID route" });
      }
  
      //  Check if the posting user is same as user who posted the question
      if (user.id != question.dataValues.user_id) {

      let end = Date.now()
      statsClient.timing('question_file_upload_timing', end-start)
        return res.status(400).set("Content-Type", "application/json").send({
          message: "Cannot post an image to a question you did not post",
        });
      }
  
      let s3UploadStart = Date.now()
      // Call s3 client
      const s3Client = s3.s3Client;
      const params = s3.uploadSingleObjectParams;
  
      // Set params for s3 upload options
      params.Key = `${req.params.questionId}/questions/${req.files.image.name}`;
      params.Body = req.files.image.data;
  
      const uploadObject = await s3Client.putObject(params).promise();


      let s3UploadEnd = Date.now()
      statsClient.timing('question_file_upload_s3_timing', s3UploadEnd-s3UploadStart)
  
      // See if same pathname and filename exits for a question
      const questionFile = await QuestionFiles.findOne({
        where: {
          question_id: req.params.questionId,
          pathname: `${req.params.questionId}/questions/${req.files.image.name}`,
          filename: `${req.files.image.name}`,
        },
      });
  
      let resultQuestionFile;
  
      // If the mapping exists for the same filename, then
      if (!questionFile) {
        resultQuestionFile = await QuestionFiles.create({
          question_id: req.params.questionId,
          pathname: `${req.params.questionId}/questions/${req.files.image.name}`,
          filename: `${req.files.image.name}`,
          metadata: uploadObject,
        });
      } else {
        const updatedQuestionFile = await QuestionFiles.update(
          {
            metadata: uploadObject,
          },
          {
            where: {
              question_id: req.params.questionId,
              pathname: `${req.params.questionId}/questions/${req.files.image.name}`,
              filename: req.files.image.name,
            },
            returning: true,
          }
        );
        resultQuestionFile = updatedQuestionFile[1][0];
      }

      let dbQueryEnd = Date.now()
      statsClient.timing('question_file_upload_db_timing', dbQueryEnd-dbQueryStart)


      let end = Date.now()
      statsClient.timing('question_file_upload_timing', end-start)
  
      return res.status(200).set("Content-Type", "application/json").send({
        file_name: resultQuestionFile.dataValues.filename,
        s3_object_name: resultQuestionFile.dataValues.pathname,
        file_id: resultQuestionFile.dataValues.id,
        created_date: resultQuestionFile.dataValues.createdAt,
      });

    }catch(err){
      console.log(err)
      logger.info(err)

      let end = Date.now()
      statsClient.timing('question_file_upload_timing', end-start)

      return res
      .status(400)
      .set("Content-Type", "application/json")
      .send({ message: err });
    }
    // Check for other image file names
    
  })(req, res, next);
});

// Delete a file added to a question
router.delete("/question/:questionId/file/:fileId", function (req, res, next) {
  passport.authenticate("basic", { session: false }, async function (
    err,
    user,
    info
  ) {

    let start = Date.now()
    logger.info('DELETE ​/v1/question/:questionId/file/:fileId called')
    statsClient.increment('question_file_delete');

    if (err) {
      let end = Date.now()
      statsClient.timing('question_file_delete_timing', end-start)

      return res
        .status(401)
        .set("Content-Type", "application/json")
        .send({ message: err });
    }
    if (!user) {
      let end = Date.now()
      statsClient.timing('question_file_delete_timing', end-start)
      return res
        .status(401)
        .set("Content-Type", "application/json")
        .send({ message: err });
    }

    try{
    
      let dbQueryStart = Date.now()
    // Find the question from the route
    const question = await Questions.findOne({
      where: {
        id: req.params.questionId,
      },
    });

    // If question does not exist then send approriate route
    if (!question) {
      let end = Date.now()
      statsClient.timing('question_file_delete_timing', end-start)
      return res
        .status(404)
        .set("Content-Type", "application/json")
        .send({ message: "Please check your question ID route" });
    }

    //  Check if the posting user is same as user who posted the question
    if (user.id != question.dataValues.user_id) {
      return res.status(401).set("Content-Type", "application/json").send({
        message: "Cannot delete an image to a question you did not post",
      });
    }

    const questionFile = await QuestionFiles.findOne({
      where: {
        id: req.params.fileId,
      },
    });

    if (!questionFile) {
      let end = Date.now()
      statsClient.timing('question_file_delete_timing', end-start)
      return res
        .status(404)
        .set("Content-Type", "application/json")
        .send({ message: "Please check your file ID route" });
    }

    logger.info(questionFile);

    let s3DeleteStart = Date.now();
    // Call s3 client
    const s3Client = s3.s3Client;
    const params = s3.deleteSingleObjectParams;

    // Set params for s3 upload options
    params.Key = questionFile.dataValues.pathname;

    s3Client.deleteObject(params, function (err, data) {
      // an error occurred
      if (err) {
        let end = Date.now()
        statsClient.timing('question_file_delete_timing', end-start)
        return res
          .status(400)
          .set("Content-Type", "application/json")
          .send({ message: err });
      } else {
        logger.info(data)
        console.log(data); // successful response
      }
    });

    let s3DeleteEnd = Date.now();

    statsClient.timing('question_file_s3delete_timing', s3DeleteEnd-s3DeleteStart)

    await QuestionFiles.destroy({
      where: {
        id: req.params.fileId,
      },
    });

    let dbQueryEnd = Date.now()
    statsClient.timing('question_file_delete_db_timing', dbQueryEnd-dbQueryStart)

    let end = Date.now()
    statsClient.timing('question_file_delete_timing', end-start)
    return res.status(204).set("Content-Type", "application/json").send();

    }catch(err){

      console.log(err)
      logger.info(err)

      let end = Date.now()
      statsClient.timing('question_file_delete_timing', end-start)

      return res
      .status(400)
      .set("Content-Type", "application/json")
      .send({ message: err });

    }


  })(req, res, next);
});

// Add a image to an answer
router.post("/question/:questionId/answer/:answerId/file", function (
  req,
  res,
  next
) {
  passport.authenticate("basic", { session: false }, async function (
    err,
    user,
    info
  ) {

    let start = Date.now()
    logger.info('POST /question/:questionId/answer/:answerId/filecalled')
    statsClient.increment('answer_file_upload');

    if (err) {
      let end = Date.now()
      statsClient.timing('answer_file_upload_timing', end-start)
      return res
        .status(401)
        .set("Content-Type", "application/json")
        .send({ message: err });
    }
    if (!user) {
      let end = Date.now()
      statsClient.timing('answer_file_upload_timing', end-start)
      return res
        .status(401)
        .set("Content-Type", "application/json")
        .send({ message: err });
    }

    try{

    // Check for other image file names
    for (var prop in req.files) {
      if (prop === "image") {
        // do nothing
      } else {
        let end = Date.now()
        statsClient.timing('answer_file_upload_timing', end-start)

        return res.status(400).set("Content-Type", "application/json").send({
          message: "Can accept only 'image' as KEY field in form-data",
        });
      }
    }

    // Check for file KEY is 'image' only

    if (!req.files.image) {
      let end = Date.now()
      statsClient.timing('answer_file_upload_timing', end-start)

      return res
        .status(400)
        .set("Content-Type", "application/json")
        .send({ message: "Pass image KEY fields" });
    }

    //  check for image file format
    if (
      /([0-9a-zA-Z\._-]+.(png|PNG|jp[e]?g|JP[E]?G))/.test(req.files.image.name)
    ) {
      // if valid filename do nothing
    } else {
      let end = Date.now()
      statsClient.timing('answer_file_upload_timing', end-start)

      return res.status(400).set("Content-Type", "application/json").send({
        message: "Can accept only images of format jpeg, jpg and png",
      });
    }

    // Find the question from the route
    const question = await Questions.findOne({
      where: {
        id: req.params.questionId,
      },
    });

    // If question does not exist then send approriate route
    if (!question) {
      let end = Date.now()
      statsClient.timing('answer_file_upload_timing', end-start)

      return res
        .status(400)
        .set("Content-Type", "application/json")
        .send({ message: "Please check your question ID route" });
    }

    let dbQueryStart = Date.now()
    const answer = await Answers.findOne({
      where: {
        id: req.params.answerId,
      },
    });

    // If answer does not exist then send approriate route
    if (!answer) {
      let end = Date.now()
      statsClient.timing('answer_file_upload_timing', end-start)

      return res
        .status(400)
        .set("Content-Type", "application/json")
        .send({ message: "Please check your answer ID route" });
    }

    //  Check if the posting user is same as user who posted the question
    if (user.id != answer.dataValues.user_id) {
      let end = Date.now()
      statsClient.timing('answer_file_upload_timing', end-start)
      return res.status(400).set("Content-Type", "application/json").send({
        message: "Cannot post an image to an answer you did not post",
      });
    }

    let s3UploadStart = Date.now()
    // Call s3 client
    const s3Client = s3.s3Client;
    const params = s3.uploadSingleObjectParams;

    // Set params for s3 upload options
    params.Key = `${req.params.questionId}/answers/${req.files.image.name}`;
    params.Body = req.files.image.data;

    const uploadObject = await s3Client.putObject(params).promise();

    let s3UploadEnd = Date.now()
    statsClient.timing('answer_file_upload_s3_timing', s3UploadEnd-s3UploadStart)

    // See if same pathname and filename exits for a question
    const answerFile = await AnswerFiles.findOne({
      where: {
        answer_id: req.params.answerId,
        pathname: `${req.params.questionId}/answers/${req.files.image.name}`,
        filename: `${req.files.image.name}`,
      },
    });

    let resultAnswerFile;

    // If the mapping exists for the same filename, then
    if (!answerFile) {
      resultAnswerFile = await AnswerFiles.create({
        answer_id: req.params.answerId,
        pathname: `${req.params.questionId}/answers/${req.files.image.name}`,
        filename: `${req.files.image.name}`,
        metadata: uploadObject,
      });
    } else {
      const updatedAnswerFile = await AnswerFiles.update(
        {
          metadata: uploadObject,
        },
        {
          where: {
            answer_id: req.params.answerId,
            pathname: `${req.params.questionId}/answers/${req.files.image.name}`,
            filename: req.files.image.name,
          },
          returning: true,
        }
      );
      resultAnswerFile = updatedAnswerFile[1][0];
    }

    let dbQueryEnd = Date.now()
    statsClient.timing('answer_file_upload_db_timing', dbQueryEnd-dbQueryStart)

    let end = Date.now()
    statsClient.timing('answer_file_upload_timing', end-start)

    return res.status(200).set("Content-Type", "application/json").send({
      file_name: resultAnswerFile.dataValues.filename,
      s3_object_name: resultAnswerFile.dataValues.pathname,
      file_id: resultAnswerFile.dataValues.id,
      created_date: resultAnswerFile.dataValues.createdAt,
    });

    }catch(err){

      console.log(err)
      logger.info(err)

      let end = Date.now()
      statsClient.timing('answer_file_upload_timing', end-start)

      return res
      .status(400)
      .set("Content-Type", "application/json")
      .send({ message: err });

    }


  })(req, res, next);
});

// Delete an image to an answer
router.delete("/question/:questionId/answer/:answerId/file/:fileId", function (
  req,
  res,
  next
) {
  passport.authenticate("basic", { session: false }, async function (
    err,
    user,
    info
  ) {

    let start = Date.now()
    logger.info('DELETE /question/:questionId/answer/:answerId/file/:fileId called')
    statsClient.increment('answer_file_delete');


    if (err) {
      let end = Date.now()
      statsClient.timing('answer_file_delete_timing', end-start)
      return res
        .status(401)
        .set("Content-Type", "application/json")
        .send({ message: err });
    }
    if (!user) {
      let end = Date.now()
      statsClient.timing('answer_file_delete_timing', end-start)
      return res
        .status(401)
        .set("Content-Type", "application/json")
        .send({ message: err });
    }


    try {

      let dbQueryStart = Date.now()
      // Find the question from the route
      const question = await Questions.findOne({
        where: {
          id: req.params.questionId,
        },
      });
  
      // If question does not exist then send approriate route
      if (!question) {
        let end = Date.now()
        statsClient.timing('answer_file_delete_timing', end-start)
        return res
          .status(404)
          .set("Content-Type", "application/json")
          .send({ message: "Please check your question ID route" });
      }
  
      // Find the question from the route
      const answer = await Answers.findOne({
        where: {
          id: req.params.answerId,
        },
      });
  
      // If question does not exist then send approriate route
      if (!answer) {
        return res
          .status(404)
          .set("Content-Type", "application/json")
          .send({ message: "Please check your answer ID route" });
      }
  
      //  Check if the posting user is same as user who posted the question
      if (user.id != answer.dataValues.user_id) {
        return res.status(401).set("Content-Type", "application/json").send({
          message: "Cannot delete an image to an answer you did not post",
        });
      }
  
      const answerFile = await AnswerFiles.findOne({
        where: {
          id: req.params.fileId,
        },
      });
  
      if (!answerFile) {
        return res
          .status(404)
          .set("Content-Type", "application/json")
          .send({ message: "Please check your file ID route" });
      }
  
      console.log(answerFile);
  
      let s3DeleteStart = Date.now()
      // Call s3 client
      const s3Client = s3.s3Client;
      const params = s3.deleteSingleObjectParams;
  
      // Set params for s3 upload options
      params.Key = answerFile.dataValues.pathname;
  
      s3Client.deleteObject(params, function (err, data) {
        // an error occurred
        if (err) {
          return res
            .status(400)
            .set("Content-Type", "application/json")
            .send({ message: err });
        } else {
          logger.info(data);
          console.log(data); // successful response
        }
      });

      let s3DeleteEnd = Date.now()
      statsClient.timing('answer_file_delete_s3_timing', s3DeleteEnd-s3DeleteStart)
  
      await AnswerFiles.destroy({
        where: {
          id: req.params.fileId,
        },
      });

      let dbQueryEnd = Date.now()
      statsClient.timing('answer_file_delete_db_timing', dbQueryEnd-dbQueryStart)
  
      let end = Date.now()
      statsClient.timing('answer_file_delete_timing', end-start)
      return res.status(204).set("Content-Type", "application/json").send();

    }catch(err){

      console.log(err)
      logger.info(err)

      let end = Date.now()
      statsClient.timing('answer_file_delete_timing', end-start)

      return res
      .status(400)
      .set("Content-Type", "application/json")
      .send({ message: err });

    }


  })(req, res, next);
});
/*






*/

/*
----------------
PUBLIC ROUTES
----------------
*/

// Get route for users to view all questions
router.get("/questions", async function (req, res, next) {

  let start = Date.now()
  logger.info('GET /questions called')
  statsClient.increment('get_questions_count');

  try{

  let dbQueryStart = Date.now();

  const questions = await Questions.findAll();

  const resQuestions = [];

  for (let item in questions) {
    const categoriesQuestions = await CategoryQuestion.findAll({
      where: {
        question_id: questions[item].dataValues.id,
      },
    });

    let categoriesWhere = [];

    categoriesQuestions.map((item) => {
      categoriesWhere.push(item.category_id);
    });

    const getCategories = await Category.findAll({
      where: {
        id: categoriesWhere,
      },
    });

    let categories = [];

    getCategories.map((item) => {
      categories.push({
        category_id: item.id,
        category: item.category_text,
      });
    });

    let answers = [];

    const getAnswers = await Answers.findAll({
      where: {
        question_id: questions[item].dataValues.id,
      },
    });

    for (let answer in getAnswers) {
      const answerAttachments = await AnswerFiles.findAll({
        where: {
          answer_id: getAnswers[answer].id,
        },
        attributes: [
          ["filename", "file_name"],
          ["pathname", "s3_object_name"],
          ["id", "file_id"],
          ["createdAt", "created_date"],
        ],
      });

      answers.push({
        answer_id: getAnswers[answer].id,
        question_id: getAnswers[answer].question_id,
        created_timestamp: getAnswers[answer].createdAt,
        updated_timestamp: getAnswers[answer].updatedAt,
        user_id: getAnswers[answer].user_id,
        answer_text: getAnswers[answer].answer_text,
        attachments: answerAttachments,
      });
    }

    const questionAttachments = await QuestionFiles.findAll({
      where: {
        question_id: questions[item].dataValues.id,
      },
      attributes: [
        ["filename", "file_name"],
        ["pathname", "s3_object_name"],
        ["id", "file_id"],
        ["createdAt", "created_date"],
      ],
    });

    resQuestions.push({
      question_id: questions[item].dataValues.id,
      created_timestamp: questions[item].dataValues.question_created,
      updated_timestamp: questions[item].dataValues.question_updated,
      user_id: questions[item].dataValues.user_id,
      question_text: questions[item].dataValues.question_text,
      categories: categories,
      answers: answers,
      attachments: questionAttachments,
    });
  }

  let dbQueryEnd = Date.now()
  statsClient.timing('get_questions_db_timing', dbQueryEnd-dbQueryStart)

  let end = Date.now()
  statsClient.timing('get_questions_timing', end-start)

  return res
    .status(200)
    .set("Content-Type", "application/json")
    .send(resQuestions);

  }catch(err){

    console.log(err)
    logger.info(err)

    let end = Date.now()
    statsClient.timing('get_questions_timing', end-start)

    return res
    .status(400)
    .set("Content-Type", "application/json")
    .send({ message: err });

  }
  
});

// Get route for answer belonging to a question

router.get("/question/:questionId/answer/:answerId", async function (
  req,
  res,
  next
) {

  let start = Date.now()
  logger.info('GET /question/:questionId/answer/:answerId called')
  statsClient.increment('get_answer_count');

  try{
    let dbQueryStart = Date.now()

    const question = await Questions.findOne({
      where: {
        id: req.params.questionId,
      },
    }).catch((error) => {
      return res.status(404).set("Content-Type", "application/json").send({
        Message: "Please check question Id route",
      });
    });

    if (!question) {
      return res.status(404).set("Content-Type", "application/json").send({
        Message: "Not Found - Check question Route",
      });
    }

    const answer = await Answers.findOne({
      where: {
        id: req.params.answerId,
        question_id: req.params.questionId,
      },
    });

    if (!answer) {
      return res.status(404).set("Content-Type", "application/json").send({
        Message: "Not Found - Check answers Route",
      });
    } else {
      // Get attachments
      const answerAttachments = await AnswerFiles.findAll({
        where: {
          answer_id: answer.id,
        },
        attributes: [
          ["filename", "file_name"],
          ["pathname", "s3_object_name"],
          ["id", "file_id"],
          ["createdAt", "created_date"],
        ],
      });

      let dbQueryEnd = Date.now()
      statsClient.timing('get_answer_db_timing', dbQueryEnd-dbQueryStart)

      let end = Date.now()
      statsClient.timing('get_answer_timing', end-start)

      return res.status(200).set("Content-Type", "application/json").send({
        answer_id: answer.id,
        question_id: answer.question_id,
        created_timestamp: answer.createdAt,
        updated_timestamp: answer.updatedAt,
        user_id: answer.user_id,
        answer_text: answer.answer_text,
        attachments: answerAttachments,
      });
    }

  }catch(err){

    console.log(err)
    logger.info(err)

    let end = Date.now()
    statsClient.timing('get_answer_timing', end-start)

    return res
    .status(400)
    .set("Content-Type", "application/json")
    .send({ message: err });

  }

});

// Route to get a question by it's id
router.get("/question/:questionId", async function (req, res, next) {

  let start = Date.now()
  logger.info('GET /question/:questionId called')
  statsClient.increment('get_question_id_count');

  try{
    let dbQueryStart = Date.now()
    const question = await Questions.findOne({
      where: {
        id: req.params.questionId,
      },
    });
  
    if (!question) {
      return res.status(404).set("Content-Type", "application/json").send({
        Message: "Not Found - Check question Route",
      });
    }
  
    const categoriesQuestions = await CategoryQuestion.findAll({
      where: {
        question_id: question.id,
      },
    });
  
    let categoriesWhere = [];
  
    categoriesQuestions.map((item) => {
      categoriesWhere.push(item.category_id);
    });
  
    const getCategories = await Category.findAll({
      where: {
        id: categoriesWhere,
      },
    });
  
    let categories = [];
  
    getCategories.map((item) => {
      categories.push({
        category_id: item.id,
        category: item.category_text,
      });
    });
  
    const answers = [];
  
    const getAnswers = await Answers.findAll({
      where: {
        question_id: req.params.questionId,
      },
    });
  
    for (let answer in getAnswers) {
      const answerAttachments = await AnswerFiles.findAll({
        where: {
          answer_id: getAnswers[answer].id,
        },
        attributes: [
          ["filename", "file_name"],
          ["pathname", "s3_object_name"],
          ["id", "file_id"],
          ["createdAt", "created_date"],
        ],
      });
  
      answers.push({
        answer_id: getAnswers[answer].id,
        question_id: getAnswers[answer].question_id,
        created_timestamp: getAnswers[answer].createdAt,
        updated_timestamp: getAnswers[answer].updatedAt,
        user_id: getAnswers[answer].user_id,
        answer_text: getAnswers[answer].answer_text,
        attachments: answerAttachments,
      });
    }
  
    const questionAttachments = await QuestionFiles.findAll({
      where: {
        question_id: question.id,
      },
      attributes: [
        ["filename", "file_name"],
        ["pathname", "s3_object_name"],
        ["id", "file_id"],
        ["createdAt", "created_date"],
      ],
    });

    let dbQueryEnd = Date.now()
    statsClient.timing('get_question_id_db_timing', dbQueryEnd-dbQueryStart)

    let end = Date.now()
    statsClient.timing('get_question_id_timing', end-start)
  
    return res.status(200).set("Content-Type", "application/json").send({
      question_id: question.id,
      created_timestamp: question.question_created,
      updated_timestamp: question.question_updated,
      user_id: question.user_id,
      question_text: question.question_text,
      categories: categories,
      answers: answers,
      attachments: questionAttachments,
    });

  }catch(err){


    console.log(err)
    logger.info(err)

    let end = Date.now()
    statsClient.timing('get_question_id_timing', end-start)

    return res
    .status(400)
    .set("Content-Type", "application/json")
    .send({ message: err });


  }


});

/* 
----------------
PRIVATE ROUTES
----------------
*/

//   To post a question
router.post("/question", function (req, res, next) {
  passport.authenticate("basic", { session: false }, async function (
    err,
    user,
    info
  ) {

    let start = Date.now()
    logger.info('POST /question called')
    statsClient.increment('post_question_count');

    if (err) {
      return res
        .status(401)
        .set("Content-Type", "application/json")
        .send({ message: err });
    }
    if (!user) {
      return res
        .status(401)
        .set("Content-Type", "application/json")
        .send({ message: err });
    }

    try{

      let dbQueryStart = Date.now()

      for (var prop in req.body) {
        if (prop === "question_text" || prop === "categories") {
          // do nothing
        } else {
          return res.status(400).set("Content-Type", "application/json").send({
            message: "Can add only question_text and categories field(s)",
          });
        }
      }
  
      // Add categories from req.body.categories
  
      if (!req.body.question_text || !req.body.categories) {
        return res
          .status(400)
          .set("Content-Type", "application/json")
          .send({ message: "Pass question_text and categories fields" });
      }
  
      // Create question
      const question = await Questions.create({
        question_text: req.body.question_text,
        user_id: user.id,
      });
  
      // For every category in req.body.categories, findorcreate in categories table and create the map category with the question in CategoryQuestion
      for (var item in req.body.categories) {
        let [categoryCreated, created] = await Category.findOrCreate({
          where: {
            category_text: req.body.categories[item].category.toLowerCase(),
          },
        });
  
        await CategoryQuestion.create({
          category_id: categoryCreated.dataValues.id,
          question_id: question.id,
        });
      }
  
      const categoryQuestion = await CategoryQuestion.findAll({
        where: {
          question_id: question.dataValues.id,
        },
      });
  
      let catergoryWhere = [];
  
      categoryQuestion.map((item) => {
        catergoryWhere.push(item.category_id);
      });
  
      const categories = await Category.findAll({
        where: {
          id: catergoryWhere,
        },
      });
  
      let categoriesMapper = [];
  
      categories.map((cat) => {
        categoriesMapper.push({
          category_id: cat.id,
          category: cat.category_text,
        });
      });
  
      const getAnswers = await Answers.findAll({
        where: {
          question_id: question.id,
        },
      });
  
      let answers = [];
  
      for (let answer in getAnswers) {
        const answerAttachments = await AnswerFiles.findAll({
          where: {
            answer_id: getAnswers[answer].id,
          },
          attributes: [
            ["filename", "file_name"],
            ["pathname", "s3_object_name"],
            ["id", "file_id"],
            ["createdAt", "created_date"],
          ],
        });
  
        answers.push({
          answer_id: getAnswers[answer].id,
          question_id: getAnswers[answer].question_id,
          created_timestamp: getAnswers[answer].createdAt,
          updated_timestamp: getAnswers[answer].updatedAt,
          user_id: getAnswers[answer].user_id,
          answer_text: getAnswers[answer].answer_text,
          attachments: answerAttachments,
        });
      }
  
      const questionAttachments = await QuestionFiles.findAll({
        where: {
          question_id: question.id,
        },
        attributes: [
          ["filename", "file_name"],
          ["pathname", "s3_object_name"],
          ["id", "file_id"],
          ["createdAt", "created_date"],
        ],
      });

      let dbQueryEnd = Date.now()
      statsClient.timing('post_question_db_timing', dbQueryEnd-dbQueryStart)


      let end = Date.now()
      statsClient.timing('post_question_timing', end-start)
  
      return res.status(200).set("Content-Type", "application/json").send({
        question_id: question.id,
        created_timestamp: question.question_created,
        updated_timestamp: question.question_updated,
        user_id: question.user_id,
        question_text: question.question_text,
        categories: categoriesMapper,
        answers: answers,
        attachments: questionAttachments,
      });

    }catch(err){

      console.log(err)
      logger.info(err)
  
      let end = Date.now()
      statsClient.timing('post_question_timing', end-start)
  
      return res
      .status(400)
      .set("Content-Type", "application/json")
      .send({ message: err });

    }



  })(req, res, next);
});

// Adding a answer to a question
router.post("/question/:questionId/answer", function (req, res, next) {
  passport.authenticate("basic", { session: false }, async function (
    err,
    user,
    info
  ) {

    let start = Date.now()
    logger.info('POST /question/:questionId/answer called')
    statsClient.increment('post_answer_count');

    if (err) {
      return res
        .status(401)
        .set("Content-Type", "application/json")
        .send({ message: err });
    }
    if (!user) {
      return res
        .status(401)
        .set("Content-Type", "application/json")
        .send({ message: err });
    }

    try{

      let dbQueryStart = Date.now()

      for (var prop in req.body) {
        if (prop === "answer_text") {
          // do nothing
        } else {
          return res.status(400).set("Content-Type", "application/json").send({
            message: "Can accept only answer_text field(s)",
          });
        }
      }
  
      // Add categories from req.body.categories
  
      if (!req.body.answer_text) {
        return res
          .status(400)
          .set("Content-Type", "application/json")
          .send({ message: "Pass answer_text fields" });
      }
  
      const question = await Questions.findOne({
        where: {
          id: req.params.questionId,
        },
      });
  
      if (!question) {
        return res
          .status(404)
          .set("Content-Type", "application/json")
          .send({ message: "Path not found - Check question Id" });
      }
  
      const answer = await Answers.create({
        answer_text: req.body.answer_text,
        question_id: question.id,
        user_id: user.id,
      });

      const answerAttachments = await AnswerFiles.findAll({
        where: {
          answer_id: answer.id,
        },
        attributes: [
          ["filename", "file_name"],
          ["pathname", "s3_object_name"],
          ["id", "file_id"],
          ["createdAt", "created_date"],
        ],
      });


      let dbQueryEnd = Date.now()
      statsClient.timing('post_answer_db_timing', dbQueryEnd-dbQueryStart)


      let end = Date.now()
      statsClient.timing('post_answer_timing', end-start)

      console.log('user', user)

      const questionUser = await User.findOne({
        where: {
          id: question.dataValues.user_id,
        },
      });


      let payload = {
        "user_email": user.email_address,
        "question_email": questionUser.dataValues.email_address,
        "question_firstname": questionUser.dataValues.first_name,
        "key": "answer",
        "details": {
          "question_id": answer.question_id,
          "question_text": question.dataValues.question_text,
          "answer_id": answer.dataValues.id,
          "answer_text": answer.dataValues.answer_text,
          "answer_created": answer.createdAt,
          "user_id": answer.dataValues.user_id
        }
      }

      console.log(payload)

      let params = {
          Message: JSON.stringify(payload),
          TopicArn: process.env.SNS_TOPIC_ARN
      };

      s3.snsClient.publish(params, function(err, data) {
        if (err) 
        {
          console.log(err, err.stack);
          logger.info(err, err.stack);
          res.send(err);
        
        }
        else 
        {
          console.log(data);
          logger.info(data);

          res.send(data);
        }
    });
  
      return res.status(201).send({
        answer_id: answer.id,
        question_id: answer.question_id,
        created_timestamp: answer.createdAt,
        updated_timestamp: answer.updatedAt,
        user_id: answer.user_id,
        answer_text: answer.answer_text,
        attachments: answerAttachments,
      });
  

    }catch(err){

      console.log(err)
      logger.info(err)
  
      let end = Date.now()
      statsClient.timing('post_answer_timing', end-start)
  
      return res
      .status(400)
      .set("Content-Type", "application/json")
      .send({ message: err });


    }

  

  })(req, res, next);
});

// Updating a answer to a question
router.put("/question/:questionId/answer/:answerId", function (req, res, next) {
  passport.authenticate("basic", { session: false }, async function (
    err,
    user,
    info
  ) {

    let start = Date.now()
    logger.info('UPDATE /question/:questionId/answer/:answerId called')
    statsClient.increment('update_answer_count');

    if (err) {
      return res
        .status(401)
        .set("Content-Type", "application/json")
        .send({ message: err });
    }
    if (!user) {
      return res
        .status(401)
        .set("Content-Type", "application/json")
        .send({ message: err });
    }

    try{

      let dbQueryStart = Date.now()

      for (var prop in req.body) {
        if (prop === "answer_text") {
          // do nothing
        } else {
          return res.status(400).set("Content-Type", "application/json").send({
            message: "Can update only answer_text field",
          });
        }
      }
  
      if (!req.body.answer_text) {
        return res.status(400).set("Content-Type", "application/json").send({
          message: "Please pass answer_text field",
        });
      }
  
      const question = await Questions.findOne({
        where: {
          id: req.params.questionId,
        },
      });
  
      if (!question) {
        return res.status(404).set("Content-Type", "application/json").send({
          message: "Path not found - Check Question Id route",
        });
      }
  
      const answer = await Answers.findOne({
        where: {
          id: req.params.answerId,
        },
      });

      let previousAnswerText = answer.dataValues.answer_text

      console.log(previousAnswerText)
  
      if (!answer) {
        return res.status(404).set("Content-Type", "application/json").send({
          message: "Path not found - Check Answer Id route",
        });
      }
  
      if (user.id !== answer.user_id) {
        return res.status(400).set("Content-Type", "application/json").send({
          message: "Cannot update answer posted by other users.",
        });
      }
  
      const updatedAnswer = await answer.update({
        answer_text: req.body.answer_text,
      });

      let dbQueryEnd = Date.now()
      statsClient.timing('post_answer_db_timing', dbQueryEnd-dbQueryStart)


      let end = Date.now()
      statsClient.timing('post_answer_timing', end-start)

      console.log('user', user)

      const questionUser = await User.findOne({
        where: {
          id: question.dataValues.user_id,
        },
      });


      let payload = {
        "user_email": user.email_address,
        "question_email": questionUser.dataValues.email_address,
        "question_firstname": questionUser.dataValues.first_name,
        "key": "updated",
        "details": {
          "question_id": answer.question_id,
          "question_text": question.dataValues.question_text,
          "answer_id": answer.dataValues.id,
          "answer_text": previousAnswerText,
          "answer_created": answer.createdAt,
          "answer_updated": updatedAnswer.dataValues.updatedAt,
          "user_id": answer.dataValues.user_id,
          "updated_answer_text": updatedAnswer.dataValues.answer_text
        }
      }

      console.log(payload)

      let params = {
          Message: JSON.stringify(payload),
          TopicArn: process.env.SNS_TOPIC_ARN
      };

      s3.snsClient.publish(params, function(err, data) {
        if (err) 
        {
          console.log(err, err.stack);
          logger.info(err, err.stack);
          res.send(err);
        
        }
        else 
        {
          console.log(data);
          logger.info(data);

          res.send(data);
        }
    });
  
      return res.status(204).set("Content-Type", "application/json").send();
  

    }catch(err){

      console.log(err)
      logger.info(err)
  
      let end = Date.now()
      statsClient.timing('post_answer_timing', end-start)
  
      return res
      .status(400)
      .set("Content-Type", "application/json")
      .send({ message: err });

    }



  })(req, res, next);
});

// Deleting a answer to a question
router.delete("/question/:questionId/answer/:answerId", function (
  req,
  res,
  next
) {
  passport.authenticate("basic", { session: false }, async function (
    err,
    user,
    info
  ) {

    let start = Date.now()
    logger.info('DELETE /question/:questionId/answer/:answerId called')
    statsClient.increment('delete_answer_count');


    if (err) {
      return res
        .status(401)
        .set("Content-Type", "application/json")
        .send({ message: err });
    }
    if (!user) {
      return res
        .status(401)
        .set("Content-Type", "application/json")
        .send({ message: err });
    }

    try{

      let dbQueryStart = Date.now()

      const question = await Questions.findOne({
        where: {
          id: req.params.questionId,
        },
      });
  
      if (!question) {
        return res.status(404).set("Content-Type", "application/json").send({
          message: "Path not found - Check Question Id route",
        });
      }
  
      const answer = await Answers.findOne({
        where: {
          id: req.params.answerId,
        },
      });
  
      if (!answer) {
        return res.status(404).set("Content-Type", "application/json").send({
          message: "Path not found - Check Answer Id route",
        });
      }
  
      if (answer.user_id !== user.id) {
        return res.status(400).set("Content-Type", "application/json").send({
          message: "Cannot delete an answer posted by someone else.",
        });
      }
  
      const answerAttachments = await AnswerFiles.findAll({
        where: {
          answer_id: req.params.answerId,
        },
      });
  
      logger.info(answerAttachments);
  
      let s3DeleteStart = Date.now()
      // Call s3 client
      const s3Client = s3.s3Client;
      const params = s3.deleteSingleObjectParams;
  
      for (let attachment in answerAttachments) {
        params.Key = answerAttachments[attachment].dataValues.pathname;
  
        console.log(answerAttachments[attachment].dataValues.pathname);
  
        s3Client.deleteObject(params, function (err, data) {
          // an error occurred
          if (err) {
            return res
              .status(400)
              .set("Content-Type", "application/json")
              .send({ message: err });
          } else {
            console.log(data); // successful response
          }
        });

      let s3DeleteEnd = Date.now()
      statsClient.timing('delete_answer_s3_timing', s3DeleteEnd-s3DeleteStart)

  
        await AnswerFiles.destroy({
          where: {
            pathname: answerAttachments[attachment].dataValues.pathname,
          },
        });
      }
  
      params.Key = `${req.params.questionId}/answers`;
  
      s3Client.deleteObject(params, function (err, data) {
        // an error occurred
        if (err) {
          return res
            .status(400)
            .set("Content-Type", "application/json")
            .send({ message: err });
        } else {
          console.log(data); // successful response
        }
      });
  
      await Answers.destroy({
        where: {
          id: req.params.answerId,
        },
      });

      let dbQueryEnd = Date.now()
      statsClient.timing('delete_answer_db_timing', dbQueryEnd-dbQueryStart)

      let end = Date.now()
      statsClient.timing('delete_answer_timing', end-start)

      console.log('user', user)

      const questionUser = await User.findOne({
        where: {
          id: question.dataValues.user_id,
        },
      });


      let payload = {
        "user_email": user.email_address,
        "question_email": questionUser.dataValues.email_address,
        "question_firstname": questionUser.dataValues.first_name,
        "key": "deleted",
        "details": {
          "question_id": question.dataValues.id,
          "question_text": question.dataValues.question_text,
          "time_stamp": Date.now()
        }
      }

      console.log(payload)

      let snsparams = {
          Message: JSON.stringify(payload),
          TopicArn: process.env.SNS_TOPIC_ARN
      };

      s3.snsClient.publish(snsparams, function(err, data) {
        if (err) 
        {
          console.log(err, err.stack);
          logger.info(err, err.stack);
          res.send(err);
        
        }
        else 
        {
          console.log(data);
          logger.info(data);

          res.send(data);
        }
    });
  
      return res.status(204).set("Content-Type", "application/json").send();
  

    }catch(err){

      console.log(err)
      logger.info(err)
  
      let end = Date.now()
      statsClient.timing('delete_answer_timing', end-start)
  
      return res
      .status(400)
      .set("Content-Type", "application/json")
      .send({ message: err });


    }

   

  })(req, res, next);
});

//   To delete a question
router.delete("/question/:questionId", function (req, res, next) {
  passport.authenticate("basic", { session: false }, async function (
    err,
    user,
    info
  ) {

    let start = Date.now()
    logger.info('DELETE /question/:questionId called')
    statsClient.increment('delete_question_count');

    if (err) {
      return res
        .status(401)
        .set("Content-Type", "application/json")
        .send({ message: err });
    }
    if (!user) {
      return res
        .status(401)
        .set("Content-Type", "application/json")
        .send({ message: "Unauthorized" });
    }

    try{

      let dbQueryStart = Date.now()
      const question = await Questions.findOne({
        where: {
          id: req.params.questionId,
        },
      });
  
      if (!question) {
        return res.status(404).set("Content-Type", "application/json").send({
          message: "404 Path not found - Check question route",
        });
      }
  
      // Check if question was posted by authenticated user
      if (question.user_id !== user.id) {
        return res.status(400).set("Content-Type", "application/json").send({
          message: "Cannot delete a question posten by someone else.",
        });
      }
  
      const getAnswers = await Answers.findAll({
        where: {
          question_id: question.id,
        },
      });
  
      if (getAnswers.length > 0) {
        return res.status(400).set("Content-Type", "application/json").send({
          message: "Cannot delete a question that has answers",
        });
      }
  
      await CategoryQuestion.destroy({
        where: {
          question_id: question.id,
        },
      });
  
      const questionAttachments = await QuestionFiles.findAll({
        where: {
          question_id: question.id,
        },
      });
  
      let s3DeleteStart = Date.now()
      // Call s3 client
      const s3Client = s3.s3Client;
      const params = s3.deleteSingleObjectParams;
  
      for (let attachment in questionAttachments) {
        params.Key = questionAttachments[attachment].dataValues.pathname;
  
        console.log(questionAttachments[attachment].dataValues.pathname);
  
        s3Client.deleteObject(params, function (err, data) {
          // an error occurred
          if (err) {
            return res
              .status(400)
              .set("Content-Type", "application/json")
              .send({ message: err });
          } else {
            console.log(data); // successful response
          }
        });
  
        await QuestionFiles.destroy({
          where: {
            pathname: questionAttachments[attachment].dataValues.pathname,
          },
        });
      }
  
      params.Key = `${req.params.questionId}/questions`;
  
      s3Client.deleteObject(params, function (err, data) {
        // an error occurred
        if (err) {
          return res
            .status(400)
            .set("Content-Type", "application/json")
            .send({ message: err });
        } else {
          console.log(data); // successful response
        }
      });
  
      params.Key = `${req.params.questionId}`;
  
      s3Client.deleteObject(params, function (err, data) {
        // an error occurred
        if (err) {
          return res
            .status(400)
            .set("Content-Type", "application/json")
            .send({ message: err });
        } else {
          console.log(data); // successful response
        }
      });

      let s3DeleteEnd = Date.now()
      statsClient.timing('delete_question_s3_timing', s3DeleteEnd-s3DeleteStart)
  
      await Questions.destroy({
        where: {
          id: req.params.questionId,
        },
      });



      let dbQueryEnd = Date.now()
      statsClient.timing('delete_question_db_timing', dbQueryEnd-dbQueryStart)

      let end = Date.now()
      statsClient.timing('delete_question_timing', end-start)
  
      return res.status(204).set("Content-Type", "application/json").send();

    }catch(err){

      console.log(err)
      logger.info(err)
  
      let end = Date.now()
      statsClient.timing('delete_question_timing', end-start)
  
      return res
      .status(400)
      .set("Content-Type", "application/json")
      .send({ message: err });

    }

   

  })(req, res, next);
});

// To update a question
router.put("/question/:questionId", function (req, res, next) {
  passport.authenticate("basic", { session: false }, async function (
    err,
    user,
    info
  ) {

    let start = Date.now()
    logger.info('PUT /question/:questionId called')
    statsClient.increment('update_question_count');

    if (err) {
      return res
        .status(401)
        .set("Content-Type", "application/json")
        .send({ message: err });
    }
    if (!user) {
      return res
        .status(401)
        .set("Content-Type", "application/json")
        .send({ message: "Unauthorized" });
    }

    try{
      let dbQueryStart = Date.now()
      for (var prop in req.body) {
        if (prop === "question_text" || prop === "categories") {
          // do nothing
        } else {
          return res.status(400).set("Content-Type", "application/json").send({
            message: "Can update only question_text and categories field",
          });
        }
      }
      // Add categories from req.body.categories
  
      if (!req.body.question_text || !req.body.categories) {
        return res
          .status(400)
          .set("Content-Type", "application/json")
          .send({ message: "Pass question_text and categories fields" });
      }
  
      const question = await Questions.findOne({
        where: {
          id: req.params.questionId,
        },
      });
  
      if (!question) {
        return res
          .status(404)
          .set("Content-Type", "application/json")
          .send({ message: "Error - Please check questionId in route" });
      }
  
      if (user.id !== question.user_id) {
        return res.status(400).set("Content-Type", "application/json").send({
          message: "Cannot update a question posted by a different user",
        });
      }
  
      await question.update({
        question_text: req.body.question_text,
      });
  
      await CategoryQuestion.destroy({
        where: {
          question_id: question.id,
        },
      });
  
      //   Now freshly add the categories to the system if they don't exist,
      //  if they do, they add a fresh association.
      //  if they don't, they add a fresh association anyway. lol
  
      for (var item in req.body.categories) {
        let [categoryCreated, created] = await Category.findOrCreate({
          where: {
            category_text: req.body.categories[item].category.toLowerCase(),
          },
        });
  
        await CategoryQuestion.create({
          category_id: categoryCreated.dataValues.id,
          question_id: question.id,
        });
      }
  
      const categoriesQuestions = await CategoryQuestion.findAll({
        where: {
          question_id: question.id,
        },
      });
  
      let catergoryWhere = [];
  
      categoriesQuestions.map((item) => {
        catergoryWhere.push(item.category_id);
      });
  
      const categories = await Category.findAll({
        where: {
          id: catergoryWhere,
        },
      });
  
      let categoriesMapper = [];
      categories.map((cat) => {
        categoriesMapper.push({
          category_id: cat.id,
          category: cat.category_text,
        });
      });
  
      const getAnswers = await Answers.findAll({
        where: {
          question_id: question.id,
        },
      });
  
      let answers = [];
  
      for (let answer in getAnswers) {
        const answerAttachments = await AnswerFiles.findAll({
          where: {
            answer_id: getAnswers[answer].id,
          },
          attributes: [
            ["filename", "file_name"],
            ["pathname", "s3_object_name"],
            ["id", "file_id"],
            ["createdAt", "created_date"],
          ],
        });
  
        answers.push({
          answer_id: getAnswers[answer].id,
          question_id: getAnswers[answer].question_id,
          created_timestamp: getAnswers[answer].createdAt,
          updated_timestamp: getAnswers[answer].updatedAt,
          user_id: getAnswers[answer].user_id,
          answer_text: getAnswers[answer].answer_text,
          attachments: answerAttachments,
        });
      }
  
      const questionAttachments = await QuestionFiles.findAll({
        where: {
          question_id: question.id,
        },
        attributes: [
          ["filename", "file_name"],
          ["pathname", "s3_object_name"],
          ["id", "file_id"],
          ["createdAt", "created_date"],
        ],
      });

      let dbQueryEnd = Date.now()
      statsClient.timing('update_question_db_timing', dbQueryEnd-dbQueryStart)

      let end = Date.now()
      statsClient.timing('update_question_timing', end-start)
  
      return res.status(204).set("Content-Type", "application/json").send({
        question_id: question.id,
        created_timestamp: question.question_created,
        updated_timestamp: question.question_updated,
        user_id: question.user_id,
        question_text: question.question_text,
        categories: categoriesMapper,
        answers: answers,
        attachments: questionAttachments,
      });

    }catch(err){

      console.log(err)
      logger.info(err)
  
      let end = Date.now()
      statsClient.timing('update_question_timing', end-start)
  
      return res
      .status(400)
      .set("Content-Type", "application/json")
      .send({ message: err });

    }

  

  })(req, res, next);
});

module.exports = router;
