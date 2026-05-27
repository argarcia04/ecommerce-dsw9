/**
 * requireStoreAuth — protege rutas del panel admin de tienda
 * requireUserAuth  — protege rutas del dashboard de usuario
 */
const requireStoreAuth = (req, res, next) => {
  if (req.session && req.session.storeId) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect('/store/login');
};

const requireUserAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect('/user/login');
};

// Middleware que adjunta store/user a res.locals (para las vistas)
const attachLocals = (req, res, next) => {
  res.locals.storeSession = req.session.store || null;
  res.locals.userSession  = req.session.user  || null;
  next();
};

module.exports = { requireStoreAuth, requireUserAuth, attachLocals };