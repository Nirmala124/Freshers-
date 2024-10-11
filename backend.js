const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Database connection
const uri = 'mongodb://localhost:80/your_database_name';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Product transaction schema
const productTransactionSchema = new mongoose.Schema({
  dateOfSale: Date,
  productTitle: String,
  productDescription: String,
  price: Number,
  isSold: Boolean,
  category: String,
});

const ProductTransaction = mongoose.model('ProductTransaction', productTransactionSchema);

// API functions

async function initializeDatabase() {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;

    await ProductTransaction.insertMany(transactions);

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

async function listTransactions(req, res) {
  const { month, search, page = 1, perPage = 10 } = req.query;

  let filter = {};
  if (month) {
    const monthDate = new Date(month);
    monthDate.setHours(0, 0, 0, 0);
    monthDate.setFullYear(new Date().getFullYear());
    filter = { ...filter, dateOfSale: { $gte: monthDate } };
  }

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter = {
      $or: [
        { productTitle: searchRegex },
        { productDescription: searchRegex },
        { price: searchRegex },
      ],
    };
  }

  const total = await ProductTransaction.countDocuments(filter);
  const transactions = await ProductTransaction.find(filter)
    .skip((page - 1) * perPage)
    .limit(perPage);

  res.json({ transactions, total });
}

async function getStatistics(req, res) {
  const { month } = req.query;

  const monthDate = new Date(month);
  monthDate.setHours(0, 0, 0, 0);
  monthDate.setFullYear(new Date().getFullYear());

  const filter = { dateOfSale: { $gte: monthDate } };

  const totalSaleAmount = await ProductTransaction.aggregate([
    { $match: filter },
    { $group: { _id: null, totalSaleAmount: { $sum: '$price' } } },
  ]).then((result) => result[0]?.totalSaleAmount || 0);

  const totalSoldItems = await ProductTransaction.countDocuments({ ...filter, isSold: true });
  const totalNotSoldItems = await ProductTransaction.countDocuments({ ...filter, isSold: false });

  res.json({ totalSaleAmount, totalSoldItems, totalNotSoldItems });
}

async function getBarChart(req, res) {
  const { month } = req.query;

  const monthDate = new Date(month);
  monthDate.setHours(0, 0, 0, 0);
  monthDate.setFullYear(new Date().getFullYear());

  const filter = { dateOfSale: { $gte: monthDate } };

  const barChartData = await ProductTransaction.aggregate([
    { $match: filter },
    {
      $bucket: {
        groupBy: '$price',
        boundaries: [0, 101, 201, 301, 401, 501, 601, 701, 801, 901, Infinity],
        default: '901-above',
        output: { count: { $sum: 1 } },
      },
    },
  ]);

  res.json(barChartData);
}

async function getPieChart(req, res) {
  const { month } = req.query;

  const monthDate = new Date(month);
  monthDate.setHours(0, 0, 0, 0);
  monthDate.setFullYear(new Date().getFullYear());

  const filter = { dateOfSale: { $gte: monthDate } };

  const pieChartData = await ProductTransaction.aggregate([
    { $match: filter },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  res.json(pieChartData);
}

// Start the Express server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});