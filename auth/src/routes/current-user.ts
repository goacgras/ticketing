import { Request, Response, Router } from "express";
import { currentUser } from "@grasticketing/common";

const router = Router();

router.get(
    "/api/users/currentuser",
    currentUser,
    (req: Request, res: Response) => {
        //if !req.currentUser = undefined. so, return null
        res.send({ currentUser: req.currentUser || null });
    }
);

export { router as currentUserRouter };
