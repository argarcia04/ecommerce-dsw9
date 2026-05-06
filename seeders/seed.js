require('dotenv').config();
const { Product } = require('../models');
const sequelize   = require('../config/database');

const products = [
  { name:'Smartphone XR Pro',    description:'Pantalla AMOLED 6.5", camara 108MP.',  price:499.99, stock:15, imageUrl:'/images/smartphone.jpg' },
  { name:'Laptop UltraSlim 15',  description:'Intel i7, 16GB RAM, SSD 512GB.',        price:899.99, stock:8,  imageUrl:'/images/laptop.jpg' },
  { name:'Auriculares Pro NC',   description:'Cancelacion de ruido, 30h bateria.',    price:199.99, stock:25, imageUrl:'/images/auriculares.jpg' },
  { name:'Smartwatch Series 5',  description:'GPS, frecuencia cardiaca, resistente.', price:249.99, stock:12, imageUrl:'/images/smartwatch.jpg' },
  { name:'Camara Mirrorless 4K', description:'Sensor APS-C, grabacion 4K.',           price:749.99, stock:5,  imageUrl:'/images/camera.jpg' },
];

async function seed() {
  try {
    await sequelize.sync();
    const count = await Product.count();
    if (count > 0) { console.log(`Ya existen ${count} productos.`); return process.exit(0); }
    await Product.bulkCreate(products);
    console.log(`${products.length} productos insertados.`);
    process.exit(0);
  } catch (err) {
    console.error('Error en el seed:', err.message);
    process.exit(1);
  }
}
seed();