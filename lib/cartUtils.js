export function addToLocalStorageCart(newItem) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
    const existingItemIndex = cart.findIndex(
      (item) =>
        item.id === newItem.id &&
        item.size === newItem.size &&
        item.temperature === newItem.temperature
    );
  
    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += newItem.quantity;
    } else {
      cart.push(newItem);
    }
  
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Cart:', cart);
  }
  