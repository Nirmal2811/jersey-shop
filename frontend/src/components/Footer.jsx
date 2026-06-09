import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Youtube, Twitter, Instagram, Facebook, ChevronDown } from 'lucide-react'

const SUPPORT_LINKS = [
  ['Contact Us', '/contact'],
  ['FAQs', '/faqs'],
  ['Track Order', '/account'],
  ['Exchange & Return Policy', '/returns'],
  ['Warranty Claims', '/warranty'],
  ['Privacy Policy', '/privacy'],
  ['Terms & Conditions', '/terms'],
  ['Size Guide', '/size-guide'],
  ['Cookie Settings', '/cookies'],
]

const SHOP_LINKS = [
  ['Club Jerseys', '/products?category=club-jersey'],
  ['National Teams', '/products?category=national-team'],
  ['Training Jackets', '/products?category=jacket&type=training'],
  ['Track Jackets', '/products?category=jacket&type=track'],
  ['Kids Jerseys', '/products?gender=kids'],
  ['New Arrivals', '/products?sort=newest'],
  ['Best Sellers', '/products?sort=popular'],
  ['Sale', '/products?sale=true'],
]

const ABOUT_LINKS = [
  ['About Us', '/about'],
  ['Careers', '/careers'],
  ['Press', '/press'],
  ['Sustainability', '/sustainability'],
  ['Store Locator', '/stores'],
  ['Sitemap', '/sitemap'],
  ['Investors', '/investors'],
]

const PAYMENT_ICONS = [
  { label: 'Visa',       bg: '#1A1F71', color: '#fff', text: 'VISA' },
  { label: 'Mastercard', bg: '#EB001B', color: '#fff', text: 'MC' },
  { label: 'UPI',        bg: '#097939', color: '#fff', text: 'UPI' },
  { label: 'RuPay',      bg: '#003366', color: '#fff', text: 'RP' },
  { label: 'Amex',       bg: '#007BC1', color: '#fff', text: 'AMEX' },
]

const MOBILE_SECTIONS = [
  { id: 'support',  title: 'SUPPORT',          links: SUPPORT_LINKS },
  { id: 'about',    title: 'ABOUT',            links: ABOUT_LINKS },
  { id: 'social',   title: 'STAY UP TO DATE',  type: 'social' },
  { id: 'explore',  title: 'EXPLORE',          type: 'explore' },
]

