const { Store } = require('../models');

// GET /store/register
const showRegister = (req, res) => {
  res.render('store-auth/register', { layout: false, error: null });
};

// POST /store/register
const register = async (req, res) => {
  const { name, owner_name, email, password, paypal_email } = req.body;
  try {
    // Generar slug unico a partir del nombre
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const store = await Store.create({
      name, slug, owner_name, email,
      password_hash: password,   // el hook beforeCreate hashea esto
      paypal_email:  paypal_email || null,
      status: 'active'
    });

    // Iniciar sesion automaticamente
    req.session.storeId = store.id;
    req.session.store   = { id: store.id, name: store.name, slug: store.slug };
    res.redirect('/store-admin/dashboard');
  } catch (err) {
    const msg = err.name === 'SequelizeUniqueConstraintError'
      ? 'Ya existe una tienda con ese email o nombre.'
      : 'Error al crear la tienda.';
    res.render('store-auth/register', { layout: false, error: msg });
  }
};
const showLogin = (req, res) => {
  res.render('store-auth/login', { layout: false, error: null });
};

// POST /store/login
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const store = await Store.findOne({ where: { email } });
    if (!store || !(await store.validatePassword(password))) {
      return res.render('store-auth/login', { layout: false, error: 'Credenciales incorrectas.' });
    }
    if (store.status !== 'active') {
      return res.render('store-auth/login', { layout: false, error: 'Esta tienda esta suspendida.' });
    }
    req.session.storeId = store.id;
    req.session.store   = { id: store.id, name: store.name, slug: store.slug };
    const returnTo = req.session.returnTo || '/store-admin/dashboard';
    delete req.session.returnTo;
    res.redirect(returnTo);
  } catch (err) {
    res.render('store-auth/login', { layout: false, error: 'Error del servidor.' });
  }
};

// POST /store/logout
const logout = (req, res) => {
  req.session.destroy(() => res.redirect('/store/login'));
};

module.exports = { showRegister, register, showLogin, login, logout };