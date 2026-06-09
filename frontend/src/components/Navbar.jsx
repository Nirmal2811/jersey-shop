import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown } from 'lucide-react'
import { toggleCart, openSearch } from '../store/slices/uiSlice'
import { selectCartCount } from '../store/slices/cartSlice'

const NAV_ITEMS = [
  { label: 'NEW', path: '/products?sort=newest' },
  {
    label: 'BY CLUB',
    mega: {
      columns: [
        {
          title: 'TOP CLUBS',
          links: [
            { label: 'Real Madrid', path: '/products?club=real-madrid' },
            { label: 'FC Barcelona', path: '/products?club=barcelona' },
            { label: 'Manchester United', path: '/products?club=man-united' },
            { label: 'Liverpool FC', path: '/products?club=liverpool' },
            { label: 'Manchester City', path: '/products?club=man-city' },
            { label: 'Chelsea FC', path: '/products?club=chelsea' },
            { label: 'Arsenal FC', path: '/products?club=arsenal' },
          ],
        },
        {
          title: 'EUROPEAN CLUBS',
          links: [
            { label: 'Bayern Munich', path: '/products?club=bayern' },
            { label: 'PSG', path: '/products?club=psg' },
            { label: 'Juventus', path: '/products?club=juventus' },
            { label: 'AC Milan', path: '/products?club=ac-milan' },
            { label: 'Inter Milan', path: '/products?club=inter-milan' },
            { label: 'BVB Dortmund', path: '/products?club=bvb' },
            { label: 'Atletico Madrid', path: '/products?club=atletico' },
          ],
        },
        {
          title: 'SHOP BY LEAGUE',
          links: [
            { label: 'Premier League', path: '/products?league=premier-league' },
            { label: 'La Liga', path: '/products?league=laliga' },
            { label: 'Bundesliga', path: '/products?league=bundesliga' },
            { label: 'Serie A', path: '/products?league=serie-a' },
            { label: 'Ligue 1', path: '/products?league=ligue1' },
            { label: 'Champions League', path: '/products?league=ucl' },
          ],
        },
        {
          title: 'QUICK LINKS',
          highlight: true,
          links: [
            { label: 'All Club Jerseys', path: '/products?category=club-jersey' },
            { label: 'New Arrivals', path: '/products?sort=newest' },
            { label: 'Best Sellers', path: '/products?sort=popular' },
            { label: 'Sale', path: '/products?sale=true' },
          ],
        },
      ],
    },
  },
  {
    label: 'NATIONAL TEAMS',
    mega: {
      columns: [
        {
          title: 'UEFA',
          links: [
            { label: 'France', path: '/products?team=france' },
            { label: 'Germany', path: '/products?team=germany' },
            { label: 'England', path: '/products?team=england' },
            { label: 'Spain', path: '/products?team=spain' },
            { label: 'Portugal', path: '/products?team=portugal' },
            { label: 'Netherlands', path: '/products?team=netherlands' },
            { label: 'Italy', path: '/products?team=italy' },
            { label: 'Belgium', path: '/products?team=belgium' },
          ],
        },
        {
          title: 'CONMEBOL',
          links: [
            { label: 'Brazil', path: '/products?team=brazil' },
            { label: 'Argentina', path: '/products?team=argentina' },
            { label: 'Uruguay', path: '/products?team=uruguay' },
            { label: 'Colombia', path: '/products?team=colombia' },
          ],
        },
        {
          title: 'SHOP',
          links: [
            { label: 'All National Teams', path: '/products?category=national-team' },
            { label: 'World Cup Kits', path: '/products?tournament=world-cup' },
            { label: 'Euro Kits', path: '/products?tournament=euro' },
            { label: 'Copa America', path: '/products?tournament=copa-america' },
          ],
        },
      ],
    },
  },
  {
    label: 'MEN',
    mega: {
      columns: [
        {
          title: 'JERSEYS',
          links: [
            { label: 'Club Jerseys', path: '/products?category=club-jersey&gender=men' },
            { label: 'National Team', path: '/products?category=national-team&gender=men' },
            { label: 'Home Kits', path: '/products?type=home&gender=men' },
            { label: 'Away Kits', path: '/products?type=away&gender=men' },
          ],
        },
        {
          title: 'JACKETS',
          links: [
            { label: 'Training Jackets', path: '/products?category=jacket&type=training&gender=men' },
            { label: 'Track Jackets', path: '/products?category=jacket&type=track&gender=men' },
            { label: 'Windbreakers', path: '/products?category=jacket&type=windbreaker&gender=men' },
            { label: 'All Jackets', path: '/products?category=jacket&gender=men' },
          ],
        },
      ],
    },
  },
  {
    label: 'WOMEN',
    mega: {
      columns: [
        {
          title: 'JERSEYS',
          links: [
            { label: 'Club Jerseys', path: '/products?category=club-jersey&gender=women' },
            { label: 'National Team', path: '/products?category=national-team&gender=women' },
          ],
        },
        {
          title: 'JACKETS',
          links: [
            { label: 'Training Jackets', path: '/products?category=jacket&gender=women' },
            { label: "All Women's", path: '/products?gender=women' },
          ],
        },
      ],
    },
  },
  {
    label: 'JACKETS',
    mega: {
      columns: [
        {
          title: 'TYPE',
          links: [
            { label: 'Training Jackets', path: '/products?category=jacket&type=training' },
            { label: 'Track Jackets', path: '/products?category=jacket&type=track' },
            { label: 'Windbreakers', path: '/products?category=jacket&type=windbreaker' },
            { label: 'Zip-Up Jackets', path: '/products?category=jacket&type=zip-up' },
          ],
        },
        {
          title: 'BY CLUB',
          links: [
            { label: 'Real Madrid', path: '/products?category=jacket&club=real-madrid' },
            { label: 'Barcelona', path: '/products?category=jacket&club=barcelona' },
            { label: 'Man United', path: '/products?category=jacket&club=man-united' },
            { label: 'Liverpool', path: '/products?category=jacket&club=liverpool' },
            { label: 'Bayern Munich', path: '/products?category=jacket&club=bayern' },
            { label: 'All Clubs', path: '/products?category=jacket' },
          ],
        },
      ],
    },
  },
  { label: 'KIDS', path: '/products?gender=kids' },
  { label: 'SALE', path: '/products?sale=true', accent: true },
]

