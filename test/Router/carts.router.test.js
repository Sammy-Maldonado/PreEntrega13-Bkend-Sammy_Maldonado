import { expect } from "chai";
import { cartsService, productsService } from '../../src/services/index.js';
import MongoSingleton from "../../MongoSingleton.js";


describe('Testing unitario de la ruta Cart', () => {
  describe('Pruebas de carritos', () => {

    before(async function () {
      // Obtenengo la instancia actualizada de mi Singleton
      const singletonInstance = MongoSingleton.getInstance();
      this.cartsService = cartsService;
      this.productsService = productsService;
    })

    beforeEach(function () {
      this.timeout(5000);
    });

    it('El cartsService debe devolver un arreglo de carritos', async function () {
      const result = await cartsService.getAllCarts();
      expect(Array.isArray(result)).to.be.equal(true);
    });

    it('El cartsService debe insertar correctamente un carrito en la BD', async function () {
      const mockCart = {
        name: "Carrito de Prueba vacío",
        email: "carritoprueba@correo.com"
      };

      const result = await cartsService.createCart(mockCart);
      expect(result).to.have.property('_id');
    });

    it('El cartsService debe agregar correctamente un producto a un carrito', async function () {
      const mockCart = {
        name: "Carrito de Prueba con producto",
        email: "carritoprueba@correo.com"
      };

      const mockProduct = {
        title: "producto de prueba para carrito",
        description: "se agrega al carrito creado",
        price: "2000",
        code: "20",
        stock: "100",
        category: "prueba",
        thumbnails: [],
        owner: mockCart.email
      }

      const cart = await cartsService.createCart(mockCart);
      const product = await productsService.createProduct(mockProduct);
      const productId = product._id;
      const quantity = 2;

      const newCart = await cartsService.addProductToCart(cart._id, productId, quantity);

      const updatedCart = await cartsService.getCartById(newCart._id);

      expect(updatedCart.products).to.have.lengthOf(1);
      expect(updatedCart.products[0].quantity).to.be.equal(quantity);
    });

    it('El cartsService debe actualizar correctamente la cantidad de un producto en el carrito', async function () {
      const mockCart = {
        name: "Carrito de Prueba con producto",
        email: "carritoprueba@correo.com"
      };

      const mockProduct = {
        title: "producto de prueba para carrito",
        description: "se agrega al carrito creado",
        price: "2000",
        code: "20",
        stock: "100",
        category: "prueba",
        thumbnails: [],
        owner: mockCart.email
      }

      const cart = await cartsService.createCart(mockCart);
      const product = await productsService.createProduct(mockProduct);
      const cartId = cart._id;
      const productId = product._id;
      const initialQuantity = 2;
      await cartsService.addProductToCart(cartId, productId, initialQuantity);

      const updatedQuantity = 4;
      const updateCartQuantity = await cartsService.updateProductQuantity(cartId, productId, updatedQuantity);
      const updatedCart = await cartsService.getCartById(cartId);

      expect(updatedCart.products[0].quantity).to.be.equal(updatedQuantity);
    });

    it('El cartsService debe eliminar correctamente un producto de un carrito', async function () {
      const mockCart = {
        name: "Carrito de Prueba con producto",
        email: "carritoprueba@correo.com"
      };

      const mockProduct = {
        title: "producto de prueba para carrito",
        description: "se agrega al carrito creado",
        price: "2000",
        code: "20",
        stock: "100",
        category: "prueba",
        thumbnails: [],
        owner: mockCart.email
      }

      const cart = await cartsService.createCart(mockCart);
      const product = await productsService.createProduct(mockProduct);
      const cartId = cart._id;
      const productId = product._id;
      const quantity = 2;
      await cartsService.addProductToCart(cartId, productId, quantity);
      const deleteProductFromCart = await cartsService.deleteProductFromCart(cartId, productId);
      const updatedCart = await cartsService.getCartById(cartId);

      expect(updatedCart.products).to.have.lengthOf(0);
    });

    it('El cartsService debe devolver correctamente un carrito por su ID', async function () {
      const mockCart = {
        name: "Carrito de Prueba",
        email: "carritoprueba@correo.com"
      };

      const cart = await cartsService.createCart(mockCart);
      const cartId = cart._id;
      const fetchedCart = await cartsService.getCartById(cartId);

      expect(fetchedCart).to.have.property('_id', fetchedCart._id);
    });

    it('El cartsService debe eliminar correctamente todos los productos de un carrito', async function () {
      const mockCart = {
        name: "Carrito de Prueba con producto",
        email: "carritoprueba@correo.com"
      };

      const mockProduct = {
        title: "producto de prueba para carrito",
        description: "se agrega al carrito creado",
        price: "2000",
        code: "20",
        stock: "100",
        category: "prueba",
        thumbnails: [],
        owner: mockCart.email
      }

      const mockProduct2 = {
        title: "producto de prueba2 para carrito",
        description: "se agrega al carrito creado",
        price: "2000",
        code: "21",
        stock: "100",
        category: "prueba",
        thumbnails: [],
        owner: mockCart.email
      }

      const mockProduct3 = {
        title: "producto de prueba3 para carrito",
        description: "se agrega al carrito creado",
        price: "2000",
        code: "22",
        stock: "100",
        category: "prueba",
        thumbnails: [],
        owner: mockCart.email
      }

      const cart = await cartsService.createCart(mockCart);
      const product = await productsService.createProduct(mockProduct);
      const product2 = await productsService.createProduct(mockProduct2);
      const product3 = await productsService.createProduct(mockProduct3);
      const cartId = cart._id;

      const productId = product._id;
      const quantity = 2;

      const productId2 = product._id;
      const quantity2 = 5;

      const productId3 = product._id;
      const quantity3 = 8;

      await cartsService.addProductToCart(cartId, productId, quantity);
      await cartsService.addProductToCart(cartId, productId2, quantity2);
      await cartsService.addProductToCart(cartId, productId3, quantity3);

      const updatedCart = await cartsService.deleteAllProducts(cartId, []);

      expect(updatedCart.products).to.have.lengthOf(0);
    });
  });
});