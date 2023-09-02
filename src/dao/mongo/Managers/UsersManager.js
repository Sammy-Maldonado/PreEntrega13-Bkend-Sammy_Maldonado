import userModel from "../models/user.js";

export default class UsersManager {
  getUsers = (params) => {
    return userModel.find(params).lean();
  }

  getUserBy = (params) => {
    return userModel.findOne(params).lean();
  }

  getUserById = (id) => {
    return userModel.findById(id);
  }

  createUser = (user) => {
    return userModel.create(user);
  }

  updateUser = (id, user) => {
    return userModel.findByIdAndUpdate(id, {$set:user});
  }

  updateOneUser = (email, newHashedPassword) => {
    return userModel.updateOne({email}, {$set:{password:newHashedPassword}})
  }

  deleteUser = (id) => {
    return userModel.findByIdAndDelete(id);
  }
}