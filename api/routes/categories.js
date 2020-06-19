const express = require('express');
const router = express.Router();

const CategoriesController = require('../controllers/categories');

router.get('/', CategoriesController.getAll);
router.get('/:categoryId',
  CategoriesController.validateRequest('getCategory'), 
  CategoriesController.getFiltered
);
router.post('/',  
  CategoriesController.validateRequest('addCategory'),
  CategoriesController.add
);
router.patch('/:categoryId',  
  CategoriesController.validateRequest('updateCategory'),
  CategoriesController.update
);
router.delete('/:categoryId', 
  CategoriesController.validateRequest('deleteCategory'),
  CategoriesController.delete
);

module.exports = router;