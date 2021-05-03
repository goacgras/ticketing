import request from "supertest";
import { app } from "../../app";

it("response with details with current user", async () => {
    const cookie = await global.signin();

    const res = await request(app)
        .get("/api/users/currentuser")
        .set("Cookie", cookie)
        .send()
        .expect(400);

    // console.log(res.body)
    expect(res.body.currentUser.email).toEqual("test@test.com");
});

it("response with null if not authenticated", async () => {
    const res = await request(app)
        .get("/api/users/currentuser")
        .send()
        .expect(200);

    expect(res.body.currentUser).toEqual(null);
});
