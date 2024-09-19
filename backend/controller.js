const mongoose = require("mongoose");
const User = require("./model");

const allUsernames = async (req, res) => {
  let usernames;
  try {
    usernames = await User.find();
  } catch (e) {
    console.error(e);
  }
  if (!usernames) return res.status(404).json({ message: "No Usernames Found" });
  return res.status(200).json({ usernames });
};

const addNewUser = async (req, res) => {
  const { username } = req.body;
  const newUser = new User({ username });
  try {
    await newUser.save();
  } catch (e) {
    console.error(e);
  }
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await newUser.save(session);
    session.commitTransaction();
  } catch (e) {
    return res.send(500).json({ message: e });
  }
  return res.status(200).json({ newUser });
};

const deleteUser = async (req, res) => {
  const id = req.params.id;
  try {
    const currentUser = await User.findByIdAndDelete(id);
    if (!currentUser) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ message: "User deleted successfully!" });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ message: "Unable to delete!" });
  }
};

const updateUser = async (req, res) => {
  const id = req.params.id;
  const { username } = req.body;
  let currentUser;
  try {
    currentUser = await User.findByIdAndUpdate(id, { username });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Something went wrong while updating !",
    });
  }

  if (!currentUser) {
    return res.status(500).json({ message: "Unable to update" });
  }

  return res.status(200).json({ currentUser });
};

module.exports = { allUsernames, updateUser, deleteUser, addNewUser };