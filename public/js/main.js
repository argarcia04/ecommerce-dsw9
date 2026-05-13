document.addEventListener('DOMContentLoaded', function() {
  // 1. Validacion del formulario de checkout
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', function(event) {
      let valid = true;
      const phoneInput = document.getElementById('phone');
      if (phoneInput && !/^\d{8}$/.test(phoneInput.value.trim())) {
        valid = false; phoneInput.classList.add('is-invalid');
        let err = phoneInput.parentNode.querySelector('.invalid-feedback');
        if (!err) { err = document.createElement('div'); err.className = 'invalid-feedback'; phoneInput.parentNode.appendChild(err); }
        err.textContent = 'Ingresa exactamente 8 digitos.';
      } else if (phoneInput) phoneInput.classList.remove('is-invalid');
      const emailInput = document.getElementById('email');
      if (emailInput && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
        valid = false; emailInput.classList.add('is-invalid');
        let err = emailInput.parentNode.querySelector('.invalid-feedback');
        if (!err) { err = document.createElement('div'); err.className = 'invalid-feedback'; emailInput.parentNode.appendChild(err); }
        err.textContent = 'Ingresa un email valido.';
      } else if (emailInput) emailInput.classList.remove('is-invalid');
      if (!valid) event.preventDefault();
    });
  }
  // 2. Actualizar carrito al cambiar cantidad
  document.querySelectorAll('.cart-quantity-input').forEach(function(input) {
    input.addEventListener('change', function() {
      if (!isNaN(parseInt(this.value)) && parseInt(this.value) > 0) this.closest('form').submit();
    });
  });
  // 3. Confirmar antes de eliminar
  document.querySelectorAll('.remove-item-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      if (!confirm('Eliminar este producto del carrito?')) e.preventDefault();
    });
  });
});