import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    cartOpen: false,
    searchOpen: false,
    mobileMenuOpen: false,
    toast: null,
  },
  reducers: {
    openCart: (state) => { state.cartOpen = true },
    closeCart: (state) => { state.cartOpen = false },
    toggleCart: (state) => { state.cartOpen = !state.cartOpen },
    openSearch: (state) => { state.searchOpen = true },
    closeSearch: (state) => { state.searchOpen = false },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen },
    closeMobileMenu: (state) => { state.mobileMenuOpen = false },
    showToast: (state, action) => {
      state.toast = { message: action.payload.message, type: action.payload.type || 'success' }
    },
    hideToast: (state) => { state.toast = null },
  },
})

export const {
  openCart, closeCart, toggleCart,
  openSearch, closeSearch,
  toggleMobileMenu, closeMobileMenu,
  showToast, hideToast,
} = uiSlice.actions

export default uiSlice.reducer
