import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Truck, RefreshCw, Headphones } from 'lucide-react'
import CategoryCircles from '../components/CategoryCircles'
import FeaturedProducts from '../components/FeaturedProducts'
import api from '../services/api'

const TRUST_BADGES = [
  { icon: ShieldCheck, label: '100% AUTHENTIC', sub: 'Official licensed jerseys' },
  { icon: Truck, label: 'FREE SHIPPING', sub: 'On orders above ₹999' },
  { icon: RefreshCw, label: '30-DAY RETURNS', sub: 'Hassle-free exchange' },
  { icon: Headphones, label: '24/7 SUPPORT', sub: 'WhatsApp & email' },
]

const DEFAULTS = [
  {
    slot: 1, type: 'split', badge: '2026/27 SEASON', title: 'MADE FOR CHAMPIONS',
    subtitle: 'Official Club Jerseys · Real Madrid · Barcelona · Man United · Liverpool',
    cta_text: 'SHOP CLUB KITS', cta_link: '/products?category=club-jersey',
    cta_secondary_text: 'NEW ARRIVALS', cta_secondary_link: '/products?sort=newest',
    image1_url: '/images/Club.png', image2_url: '/images/Club2.png',
    bg: '#f5f5f5', text_dark: true, is_active: true,
  },
  {
    slot: 2, type: 'fullwidth', badge: 'FIFA WORLD CUP 2026', title: 'WEAR YOUR PRIDE',
    subtitle: 'Argentina · Brazil · France · Portugal · Germany',
    cta_text: 'SHOP NATIONAL KITS', cta_link: '/products?category=national-team',
    image1_url: '/images/Banner2.png', is_active: true,
  },
  {
    slot: 3, type: 'threepanel', badge: 'TRAINING COLLECTION', title: 'TRAIN LIKE A PRO',
    subtitle: 'Club & National Team Training Jackets',
    cta_text: 'SHOP NOW', cta_link: '/products?category=jacket',
    image1_url: '/images/Banner3.1.png', image2_url: '/images/Banner3.2.2.png',
    image3_url: '/images/Banner3.3.png', is_active: true,
  },
]

/* ── Shared mobile text block ── */
function MobileTextBlock({ b }) {
  return (
    <div className="bg-white px-5 pt-7 pb-8 text-center">
      <h2 className="text-[1.85rem] font-black tracking-tight leading-tight mb-3 text-black">{b.title}</h2>
      <p className="text-[11px] text-gray-500 tracking-wide mb-6 leading-relaxed">{b.subtitle}</p>
      <Link
        to={b.cta_link}
        className="inline-block bg-black text-white text-[11px] font-black tracking-[0.2em] px-12 py-3.5"
      >
        {b.cta_text}
      </Link>
    </div>
  )
}

/* ── Banner 1: Split — left image | center text | right image ── */
function BannerSplit({ b }) {
  return (
    <section className="w-full overflow-hidden" style={{ backgroundColor: b.bg || '#f5f5f5' }}>
      {/* Mobile */}
      <div className="md:hidden bg-white px-3 pt-3">
        <div className="flex gap-3" style={{ height: '62vw' }}>
          <div className="flex-1 overflow-hidden">
            <img src={b.image1_url} alt="" className="w-full h-full object-cover object-top" />
          </div>
          <div className="flex-1 overflow-hidden">
            <img src={b.image2_url || b.image1_url} alt="" className="w-full h-full object-cover object-top" />
          </div>
        </div>
        <MobileTextBlock b={b} />
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-stretch min-h-[480px]">
        <div className="w-[30%] relative overflow-hidden flex-shrink-0">
          <img src={b.image1_url} alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-14 z-10 relative">
          {b.badge && (
            <p className={`text-[11px] font-black tracking-[0.2em] mb-3 uppercase ${b.text_dark ? 'text-gray-400' : 'text-white/60'}`}>
              {b.badge}
            </p>
          )}
          <h2 className={`font-black text-6xl tracking-tight leading-none mb-3 ${b.text_dark ? 'text-black' : 'text-white'}`}>
            {b.title}
          </h2>
          <p className={`text-sm mb-8 ${b.text_dark ? 'text-gray-500' : 'text-white/70'}`}>{b.subtitle}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to={b.cta_link}
              className={`text-xs font-black tracking-widest px-8 py-3.5 border-2 transition-all duration-300
                ${b.text_dark ? 'border-black text-black hover:bg-black hover:text-white' : 'bg-white text-black border-white hover:bg-orange-500 hover:border-orange-500 hover:text-white'}`}>
              {b.cta_text}
            </Link>
            {b.cta_secondary_text && (
              <Link to={b.cta_secondary_link}
                className={`text-xs font-black tracking-widest px-8 py-3.5 border-2 transition-all duration-300
                  ${b.text_dark ? 'border-gray-300 text-gray-600 hover:border-black hover:text-black' : 'border-white/40 text-white hover:border-white'}`}>
                {b.cta_secondary_text}
              </Link>
            )}
          </div>
        </div>
        <div className="w-[30%] relative overflow-hidden flex-shrink-0">
          <img src={b.image2_url} alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
        </div>
      </div>
    </section>
  )
}

