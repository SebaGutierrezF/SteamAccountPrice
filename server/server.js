const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');

dotenv.config();

const app = express();
const steamInventoryRouter = require('./routes/steamInventory');

app.use(cors());
app.use(express.json());
app.use('/api', steamInventoryRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