function AccordionSection({ section, isOpen, onToggle }) {
  return (
    <div className="border-b border-white/10">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 px-5 text-left"
      >
        <span className="text-xs font-black tracking-widest text-white">{section.title}</span>
        <ChevronDown
          size={16}
          className={`text-white/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[400px] pb-4' : 'max-h-0'}`}>
        {section.links && (
          <ul className="px-5 space-y-3">
            {section.links.map(([label, href]) => (
              <li key={label}>
                <Link to={href} className="text-gray-400 text-xs hover:text-orange-400 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {section.type === 'social' && (
          <div className="px-5 flex gap-5">
            <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors"><Youtube size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors"><Twitter size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors"><Instagram size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors"><Facebook size={20} /></a>
          </div>
        )}

        {section.type === 'explore' && (
          <div className="px-5 flex gap-3">
            <a href="#" className="border border-white/20 px-5 py-2.5 text-center">
              <span className="text-[10px] font-bold tracking-widest block text-gray-300">APP</span>
              <span className="text-[9px] text-gray-500">Download</span>
            </a>
            <a href="#" className="border border-white/20 px-5 py-2.5 text-center">
              <span className="text-[10px] font-bold tracking-widest block text-gray-300">BLOG</span>
              <span className="text-[9px] text-gray-500">Stories</span>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Footer() {
  const [openSection, setOpenSection] = useState(null)

  const toggle = (id) => setOpenSection((prev) => (prev === id ? null : id))

  return (
    <footer className="bg-[#111111] text-white mt-20">

      {/* ── Mobile footer ── */}
      <div className="md:hidden">
        {/* Accordion sections */}
        <div className="border-t border-white/10">
          {MOBILE_SECTIONS.map((section) => (
            <AccordionSection
              key={section.id}
              section={section}
              isOpen={openSection === section.id}
              onToggle={() => toggle(section.id)}
            />
          ))}
        </div>

        {/* Country selector */}
        <div className="px-5 py-4 border-t border-white/10">
          <button className="w-full flex items-center justify-center gap-2 border border-white/20 py-3 text-xs font-bold tracking-widest text-white">
            <span>🇮🇳</span> INDIA
          </button>
        </div>

        {/* Payment icons */}
        <div className="px-5 pb-4 flex items-center gap-2 flex-wrap">
          {PAYMENT_ICONS.map(({ label, bg, color, text }) => (
            <div
              key={label}
              className="px-2.5 py-1 rounded text-[9px] font-black"
              style={{ backgroundColor: bg, color }}
            >
              {text}
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="px-5 pb-8 pt-2 border-t border-white/10 text-center space-y-1">
          <p className="text-[10px] text-gray-500">
            © JERSEYSHOP INDIA LTD, 2026. ALL RIGHTS RESERVED.
          </p>
          <Link to="/legal" className="text-[10px] text-gray-400 underline hover:text-orange-400 tracking-wide">
            IMPRINT AND LEGAL DATA
          </Link>
        </div>
      </div>

      {/* ── Desktop footer ── */}
      <div className="hidden md:block max-w-[1400px] mx-auto px-6 pt-14 pb-8">
        <div className="grid grid-cols-4 gap-8 mb-12">
          {/* Support */}
          <div>
            <h3 className="text-xs font-bold tracking-widest mb-5 text-white">SUPPORT</h3>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-gray-400 text-xs hover:text-orange-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xs font-bold tracking-widest mb-5 text-white">SHOP</h3>
            <ul className="space-y-2.5">
              {SHOP_LINKS.map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-gray-400 text-xs hover:text-orange-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-xs font-bold tracking-widest mb-5 text-white">ABOUT</h3>
            <ul className="space-y-2.5">
              {ABOUT_LINKS.map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-gray-400 text-xs hover:text-orange-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Stay up to date + Explore */}
          <div>
            <h3 className="text-xs font-bold tracking-widest mb-5 text-white">STAY UP TO DATE</h3>
            <div className="flex gap-3 mb-8">
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors"><Youtube size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors"><Facebook size={20} /></a>
            </div>
            <h3 className="text-xs font-bold tracking-widest mb-4 text-white">EXPLORE</h3>
            <div className="flex gap-3">
              <a href="#" className="border border-white/20 hover:border-orange-500 transition-colors p-3 text-center min-w-[70px]">
                <span className="text-[10px] font-bold tracking-widest block text-gray-300">APP</span>
                <span className="text-[9px] text-gray-500">Download</span>
              </a>
              <a href="#" className="border border-white/20 hover:border-orange-500 transition-colors p-3 text-center min-w-[70px]">
                <span className="text-[10px] font-bold tracking-widest block text-gray-300">BLOG</span>
                <span className="text-[9px] text-gray-500">Stories</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {PAYMENT_ICONS.map(({ label, bg, color, text }) => (
              <div key={label} className="px-2 py-1 rounded text-[9px] font-black" style={{ backgroundColor: bg, color }}>
                {text}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border border-white/20 px-4 py-2">
            <span>🇮🇳</span>
            <span className="text-xs font-semibold tracking-widest text-white">INDIA</span>
          </div>
          <p className="text-[11px] text-gray-500 text-center">
            © JERSEYSHOP INDIA LTD, 2026. ALL RIGHTS RESERVED.{' '}
            <Link to="/legal" className="underline hover:text-orange-400">LEGAL</Link>
          </p>
        </div>
      </div>

    </footer>
  )
}
