import { productsService } from "../services/index.js";
import ProductsDTO from "../dtos/product/ProductsDTO.js";
import __dirname from "../utils.js";

const getProducts = async (req, res) => {
  try {
    const { page = 1, category } = req.query;
    const { docs, hasPrevPage, hasNextPage, prevPage, nextPage, ...rest } = await productsService.addPaginate(
      { /* category: "frutas" */ },
      {
        page, limit: 5,
        lean: true,
        sort: { price: 1 }
      });
    const products = docs

    const totalPages = rest.totalPages;
    const prevLink = hasPrevPage ? `/api/products?page=${prevPage}` : null;
    const nextLink = hasNextPage ? `/api/products?page=${nextPage}` : null;

    const paginateDTO = new ProductsDTO.GetProductsDTO(products, totalPages, prevPage, nextPage, page, hasPrevPage, hasNextPage, prevLink, nextLink)
    const result = { ...paginateDTO }
    res.send(result);

  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "error", error: 'Error interno del servidor' });
  }
}

const addProduct = async (req, res) => {
  try {
    const { title, description, price, code, stock, category, thumbnails } = req.body;
    const productWithCode = await productsService.getOneProduct({ code })

    //Comprobando que no falten datos o que no esten vacíos

    if (!title || !description || !price || !code || !stock || !category || !thumbnails) return res.status(400).send({ status: 'error', error: 'Datos incompletos, por favor, verifica que los datos se estén enviando correctamente' });

    const existingProduct = productWithCode;
    if (existingProduct) {
      return res.status(400).send({ status: 'error', error: 'El código de producto ya está en uso' });
    }

    //Obtengo los datos del usuario para vincularlo como owner
    const user = req.user;

    const productDTO = new ProductsDTO.CreateProductDTO(req.body, user);
    const product = { ...productDTO };

    const result = await productsService.createProduct(product);
    res.send({ status: "success", message: "Producto agregado correctamente", payload: result });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message })
  }
}

const getProductById = async (req, res) => {
  try {
    const productId = req.params.pId;
    const product = await productsService.getProductById(productId);
    if (product) {
      res.send({ status: "success", message: `El producto '${product.title}', se ha cargado correctamente`, payload: product });
    } else {
      res.status(404).send({ status: "error", error: 'Producto no encontrado' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "error", error: 'Error interno del servidor' })
  }
}

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.pId;
    const productToUpdate = req.body;

    //Verificando que el producto exista en la base de datos
    const productExists = await productsService.getProductById(productId);
    if (!productExists) {
      return res.status(404).send({ status: "error", message: "Producto no encontrado, por favor, ingrese una ID válida" });
    }

    const result = await productsService.updateProduct(productId, productToUpdate)
    const newProduct = await productsService.getProductById(productId)
    console.log(result);
    res.send({ status: "success", message: "Producto actualizado con éxito", payload: newProduct})
  } catch (error) {
    console.log(error);
    res.status(400).send('Producto no encontrado')
  }
}

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.pId;

    const productToDelete = await productsService.getProductById(productId);
    if (!productToDelete) {
      return res.status(404).send({ status: "error", message: "Producto no encontrado, por favor, ingrese una ID válida" })
    }

    //Verificando que el "admin" pueda borrar cualquier producto aunque no sea owner y que el usuario premium solo pueda borrar los productos que le pertenecen

    if (req.user.role === "admin" || (req.user.role === "premium" && productToDelete.owner === req.user.email)) {
      const deletedProduct = await productsService.getProductById(productId);
      const result = await productsService.deleteProduct(productId);
      console.log(result);
      res.send({ status: "success", message: "Su producto ha sido eliminado con éxito", payload: deletedProduct })
    } else {
      return res.status(403).send({ status: "error", error: "Acceso Denegado" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "error", error: 'Error interno del servidor' });
  }
}

const createProductWithImage = async(req,res) => {
  const file = req.file;
  const {title, description, price, code, stock, category, thumbnails} = req.body;
  if(!title || !description || !price || !code || !stock || !category || thumbnails) return res.status(400).send({status:"error",error:"Incomplete values"})
  console.log(file);
  const product = {
    title,
    description,
    price,
    code,
    stock,
    category,
    thumbnails:[`${__dirname}/public/images/${file.filename}`]
  };
  console.log(product);
  const result = await productsService.createProduct(product);
  res.send({status:"success", payload:result})
}

export default {
  getProducts,
  addProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  createProductWithImage
}