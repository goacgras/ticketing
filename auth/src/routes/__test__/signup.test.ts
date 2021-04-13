import request from "supertest";
import { app } from "../../app";

it("returns a 201 on successful signup", async () => {
    return request(app)
        .post("/api/users/signup")
        .send({
            email: "test@test.com",
            password: "password",
        })
        .expect(201);
});

it("return a 400 with invalid email", async () => {
    return request(app)
        .post("/api/users/signup")
        .send({
            email: "test",
            password: "password",
        })
        .expect(400);
});

it("return a 400 with invalid password", async () => {
    return request(app)
        .post("/api/users/signup")
        .send({
            email: "test",
            password: "p",
        })
        .expect(400);
});

it("return a 400 with missing email and password", async () => {
    await request(app)
        .post("/api/users/signup")
        .send({
            email: "test@test.com",
        })
        .expect(400);
    await request(app)
        .post("/api/users/signup")
        .send({
            password: "password",
        })
        .expect(400);
});

it("disallows duplicate emails", async () => {
    await request(app)
        .post("/api/users/signup")
        .send({
            email: "test@test.com",
            password: "password",
        })
        .expect(201);
    await request(app)
        .post("/api/users/signup")
        .send({
            email: "test@test.com",
            password: "password",
        })
        .expect(400);
});
//add process.env.JWT_KEY in setup
// also cookie-session set to secure
it("sets cookie after successfully signup", async () => {
    const res = await request(app)
        .post("/api/users/signup")
        .send({
            email: "test@test.com",
            password: "password",
        })
        .expect(201);

    expect(res.get("Set-Cookie")).toBeDefined();
});
