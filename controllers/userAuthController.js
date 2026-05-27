const { User } = require('../models');

const showRegister = (req, res) =>
  res.render('user-auth/register', { layout: false, error: null });

const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await User.create({ name, email, password_hash: password });
    req.session.userId = user.id;
    req.session.user   = { id: user.id, name: user.name };
    res.redirect('/customer/dashboard');
  } catch (err) {
    const msg = err.name === 'SequelizeUniqueConstraintError'
      ? 'Ya existe una cuenta con ese email.'
      : 'Error al crear la cuenta.';
    res.render('user-auth/register', { layout: false, error: msg });
  }
};

const showLogin = (req, res) =>
  res.render('user-auth/login', { layout: false, error: null });

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.validatePassword(password))) {
      return res.render('user-auth/login', { layout: false, error: 'Credenciales incorrectas.' });
    }
    req.session.userId = user.id;
    req.session.user   = { id: user.id, name: user.name };
    const returnTo = req.session.returnTo || '/customer/dashboard';
    delete req.session.returnTo;
    res.redirect(returnTo);
  } catch (err) {
    res.render('user-auth/login', { layout: false, error: 'Error del servidor.' });
  }
};

const logout = (req, res) => {
  req.session.destroy(() => res.redirect('/user/login'));
};

module.exports = { showRegister, register, showLogin, login, logout };