const Category = require('../models/category');
const mongoose = require('mongoose');

const { body, param, validationResult } = require('express-validator');
const category = require('../models/category');

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
    case 'addCategory': {
      return [
        body('name')
          .exists().withMessage('category name is mandatory.')
          .trim().not().isEmpty().withMessage('product name cannot be empty.'),
        body('parent')
          .optional().isMongoId().withMessage('Invalid parent value.'),
      ]
    }

    case 'getCategory': {
      return [
        param('categoryId')
          .isMongoId().withMessage('Invalid categoryId value.')
      ]
    }

    case 'updateCategory': {
      return [
        param('categoryId')
          .isMongoId().withMessage('Invalid categoryId value.'),
        body('name')
          .exists().withMessage('product name is mandatory.')
          .trim().not().isEmpty().withMessage('product name cannot be empty.'),
        body('parent')
          .optional().isMongoId().withMessage('Invalid parent value.')
      ]
    }

    case 'deleteCategory': {
      return [
        param('categoryId')
          .isMongoId().withMessage('Invalid categoryId value.')
      ]
    }
  }
}
var oldRows;
function getAll (req, res, next) {  
  Category.aggregate([
  {
    $graphLookup: {
        from: "categories",
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "parent",
        as: "children"
    }
  }
  ])
  .exec()
  .then(rows => {
    // var categories = {};
    // oldRows = rows;
    // let child = {};
    // if (rows.length > 0) {
    //   rows.map(row => {
    //     categories[row._id] = {
    //       _id: row._id,
    //       name: row.name,
    //       parent: row.parent,
    //       children: null
    //     }

    //     child = constructHierarchy(row.children, row._id);
    //     categories[row._id].children = child;
    //   });
    // }
    res.json(rows);
  })
  .catch(err => next(err));
}

function constructHierarchy ( children, parentId, temp = [] ) {
  var filtered;
  if (parentId != null) {
    children = children.filter(item => item.parent.toString() == parentId.toString());
  }
  children.map(child => {
    oldRows.map(oldRow => {
      if (child._id.toString() == oldRow._id.toString()) {
        oldRow.children.map(record => {
          if (record.children !== undefined && record.children.length > 0) {
            constructHierarchy ( record.children, record._id, temp );
          }
        });
        filtered = oldRows.filter(item => item._id.toString() !== oldRow._id.toString());
        if (child.children !== undefined && child.children.length > 0) {
          constructHierarchy ( child.children, child._id, temp );
        }
        oldRows = filtered;
        temp.push(oldRow);
      }
    });
  });
  return temp;
}

function add (req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  
  const category = new Category({
    name: req.body.name,
    parent: req.body.parent
  });
  category.save()
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
  .select('name price _id productImage')
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