import { expect } from "chai";
import { productsService } from '../../src/services/index.js';
import MongoSingleton from "../../MongoSingleton.js";

describe('Testing unitario de la ruta Product', () => {
  describe('Pruebas de productos', () => {

    before(async function () {
      // Obtén la instancia actualizada de tu Singleton
      const singletonInstance = MongoSingleton.getInstance();
      this.productsService = productsService;
    });

    beforeEach(function () {
      this.timeout(5000);
    });

    it('El productsService debe devolver un arreglo de productos', async function () {
      const result = await productsService.getAllProducts({});
      expect(Array.isArray(result)).to.be.equal(true);
    });

    it('El productsService debe insertar correctamente un producto en la BD', async function () {
      const mockProduct = {
        title: "Producto de Prueba",
        description: "Descripción de prueba",
        price: "100",
        code: "12345",
        stock: "10",
        category: "prueba",
        thumbnails: [],
        owner: "owner@correo.com"
      };

      const result = await productsService.createProduct(mockProduct);
      expect(result).to.have.property('_id');
    });

    it('El productsService debe devolver correctamente un producto por su ID', async function () {
      const mockProduct = {
        title: "Producto de Prueba",
        description: "Descripción de prueba",
        price: "100",
        code: "12345",
        stock: "10",
        category: "prueba",
        thumbnails: [],
        owner: "owner@correo.com"
      };

      const createdProduct = await productsService.createProduct(mockProduct);
      const productId = createdProduct._id;

      const fetchedProduct = await productsService.getProductById(productId);
      expect(fetchedProduct).to.have.property('_id', fetchedProduct._id);
    });

    it('El productsService debe actualizar correctamente un producto', async function () {
      const mockProduct = {
        title: "Producto de Prueba",
        description: "Descripción de prueba",
        price: 100,
        code: "12345",
        stock: "10",
        category: "prueba",
        thumbnails: [],
        owner: "owner@correo.com"
      };

      const createdProduct = await productsService.createProduct(mockProduct);
      const productId = createdProduct._id;

      const updatedProductData = {
        title: "Producto Actualizado",
        description: "Descripción actualizada",
        price: 200,
      };

      const updateProduct = await productsService.updateProduct(productId, updatedProductData);
      const updatedProduct = await productsService.getProductById(productId);
      expect(updatedProduct.title).to.be.equal(updatedProductData.title);
      expect(updatedProduct.description).to.be.equal(updatedProductData.description);
      expect(updatedProduct.price).to.be.equal(updatedProductData.price);
    });

    it('El productsService debe eliminar correctamente un producto', async function () {
      const mockProduct = {
        title: "Producto de Prueba",
        description: "Descripción de prueba",
        price: 200,
        code: "12345",
        stock: "10",
        category: "prueba",
        thumbnails: [],
        owner: "owner@correo.com"
      };

      const createdProduct = await productsService.createProduct(mockProduct);
      const productId = createdProduct._id;

      const deleteProduct = await productsService.deleteProduct(productId);
      const result = await productsService.getProductById(productId);
      expect(result).to.be.null;
    });
  });
});