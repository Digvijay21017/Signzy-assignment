import express from "express";
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriendRequests, getFriends, suggestFriends  } from "../controllers/friendController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/request", authMiddleware, sendFriendRequest);
router.put("/accept", authMiddleware, acceptFriendRequest);
router.put("/reject", authMiddleware, rejectFriendRequest);
router.get("/requests", authMiddleware, getFriendRequests);
router.get("/getfriends", authMiddleware, getFriends);
router.get("/suggestions", authMiddleware, suggestFriends);


export default router;
