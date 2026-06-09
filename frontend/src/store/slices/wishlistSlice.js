import { createSlice } from '@reduxjs/toolkit'

const loadWishlist = () => {
  try {
    return JSON.parse(localStorage.getItem('wishlist')) || []
  } catch {
    return []
  }
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: loadWishlist(),
  },
  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload
      const idx = state.items.findIndex((p) => p.id === product.id)
      if (idx >= 0) {
        state.items.splice(idx, 1)
      } else {
        state.items.push(product)
      }
      localStorage.setItem('wishlist', JSON.stringify(state.items))
    },
    clearWishlist: (state) => {
      state.items = []
      localStorage.removeItem('wishlist')
    },
  },
})

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions

export const selectIsWishlisted = (productId) => (state) =>
  state.wishlist.items.some((p) => p.id === productId)

export default wishlistSlice.reducer
