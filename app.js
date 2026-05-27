require('dotenv').config();
const express       = require('express');
const path          = require('path');
const session       = require('express-session');
const cookieParser  = require('cookie-parser');
const ejsLayouts    = require('express-ejs-layouts');
const sequelize     = require('./config/database');

// ── Rutas del e-commerce base ──────────────────────────────────
const productRoutes  = require('./routes/products');
const cartRoutes     = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');

// ── Rutas del marketplace ──────────────────────────────────────
const storeAuthRoutes  = require('./routes/storeAuth');   // paso 13.4
const userAuthRoutes   = require('./routes/userAuth');    // paso 14.2
const storeAdminRoutes = require('./routes/storeAdmin');  // paso 15.4
const customerRoutes   = require('./routes/customer');    // paso 16.x

// ── Middleware ─────────────────────────────────────────────────
const { attachLocals } = require('./middleware/authMiddleware');

const app  = express();
const port = process.env.PORT || 3000;

// Configuración de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.use(ejsLayouts);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(session({
  secret:            process.env.SESSION_SECRET || 'dev-secret',
  resave:            false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 }
}));

// Adjunta storeSession y userSession a res.locals
app.use(attachLocals);

// Middleware: carrito vacío si no existe en sesión
app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = { items: [], totalQty: 0, totalPrice: 0 };
  }
  res.locals.cartItemCount = req.session.cart.totalQty || 0;
  next();
});

// ── Rutas ──────────────────────────────────────────────────────
app.use('/',            productRoutes);
app.use('/cart',        cartRoutes);
app.use('/checkout',    checkoutRoutes);
app.use('/store',       storeAuthRoutes);
app.use('/user',        userAuthRoutes);
app.use('/store-admin', storeAdminRoutes);
app.use('/customer',    customerRoutes);

// 404
app.use((req, res) => {
  res.status(404).render('404', { title: 'Página no encontrada' });
});

sequelize.sync({ alter: true })
  .then(() => {
    console.log('Base de datos sincronizada');
    app.listen(port, () => {
      console.log(`Servidor en http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Error sync:', err.message);
    process.exit(1);
  });