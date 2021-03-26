const request = require("supertest");
const server = require("./server");
const db = require("../data/dbConfig");

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

afterAll(async (done) => {
  await db.destroy();
  done();
});

// Write your tests here
test("sanity", () => {
  expect(true).toBe(true);
});

describe("auth endpoints", () => {
  describe("[POST] /api/auth/register", () => {
    it("allows new user registration", async () => {
      const res = await request(server)
        .post("/api/auth/register")
        .send({ username: "Captain Marvel", password: "foobar" });
      expect(res.body).toMatchObject({
        id: 1,
        username: "Captain Marvel",
        password: "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG",
      });
    });
    it("responds with a 200 OK", async () => {
      const res = await request(server)
        .post("/api/auth/register")
        .send({ username: "Captain Marvel", password: "foobar" });
      expect(res.status).toBe(200);
    });
  });
  describe("[POST] /api/auth/login", async () => {
    const res = await request(server)
      .post("/api/auth/login")
      .send({ username: "Captain Marvel", password: "foobar" });
    it("login with user", async () => {
      expect(res.body.message).toEqual("welcome, Captain Marvel");
    });
    it("responds with a 200 OK", async () => {
      expect(res.status).toBe(200);
    });
    describe("[GET] /api/jokes", () => {
      it("returns all the jokes", async () => {
        const res = await request(server).get("/api/jokes");
        console.log(res.body);
        expect(res.body).toHaveLength(3);
      });
      it("responds with a 200 OK", async () => {
        const res = await request(server).get("/api/jokes");
        expect(res.status).toBe(200);
      });
    });
  });
});
