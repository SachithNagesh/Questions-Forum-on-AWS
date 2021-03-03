const supertest = require("supertest");
const app = require("../app");
const Sequelize = require("sequelize");

// Test Route - POST /v1/signup
describe("Route - POST /v1/signup", () => {
  test("Testing for strong password", async (done) => {
    const response = await supertest(app).post("/v1/user/").send({
      email_address: "John@doe.com",
      password: "john123123",
      first_name: "John",
      last_name: "Doe",
    });

    expect(response.status).toBe(400);
    console.log(response.type);
    expect(response.body.message).toBe(
      "Please provide a strong password that contains atleast 1 numerical, lowercase, uppercase alphabetic charater with one special charater and 8 charaters long."
    );

    done();
  });

  test("Testing for valid email", async (done) => {
    const response = await supertest(app).post("/v1/user/").send({
      email_address: "John@doe",
      password: "John@12345",
      first_name: "John",
      last_name: "Doe",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Please provide a valid email");

    done();
  });

  test("Testing with all correct data", async (done) => {
    const response = await supertest(app).post("/v1/user/").send({
      email_address: "John@doe.com",
      password: "John@12345",
      first_name: "John",
      last_name: "Doe",
    });

    expect(response.status).toBe(201);
    expect(response.body.first_name).toBe("John");
    expect(response.body.last_name).toBe("Doe");
    expect(response.body.username).toBe("john@doe.com");
    expect(response.info).toBe(false);

    done();
  });

  test("Testing for duplicate email", async (done) => {
    const response = await supertest(app).post("/v1/user/").send({
      email_address: "John@doe.com",
      password: "John@12345",
      first_name: "John",
      last_name: "Doe",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email address already exists");

    done();
  });
});

// Test Route - GET /v1/self
describe("Route - GET /v1/self", () => {
  test("Testing with proper credentials", async (done) => {
    const response = await supertest(app)
      .get("/v1/user/self")
      .set("Authorization", "Basic am9obkBkb2UuY29tOkpvaG5AMTIzNDU=");

    expect(response.status).toBe(200);
    expect(response.badRequest).toBe(false);
    expect(response.body).toHaveProperty("id");
    expect(response.body.first_name).toBe("John");
    expect(response.body.last_name).toBe("Doe");
    expect(response.body.username).toBe("john@doe.com");
    expect(response.body).toHaveProperty("account_created");
    expect(response.body).toHaveProperty("account_updated");

    done();
  });

  test("Testing with wrong email address", async (done) => {
    const response = await supertest(app)
      .get("/v1/user/self")
      .set("Authorization", "Basic YWRtaW4yQGFkbWluLmNvbW06QWRtaW5AMTIzNDU=");

    expect(response.status).toBe(401);
    expect(JSON.parse(response.text)).toStrictEqual({
      message: "Unauthorized: Please check your email address",
    });

    done();
  });

  test("Testing with wrong password", async (done) => {
    const response = await supertest(app)
      .get("/v1/user/self")
      .set("Authorization", "Basic am9obkBkb2UuY29tOkFkbWluQDEyMzQ1Ng==");

    expect(response.status).toBe(401);
    expect(JSON.parse(response.text)).toStrictEqual({
      message: "Unauthorized: Please check your password",
    });

    done();
  });
});

// Test Route - PUT /v1/self
describe("Route - PUT /v1/self", () => {
  test("Testing with wrong email address", async (done) => {
    const response = await supertest(app)
      .get("/v1/user/self")
      .set("Authorization", "Basic YWRtaW4yQGFkbWluLmNvbW06QWRtaW5AMTIzNDU=");

    expect(response.status).toBe(401);
    expect(JSON.parse(response.text)).toStrictEqual({
      message: "Unauthorized: Please check your email address",
    });

    done();
  });

  test("Testing with proper credentials and wrong fields", async (done) => {
    const response = await supertest(app)
      .put("/v1/user/self")
      .send({ first_name: "John", last_name: "Doe", account_updated: "zzzz" })
      .set("Authorization", "Basic am9obkBkb2UuY29tOkpvaG5AMTIzNDU=");

    expect(response.status).toBe(400);
    expect(response.badRequest).toBe(true);

    expect(response.body.message).toBe(
      "Can update only password, first_name and last_name fields"
    );

    done();
  });

  test("Testing with proper credentials and for weak password", async (done) => {
    const response = await supertest(app)
      .put("/v1/user/self")
      .send({
        first_name: "John",
        last_name: "Doe",
        email_address: "john@doe.com",
        password: "john123",
      })
      .set("Authorization", "Basic am9obkBkb2UuY29tOkpvaG5AMTIzNDU=");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Please choose a strong password that contains atleast 1 numerical, lowercase, uppercase alphabetic charater with one special charater and 8 charaters long."
    );
    done();
  });

    test("Testing with proper credentials and Wrong email_address in request", async (done) => {
      const response = await supertest(app)
        .put("/v1/user/self")
        .send({
          first_name: "John",
          last_name: "Doe",
          email_address: "john1@doe.com",
          password: "John@1234567",
        })
        .set("Authorization", "Basic am9obkBkb2UuY29tOkpvaG5AMTIzNDU=");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Cannot update another user's information"
      );

      done();
    });

    test("Testing with proper credentials and fields", async (done) => {
      const response = await supertest(app)
        .put("/v1/user/self")
        .send({
          first_name: "John",
          last_name: "Doe",
          email_address: "john@doe.com",
          password: "John@1234567",
        })
        .set("Authorization", "Basic am9obkBkb2UuY29tOkpvaG5AMTIzNDU=");

      expect(response.status).toBe(204);
      expect(response.noContent).toBe(true);

      done();
    });

    test("Testing after update", async (done) => {
      const response = await supertest(app)
        .put("/v1/user/self")
        .send({
          first_name: "John",
          last_name: "Doe",
          email_address: "john@doe.com",
          password: "John@1234567",
        })
        .set("Authorization", "Basic am9obkBkb2UuY29tOkpvaG5AMTIzNDU=");

      expect(response.status).toBe(401);
      expect(JSON.parse(response.text)).toStrictEqual({
        message: "Unauthorized: Please check your password",
      });

      done();
    });


});
