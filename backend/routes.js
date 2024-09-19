const express = require("express");
const userRouter = express.Router();

const { allUsernames, updateUser, deleteUser, addNewUser } = require("./controller");

userRouter.get("/", allUsernames);
userRouter.post("/new", addNewUser);
userRouter.put("/:id", updateUser);
userRouter.delete("/:id", deleteUser);

module.exports = userRouter;