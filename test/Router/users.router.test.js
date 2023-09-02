import { expect } from "chai";
import { createHash, validatePassword } from '../../src/services/auth.js';

import { usersService } from '../../src/services/index.js';
import UsersDTO from '../../src/dtos/user/UsersDTO.js';
import MongoSingleton from "../../MongoSingleton.js";

describe('Testing unitario de la ruta User', () => {
  describe('Pruebas de usuarios', () => {

    before(async function () {
      // Obtenengo la instancia actualizada de mi Singleton
      const singletonInstance = MongoSingleton.getInstance();
      this.usersServices = usersService;
    })

    beforeEach(function () {
      this.timeout(5000);
    })

    it('El userServices debe devolver un arreglo de usuarios', async function () {
      const result = await usersService.getAllUser();
      expect(Array.isArray(result)).to.be.equal(true);
    })

    it('El userServices debe insertar correctamente un usuario en la base', async function () {
      const mockUser = new UsersDTO.RegisterUserDTO({
        first_name: "Sammy",
        last_name: "Maldonado",
        email: "sammy@correo.com",
        age: 25,
        role: "user",
        password: "123"
      });

      const result = await usersService.createUser(mockUser);
      expect(result).to.have.property('_id');
    })

    it('El userServices debe actualizar correctamente a un usuario de la base de datos', async function () {
      const mockUser = new UsersDTO.RegisterUserDTO({
        first_name: "Mónica",
        last_name: "Sanchez",
        email: "moni@correo.com",
        password: "123",
        role: "user"
      });

      const result = await usersService.createUser(mockUser);
      const resultUpdate = await usersService.updateUser(result._id, { role: "admin" });
      const updatedUser = await usersService.getUserBy({ email: "moni@correo.com" });

      expect(updatedUser.role).to.be.equal('admin');
    })

    it('El userService debe eliminar correctamente a un usuario de la base de datos', async function () {
      const mockUser = {
        first_name: "Joaquin",
        last_name: "Chaparro",
        email: "joaquin@correo.com",
        password: "123",
        role: "user"
      }

      const result = await usersService.createUser(mockUser);
      const deleteUser = await usersService.deleteUser(result._id);

      // Verificar si el usuario ha sido eliminado correctamente
      const userAfterDeletion = await usersService.getUserById(result._id);
      expect(userAfterDeletion).to.be.null; // El usuario no debe existir en la BD después de la eliminación.
    })
  })
  describe('Más pruebas unitarias', () => {
    describe('bcrypt', () => {
      it('La función createHash debe hacer un hasheo efectivo', async function () {
        const testPassword = "123";
        const hashedPassword = await createHash(testPassword);
        expect(testPassword).to.not.be.equal(hashedPassword);
        expect(/(?=[A-Za-z0-9@#$%/^.,{}&+!=]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+!=])(?=.{8,}).*$/.test(hashedPassword)).to.be.equal(true);
      })

      it('La funcion validatePassword debe comparar correctamente las contraseñas', async function () {
        const password = "123";
        const hashedPassword = await createHash(password);
        const isValidPassword = await validatePassword(password, hashedPassword);
        expect(isValidPassword).to.be.ok.and.to.be.equal(true);
      })

      it('La funcion validatePassword debe devolver false si el hasheo fue alterado', async function () {
        const password = "123";
        const hashedPassword = await createHash(password);
        const alteredHashedPassword = hashedPassword + "extraString"; // Alteramos el hash
        const isValidPassword = await validatePassword(password, alteredHashedPassword);
        expect(isValidPassword).to.be.false;
      })
    })
    describe('Pruebas de DTO', () => {
      it('El UsersDTO debe unificar el nombre y apellido en una única variable name', function () {
        const mockUser = {
          first_name: "Simon",
          last_name: "Perro",
          email: "simoncito@correo.com",
          _id: '"#%#$"%"#%51651JASDKJSDN/sdaj/',
          password: 'ASDA)("#$=!"?',
          __v: 0
        }
        const userDTO = new UsersDTO.RegisterUserDTO(mockUser);
        expect(userDTO).to.have.property('name');
        expect(userDTO.name).to.contain(mockUser.first_name);
        expect(userDTO.name).to.contain(mockUser.last_name);
      })

      it('El UsersDTO debe remover las propiedades innecesarias "_id", "__v"', function () {
        const mockUser = {
          _id: 'alguna_id',
          __v: 0,
          password: 'password',
          first_name: "Roberto",
          last_name: "Maldonado",
          email: "roberto@correo.com",
        }
        const userDTO = new UsersDTO.RegisterUserDTO(mockUser);

        // Las propiedades innecesarias deben estar ausentes en el userDTO
        expect(userDTO).to.not.have.property('_id');
        expect(userDTO).to.not.have.property('__v');

        // Las propiedades necesarias deben estar presentes en el userDTO
        expect(userDTO).to.have.property('name');
        expect(userDTO).to.have.property('email');

        // El nombre del usuario debe tener el formato correcto
        expect(userDTO.name).to.equal(`${mockUser.first_name} ${mockUser.last_name}`);
      })
    })
  })
})