export default function Navbar() {
  const dispatch = useDispatch()
  const location = useLocation()
  const cartCount = useSelector(selectCartCount)
  const wishlistCount = useSelector((s) => s.wishlist.items.length)
  const { isAuthenticated } = useSelector((s) => s.auth)

  const [activeMenu, setActiveMenu] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSub, setMobileSub] = useState(null)

  useEffect(() => {
    setMobileOpen(false)
    setMobileSub(null)
    setActiveMenu(null)
  }, [location.pathname])

  const activeItem = NAV_ITEMS.find((i) => i.label === activeMenu)

  return (
    <header className="sticky top-0 z-50">
      <div className="relative" onMouseLeave={() => setActiveMenu(null)}>

        <nav className="bg-black">
          <div className="max-w-[1400px] mx-auto px-3 lg:px-4 flex items-center h-14 lg:h-16 relative">

            {/* ── Mobile left: burger + search ── */}
            <div className="flex items-center gap-0.5 lg:hidden">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 text-white"
                aria-label="Menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              <button
                onClick={() => dispatch(openSearch())}
                className="p-2 text-white"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
            </div>

            {/* ── Mobile center logo (absolute) ── */}
            <Link
              to="/"
              className="lg:hidden absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
            >
               <img
                src="/images/Dribble Studio.png"
                alt="DS Dribble Studio"
                className="h-10 w-auto object-contain"
              />
            </Link>

            {/* ── Desktop logo (left aligned) ── */}
            <Link
              to="/"
              className="hidden lg:flex flex-shrink-0 mr-10 items-center gap-2"
              onMouseEnter={() => setActiveMenu(null)}
            >
              <img
                src="/images/Dribble Studio.png"
                alt="DS Dribble Studio"
                className="h-10 w-auto object-contain"
              />
            </Link>

            {/* ── Desktop nav links ── */}
            <ul className="hidden lg:flex items-center gap-1 flex-1">
              {NAV_ITEMS.map((item) => {
                const isOpen = activeMenu === item.label
                return (
                  <li key={item.label}>
                    {item.path ? (
                      <Link
                        to={item.path}
                        onMouseEnter={() => setActiveMenu(null)}
                        className={`block px-3 py-10 text-xs font-semibold tracking-widest transition-colors ${item.accent
                            ? 'text-orange-400 hover:text-orange-300'
                            : isOpen
                              ? 'text-orange-400'
                              : 'text-white hover:text-orange-400'
                          }`}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <button
                        onMouseEnter={() => setActiveMenu(item.label)}
                        className={`flex items-center gap-0.5 px-3 py-10 text-xs font-semibold tracking-widest transition-colors ${isOpen ? 'text-orange-400' : 'text-white hover:text-orange-400'
                          }`}
                      >
                        {item.label}
                        <ChevronDown
                          size={12}
                          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>

            {/* ── Desktop right icons ── */}
            <div className="hidden lg:flex items-center gap-1 ml-auto">
              <button
                onClick={() => dispatch(openSearch())}
                onMouseEnter={() => setActiveMenu(null)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-xs font-semibold tracking-widest transition-colors"
              >
                <Search size={14} /> SEARCH
              </button>
              <Link
                to="/wishlist"
                onMouseEnter={() => setActiveMenu(null)}
                className="relative p-2.5 text-white hover:text-orange-400 transition-colors"
              >
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => dispatch(toggleCart())}
                onMouseEnter={() => setActiveMenu(null)}
                className="relative p-2.5 text-white hover:text-orange-400 transition-colors"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <Link
                to={isAuthenticated ? '/account' : '/auth'}
                onMouseEnter={() => setActiveMenu(null)}
                className="p-2.5 text-white hover:text-orange-400 transition-colors"
              >
                <User size={20} />
              </Link>
            </div>

            {/* ── Mobile right: bag + account ── */}
            <div className="flex items-center gap-0.5 ml-auto lg:hidden">
              <button
                onClick={() => dispatch(toggleCart())}
                className="relative p-2 text-white"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <Link
                to={isAuthenticated ? '/account' : '/auth'}
                className="p-2 text-white"
                aria-label="Account"
              >
                <User size={20} />
              </Link>
            </div>

          </div>

          {/* Mobile dropdown menu */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden border-t border-white/10 overflow-hidden"
              >
                <div className="px-4 py-2">
                  {NAV_ITEMS.map((item) => (
                    <div key={item.label}>
                      {item.path ? (
                        <Link
                          to={item.path}
                          className={`block py-3 border-b border-white/10 text-sm font-semibold tracking-widest ${item.accent ? 'text-orange-400' : 'text-white'
                            }`}
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <>
                          <button
                            onClick={() => setMobileSub(mobileSub === item.label ? null : item.label)}
                            className="flex items-center justify-between w-full py-3 border-b border-white/10 text-white text-sm font-semibold tracking-widest"
                          >
                            {item.label}
                            <ChevronDown
                              size={14}
                              className={`transition-transform ${mobileSub === item.label ? 'rotate-180' : ''}`}
                            />
                          </button>
                          <AnimatePresence>
                            {mobileSub === item.label && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                className="overflow-hidden bg-white/5"
                              >
                                {item.mega.columns.map((col) => (
                                  <div key={col.title} className="px-4 py-2">
                                    <p className="text-orange-400 text-xs font-bold tracking-widest mb-1">
                                      {col.title}
                                    </p>
                                    {col.links.map((link) => (
                                      <Link
                                        key={link.label}
                                        to={link.path}
                                        className="block text-white/80 text-sm py-1 hover:text-orange-400"
                                      >
                                        {link.label}
                                      </Link>
                                    ))}
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Desktop mega menu */}
        <AnimatePresence>
          {activeMenu && activeItem?.mega && (
            <motion.div
              key={activeMenu}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 bg-white shadow-2xl border-t-2 border-orange-500 z-50"
            >
              <div className="max-w-[1400px] mx-auto px-8 py-8 flex gap-12">
                {activeItem.mega.columns.map((col) => (
                  <div key={col.title} className="min-w-[150px]">
                    <h3
                      className={`text-xs font-bold tracking-widest mb-4 pb-2 border-b-2 ${col.highlight ? 'border-orange-500 text-orange-600' : 'border-black'
                        }`}
                    >
                      {col.title}
                    </h3>
                    <ul className="space-y-2.5">
                      {col.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            to={link.path}
                            onClick={() => setActiveMenu(null)}
                            className="text-sm text-gray-700 hover:text-orange-500 hover:translate-x-1 transition-all duration-150 block"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </header>
  )
}
