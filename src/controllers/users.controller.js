import { usersService } from "../services/index.js";

const getUsers = async (req, res) => {
  try {
    const users = await usersService.getAllUser();
    res.status(200).send({ status: "success", payload: users });
  } catch (error) {
    res.status(500).send({ status: "error", error: 'Error interno del servidor' });
  }
}

const getUserById = async (req, res) => {
  try {
    const userId = req.params.uId;
    const user = await usersService.getUserById(userId);
    if (user) {
      res.send({ status: "success", message: `El usuario '${user.name}', se ha cargado correctamente`, payload: user });
    } else {
      res.status(400).send({ status: "error", error: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "error", error: 'Error interno del servidor' })
  }
}

const addUsers = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = req.body;

    const newUser = await usersService.createUser(user);
    res.status(200).send({ status: "success", cart: newUser });
  } catch (error) {
    res.status(500).send({ status: "error", error: error.message });
  }
}

const changeUserRole = async (req, res) => {
  try {
    const userId = req.params.uId;
    const user = await usersService.getUserById(userId);

    if (!user) {
      return res.status(404).send({ status: 'error', error: 'Usuario no encontrado, por favor, ingrese una ID válida' });
    }

    // Cambiar el rol del usuario
    user.role = user.role === 'user' ? 'premium' : 'user';

    // Actualizar el usuario en la base de datos
    const updatedUser = await usersService.updateUser(userId, user);
    const newUserRole = await usersService.getUserById(userId);

    res.status(200).send({ status: 'success', message: 'Rol de usuario actualizado con éxito', payload: newUserRole });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: 'error', error: 'Error interno del servidor' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.uId;

    const userToDelete = await usersService.getUserById(userId);
    if(!userToDelete) {
      return res.status(404).send({ status: "error", message: "Usuario no encontrado, por favor, ingrese una ID válida" })
    }

    //Verificando que solo el admin pueda borrar usuarios
    if (req.user.role === "admin") {
      const result = await usersService.deleteUser(userId);
      res.send({ status: "success", message: "El usuario ha sido eliminado con éxito", payload: result })
    } else {
      return res.status(403).send({ status: "error", error: "Acceso Denegado" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "error", error: 'Error interno del servidor' });
  }
}

export default {
  getUsers,
  getUserById,
  addUsers,
  changeUserRole,
  deleteUser
}