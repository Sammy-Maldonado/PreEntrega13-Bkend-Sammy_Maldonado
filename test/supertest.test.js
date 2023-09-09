import chai from "chai";
import supertest from "supertest";
import UsersDTO from "../src/dtos/user/UsersDTO.js";

const expect = chai.expect;
const requester = supertest('http://localhost:8080'); //host donde hago mi petición

// Usar el metodo de doble terminal para correr el server y hacer las pruebas en esta parte.
describe('Testing integrador de e-commerce Programa-T', () => {
  describe('Tests de ruta de usuarios', () => {

    beforeEach(function () {
      this.timeout(10000);
    })

    it('Endpoint POST/api/users deberá crear correctamente a un usuario', async function () {
      const mockUser = new UsersDTO.RegisterUserDTO({
        first_name: "Sammy",
        last_name: "Maldonado",
        email: "sammyuser@correo.com",
        age: 30,
        role: "user",
        password: "123"
      });
      const response = await requester.post('/api/users').send(mockUser)   //Esta linea manda el objeto, lo parsea y manda la peticion a la base de datos.
      const { status, _body } = response;

      expect(status).to.be.equals(200);
      expect(_body.payload._id).to.be.ok;
    })

    it('Endpoint POST /api/users debe arrojar un estatus 400 si no se pasaron los elementos requeridos', async function () {
      const invalidUser = new UsersDTO.RegisterUserDTO({
        name: "Moni",
      });
      const response = await requester.post('/api/users').send(invalidUser);
      expect(response.status).to.be.eql(400);
    })

    it('Todo usuario creado sin el campo "email", debe considerarse "bad request"', async function () {
      const mockUser = new UsersDTO.RegisterUserDTO({
        first_name: "Sammy",
        last_name: "Maldonado",
        age: 30,
        role: "user",
        password: "123"
      });
      const response = await requester.post('/api/users').send(mockUser)
      const { badRequest } = response;
      //Evaluo que es una "badRequest" por que el correo es obligatorio
      expect(badRequest).to.be.true;
    })

    it('Endpoint GET /api/users debe responder con un formato status+payload y payload debe ser un arreglo', async function () {
      const { _body } = await requester.get('/api/users');
      expect(_body).to.have.property('status');
      expect(_body).to.have.property('payload').and.to.be.an('array');
    })
  })

  describe('Test de elementos avanzados de sessions', () => {

    beforeEach(function () {
      this.timeout(10000);
    })

    let cookie;
    it('El endpoint POST /api/sessions/register debe registrar correctamente un usuario', async function () {
      const mockUser = {
        first_name: "Sammy",
        last_name: "Prueba",
        age: 30,
        email: "sammysessions@correo.com",
        password: "123"
      };
      const { status } = await requester.post('/api/sessions/register').send(mockUser);
      console.log(status);
      expect(status).to.be.eql(200);
    })

    it('El Enpoint POST /api/sessions/login debe devolver una COOKIE', async function () {
      const mockUser = {
        email: "sammysessions@correo.com",
        password: "123"
      }
      const response = await requester.post('/api/sessions/login').send(mockUser);
      const cookieResult = response.headers['set-cookie'][0];
      cookie = {
        name: cookieResult.split("=")[0],
        value: cookieResult.split("=")[1]
      }
      expect(cookie.name).to.be.ok.and.eql('authToken');
      expect(cookie.value).to.be.ok;
    })

    it('El Endpoint GET /api/sessions/current debe recibir la cookie del user y devolverlo correctamente destructurado', async function () {
      const {_body} = await requester.get('/api/sessions/current').set('Cookie',[`${cookie.name}=${cookie.value}`]);
      expect(_body).to.have.property('payload')
    })

    it('El Endpoint POST /api/product/withImage debe poder crear un producto usando multer y cargar el archivo en el server', async function () {
      const mockProduct = {
        title:"Shens",
        description:"shensito de redit",
        price: 8000,
        code: "99",
        stock: 1,
        category: "avatar",
        thumbnails: []
      };
      const response = await requester.post('/api/products/withimage')
      .field('title', mockProduct.title)
      .field('description', mockProduct.description)
      .field('price',mockProduct.price)
      .field('code',mockProduct.code)
      .field('stock',mockProduct.stock)
      .field('category',mockProduct.category)
      .attach('thumbnails', './test/avatar.png') //mandar archivos
      expect(response._body.payload).to.have.property('_id');
    })
  })
})