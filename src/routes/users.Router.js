import { Router } from "express";
import { authRoles, passportCall } from "../services/auth.js";
import usersController from "../controllers/users.controller.js";

const router = Router();

router.get('/', usersController.getUsers);
router.post('/', usersController.addUsers)
router.get('/:uId', usersController.getUserById);
router.put('/:uId', usersController.updateUser);
router.put('/premium/:uId', passportCall('jwt', { strategyType: 'jwt', sessions: false }), authRoles('admin'), usersController.changeUserRole);
router.delete('/:uId', passportCall('jwt', { strategyType: 'jwt', sessions: false }), authRoles(["admin"]), usersController.deleteUser);


export default router;