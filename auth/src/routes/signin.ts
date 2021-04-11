import { Request, Response, Router } from "express";

const router = Router();

router.post("/api/users/signin", (_: Request, res: Response) => {
    res.send("Hi there");
});

export { router as signinRouter };
