require('dotenv').config();
const express = require('express');

const authRouter = require('./routes/authRouter');
const customerRouter = require('./routes/customerRouter');
const productRouter = require('./routes/productRouter');
const aiRouter = require('./routes/aiRouter');

const app = express();

app.use(express.static('flutter_shopwise_app/assets'));
app.use(express.json());

// JSON Error Handler (prevents crashing on bad JSON)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error(`Malformed JSON received: ${err.message}`);
    return res.status(400).json({ error: 'Invalid JSON format. Please use double quotes for keys and values.' });
  }
  next();
});

app.use('/', authRouter);
app.use('/', customerRouter);
app.use('/', productRouter);
app.use('/', aiRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
