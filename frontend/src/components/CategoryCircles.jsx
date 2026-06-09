import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const CATEGORIES = [
  { label: 'MEN',             path: '/products?gender=men',             img: '/images/Men.png' },
  { label: 'WOMEN',           path: '/products?gender=women',           img: '/images/Women.png' },
  { label: 'CLUB\nJERSEYS',  path: '/products?category=club-jersey',   img: '/images/Clubjerseys.png' },
  { label: 'NATIONAL\nTEAMS',path: '/products?category=national-team', img: '/images/National.png' },
  { label: 'JACKETS',         path: '/products?category=jacket',        img: '/images/Jackets.png' },
  { label: 'KIDS',            path: '/products?gender=kids',            img: '/images/Kids.png' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

function CategoryItem({ cat, size = 'md' }) {
  const dim     = size === 'sm' ? 'w-24 h-24' : 'w-[130px] h-[130px]'
  const textSz  = size === 'sm' ? 'text-[10px]' : 'text-[12px]'

  return (
    <Link to={cat.path} className="group flex flex-col items-center gap-2.5">
      <div className={`${dim} rounded-full relative overflow-hidden border-2 border-orange-400 group-hover:border-orange-500 bg-gray-50 transition-all duration-400 group-hover:scale-105 group-hover:shadow-[0_8px_30px_rgba(249,115,22,0.3)]`}>

        {/* Category image — fades in on hover */}
        <img
          src={cat.img}
          alt={cat.label}
          className="absolute inset-0 w-full h-full object-cover object-top opacity-0 scale-110 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500"
        />

        {/* Dark overlay on image */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Default text — fades out on hover */}
        <span
          className={`absolute inset-0 flex items-center justify-center ${textSz} font-black tracking-widest text-center text-gray-800 whitespace-pre-line px-2 leading-tight transition-all duration-300 group-hover:opacity-0 group-hover:scale-75`}
        >
          {cat.label}
        </span>

        {/* Label on hover image — slides up from bottom */}
        <span
          className={`absolute bottom-0 inset-x-0 flex items-center justify-center pb-3 ${textSz} font-black tracking-widest text-white text-center whitespace-pre-line leading-tight opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 delay-100`}
        >
          {cat.label}
        </span>
      </div>
    </Link>
  )
}

export default function CategoryCircles() {
  return (
    <section className="py-10 border-b border-gray-100">
      <h2 className="text-center text-[10px] font-black tracking-[0.25em] text-gray-400 mb-8 uppercase">
        Make Them Rightfully Yours
      </h2>

      {/* Mobile: horizontal scroll */}
      <div
        className="md:hidden flex gap-6 px-5 overflow-x-auto snap-x snap-mandatory pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {CATEGORIES.map((cat) => (
          <div key={cat.label} className="flex-shrink-0 snap-start">
            <CategoryItem cat={cat} size="sm" />
          </div>
        ))}
      </div>

      {/* Desktop: wrap grid */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="hidden md:flex flex-wrap justify-center gap-8 max-w-5xl mx-auto px-4"
      >
        {CATEGORIES.map((cat) => (
          <motion.div key={cat.label} variants={item}>
            <CategoryItem cat={cat} size="md" />
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
