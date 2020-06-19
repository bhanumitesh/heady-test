const Product = require('../models/product');
const mongoose = require('mongoose');

const { body, param, validationResult } = require('express-validator');

module.exports = {
  getAll,
  getFiltered,
  add,
  update,
  delete: _delete,
  validateRequest
};

function validateRequest (method) {
  switch (method) {
    case 'addProduct': {
      return [
        body('name')
          .exists().withMessage('product name is mandatory.')
          .trim().not().isEmpty().withMessage('product name cannot be empty.'),
        body('price')
          .exists().withMessage('product price key is mandatory.')
          .trim().not().isEmpty().withMessage('product name cannot be empty.'),
        body('categories')
          .exists().withMessage('categories key is mandatory.')
          .not().isEmpty().withMessage('categories array cannot be empty.'),
      ]
    }

    case 'getProduct': {
      return [
        param('productId')
          .isMongoId().withMessage('Invalid productId value.')
      ]
    }

    case 'updateProduct': {
      return [
        param('productId')
          .isMongoId().withMessage('Invalid productId value.'),
        body('name')
          .exists().withMessage('product name is mandatory.')
          .trim().not().isEmpty().withMessage('product name cannot be empty.'),
        body('price')
          .exists().withMessage('product price key is mandatory.')
          .isInt({ min: 1 }).withMessage('Invalid product price.'),
        body('categories')
          .exists().withMessage('categories key is mandatory.')
          .not().isEmpty().withMessage('categories cannot be empty.'),
      ]
    }

    case 'deleteProduct': {
      return [
        param('productId')
          .isMongoId().withMessage('Invalid productId value.')
      ]
    }
  }
}

function getAll (req, res, next) {
  let filter = {};
  if (req.query.category_id) {
    filter = {
      categories: req.query.category_id
    };
  }
  Product.find(filter)
  .populate('categories')
  .exec()
  .then(products => res.json({products}))
  .catch(err => next(err));
}

function add (req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let productDetails = {
    name: req.body.name,
    price: req.body.price,
    categories: []
  };
  
  req.body.categories.map(categoryId => {
    productDetails.categories.push(mongoose.Types.ObjectId(categoryId));
  });
  const product = new Product(productDetails);
  product.save()
  .then(() => res.json({}))
  .catch(err => next(err));
}

function getFiltered (req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const id = req.params.productId;
  Product.findById(id)
  .select('name price _id')
  .exec()
  .then(result => result ? res.json(result): res.sendStatus(404))
  .catch(err => next(err));
}

function update (req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const id = req.params.productId;
  Product.update({_id: id}, { $set: req.body })
  .exec()
  .then(() => res.json({}))
  .catch(err => next(err));
}

function _delete (req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const id = req.params.productId;
  Product
  .deleteOne({_id: id})
  .exec()
  .then(() => res.json({}))
  .catch(err => next(err));
}