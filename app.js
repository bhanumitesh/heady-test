const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const port = process.env.PORT || 4000;

const productRoutes = require('./api/routes/products');
const categoryRoutes = require('./api/routes/categories');

mongoose.connect("mongodb://localhost:27017/heady-test", { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});