import { createSlice } from '@reduxjs/toolkit'

const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem('cart')) || []
  } catch {
    return []
  }
}

const saveCart = (items) => {
  localStorage.setItem('cart', JSON.stringify(items))
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCart(),
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, size, quantity = 1 } = action.payload
      const key = `${product.id}-${size}`
      const existing = state.items.find((i) => i.key === key)
      if (existing) {
        existing.quantity += quantity
      } else {
        state.items.push({ key, product, size, quantity })
      }
      saveCart(state.items)
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i.key !== action.payload)
      saveCart(state.items)
    },
    updateQuantity: (state, action) => {
      const { key, quantity } = action.payload
      const item = state.items.find((i) => i.key === key)
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((i) => i.key !== key)
        } else {
          item.quantity = quantity
        }
      }
      saveCart(state.items)
    },
    clearCart: (state) => {
      state.items = []
      localStorage.removeItem('cart')
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions

export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0)

export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

export default cartSlice.reducer
