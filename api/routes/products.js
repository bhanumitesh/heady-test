const express = require('express');
const router = express.Router();

const ProductsController = require('../controllers/products');

router.get('/', ProductsController.getAll);
router.get('/:productId',
  ProductsController.validateRequest('getProduct'),
  ProductsController.getFiltered
);
router.post('/', 
  ProductsController.validateRequest('addProduct'),
  ProductsController.add
);
router.patch('/:productId', 
  ProductsController.validateRequest('updateProduct'),
  ProductsController.update
);
router.delete('/:productId', 
  ProductsController.validateRequest('deleteProduct'),
  ProductsController.delete
);

module.exports = router;