/* ── Banner 2: Full-width image, text overlay bottom-left ── */
function BannerFullWidth({ b }) {
  return (
    <section className="w-full overflow-hidden bg-gray-100">
      {/* Mobile */}
      <div className="md:hidden">
        <div className="h-[260px] overflow-hidden">
          <img src={b.image1_url} alt={b.title} className="w-full h-full object-cover object-top" />
        </div>
        <MobileTextBlock b={b} />
      </div>

      {/* Desktop */}
      <div className="hidden md:block relative" style={{ minHeight: 480 }}>
        <img src={b.image1_url} alt={b.title} className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="relative z-10 flex flex-col justify-center h-full min-h-[480px] px-10 max-w-lg">
          {b.badge && (
            <p className="text-[11px] font-black tracking-[0.2em] text-gray-600 mb-2 uppercase">{b.badge}</p>
          )}
          <h2 className="font-black text-5xl tracking-tight leading-tight text-black mb-2">{b.title}</h2>
          <p className="text-gray-700 text-sm mb-6">{b.subtitle}</p>
          <Link to={b.cta_link}
            className="inline-block bg-black text-white text-xs font-black tracking-widest px-7 py-3.5 hover:bg-orange-500 transition-colors w-fit">
            {b.cta_text}
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── Banner 3: Three equal image panels, text on right ── */
function BannerThreePanel({ b }) {
  return (
    <section className="w-full overflow-hidden">
      {/* Mobile */}
      <div className="md:hidden">
        {/* Mosaic: 1 tall image left + 2 stacked images right */}
        <div className="flex gap-[3px] bg-white px-3 pt-3" style={{ height: '82vw' }}>
          <div className="flex-[1.1] overflow-hidden">
            <img src={b.image1_url} alt="" className="w-full h-full object-cover object-top" />
          </div>
          <div className="flex-1 flex flex-col gap-[3px]">
            <div className="flex-1 overflow-hidden">
              <img src={b.image2_url} alt="" className="w-full h-full object-cover object-top" />
            </div>
            <div className="flex-1 overflow-hidden">
              <img src={b.image3_url} alt="" className="w-full h-full object-cover object-top" />
            </div>
          </div>
        </div>
        {/* Dark text section */}
        <div className="bg-black px-5 py-8 text-center">
          <h2 className="text-[1.85rem] font-black tracking-tight text-white leading-tight mb-2">{b.title}</h2>
          <p className="text-[11px] text-white/60 tracking-wide mb-6 leading-relaxed">{b.subtitle}</p>
          <Link
            to={b.cta_link}
            className="inline-block border-2 border-white text-white text-[11px] font-black tracking-[0.2em] px-10 py-3 hover:bg-white hover:text-black transition-colors"
          >
            {b.cta_text}
          </Link>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex h-[480px]">
        <div className="w-1/3 overflow-hidden">
          <img src={b.image1_url} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="w-1/3 overflow-hidden">
          <img src={b.image2_url} alt="" className="w-full h-full object-fill" />
        </div>
        <div className="w-1/3 relative overflow-hidden flex flex-col justify-end">
          <img src={b.image3_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="relative z-10 p-8 text-right">
            {b.badge && <p className="text-[10px] font-black tracking-widest text-white/60 mb-2 uppercase">{b.badge}</p>}
            <h3 className="font-black text-3xl text-white leading-tight mb-1">{b.title}</h3>
            <p className="text-white/70 text-xs mb-5">{b.subtitle}</p>
            <Link to={b.cta_link}
              className="inline-block border-2 border-white text-white text-xs font-black tracking-widest px-6 py-2.5 hover:bg-white hover:text-black transition-colors ml-auto">
              {b.cta_text}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function BannerRenderer({ b }) {
  if (!b || !b.is_active) return null
  if (b.type === 'split')      return <BannerSplit b={b} />
  if (b.type === 'fullwidth')  return <BannerFullWidth b={b} />
  if (b.type === 'threepanel') return <BannerThreePanel b={b} />
  return null
}

export default function Home() {
  const [banners, setBanners] = useState(DEFAULTS)

  useEffect(() => {
    api.get('/home-banners')
      .then(({ data }) => { if (data.length > 0) setBanners(data) })
      .catch(() => {})
  }, [])

  const b = (slot) => banners.find((x) => x.slot === slot) || DEFAULTS.find((x) => x.slot === slot)

  return (
    <main>
      <CategoryCircles />

      <BannerRenderer b={b(1)} />
      <div className="h-16 bg-white" />
      <BannerRenderer b={b(2)} />
      <div className="h-16 bg-white" />
      <BannerRenderer b={b(3)} />

      <FeaturedProducts title="NEW ARRIVALS" subtitle="Fresh kits from top clubs & nations" flag="is_new" link="/products?sort=newest" />

      <section className="bg-black py-10">
        <div className="max-w-[1400px] mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center gap-2"
            >
              <Icon size={28} className="text-orange-500" />
              <p className="text-white text-xs font-black tracking-widest">{label}</p>
              <p className="text-white/50 text-xs">{sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <FeaturedProducts
        title="BESTSELLERS"
        subtitle="The jerseys everyone's wearing"
        flag="is_bestseller"
        link="/products?sort=popular"
      />

      <section className="relative bg-black overflow-hidden py-20 my-2">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1400&auto=format&fit=crop"
            alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 text-center px-4">
          <p className="text-orange-400 text-xs font-black tracking-widest mb-3">LIMITED TIME OFFER</p>
          <h2 className="text-white font-black text-4xl md:text-6xl tracking-tight mb-4">EXTRA 10% OFF</h2>
          <p className="text-white/70 text-lg mb-8">
            Use code <span className="text-orange-400 font-black">JERSEY10</span> at checkout
          </p>
          <Link to="/products?sale=true"
            className="inline-block bg-orange-500 text-white font-black text-xs tracking-widest px-10 py-4 hover:bg-orange-600 transition-colors">
            SHOP SALE
          </Link>
        </div>
      </section>

      <FeaturedProducts
        title="TRAINING JACKETS"
        subtitle="Train like a pro"
        category="jacket"
        link="/products?category=jacket"
      />
    </main>
  )
}
