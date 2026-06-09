import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Lock, CreditCard, CheckCircle, Smartphone, Truck } from 'lucide-react'
import { selectCartTotal } from '../store/slices/cartSlice'
import { clearCart } from '../store/slices/cartSlice'
import api from '../services/api'

const STEPS = ['Cart', 'Delivery', 'Payment', 'Confirm']

const STATE_CITIES = {
  'Andhra Pradesh': ['Visakhapatnam','Vijayawada','Guntur','Nellore','Kurnool','Tirupati','Kakinada','Rajahmundry','Kadapa','Anantapur'],
  'Arunachal Pradesh': ['Itanagar','Naharlagun','Pasighat','Tawang','Ziro'],
  'Assam': ['Guwahati','Silchar','Dibrugarh','Jorhat','Nagaon','Tinsukia','Tezpur','Bongaigaon'],
  'Bihar': ['Patna','Gaya','Bhagalpur','Muzaffarpur','Purnia','Darbhanga','Bihar Sharif','Arrah','Begusarai'],
  'Chhattisgarh': ['Raipur','Bhilai','Bilaspur','Korba','Durg','Rajnandgaon','Jagdalpur'],
  'Goa': ['Panaji','Margao','Vasco da Gama','Mapusa','Ponda'],
  'Gujarat': ['Ahmedabad','Surat','Vadodara','Rajkot','Bhavnagar','Jamnagar','Gandhinagar','Junagadh','Anand','Navsari'],
  'Haryana': ['Faridabad','Gurugram','Panipat','Ambala','Yamunanagar','Rohtak','Hisar','Karnal','Sonipat','Panchkula'],
  'Himachal Pradesh': ['Shimla','Manali','Dharamshala','Solan','Mandi','Palampur','Baddi','Hamirpur'],
  'Jharkhand': ['Ranchi','Jamshedpur','Dhanbad','Bokaro','Deoghar','Hazaribagh','Giridih'],
  'Karnataka': ['Bengaluru','Mysuru','Hubballi','Mangaluru','Belagavi','Kalaburagi','Ballari','Vijayapura','Shivamogga','Tumakuru'],
  'Kerala': ['Thiruvananthapuram','Kochi','Kozhikode','Thrissur','Kollam','Alappuzha','Palakkad','Malappuram','Kannur','Kottayam'],
  'Madhya Pradesh': ['Bhopal','Indore','Jabalpur','Gwalior','Ujjain','Sagar','Dewas','Satna','Ratlam','Rewa'],
  'Maharashtra': ['Mumbai','Pune','Nagpur','Thane','Nashik','Aurangabad','Solapur','Kolhapur','Amravati','Navi Mumbai'],
  'Manipur': ['Imphal','Thoubal','Bishnupur','Churachandpur'],
  'Meghalaya': ['Shillong','Tura','Nongstoin'],
  'Mizoram': ['Aizawl','Lunglei','Champhai'],
  'Nagaland': ['Kohima','Dimapur','Mokokchung'],
  'Odisha': ['Bhubaneswar','Cuttack','Rourkela','Brahmapur','Sambalpur','Puri','Balasore','Bhadrak','Baripada'],
  'Punjab': ['Ludhiana','Amritsar','Jalandhar','Patiala','Bathinda','Mohali','Pathankot','Hoshiarpur','Batala'],
  'Rajasthan': ['Jaipur','Jodhpur','Kota','Bikaner','Ajmer','Udaipur','Bhilwara','Alwar','Sikar','Sri Ganganagar'],
  'Sikkim': ['Gangtok','Namchi','Gyalshing','Mangan'],
  'Tamil Nadu': ['Chennai','Coimbatore','Madurai','Tiruchirappalli','Salem','Tirunelveli','Tiruppur','Vellore','Erode','Thoothukkudi'],
  'Telangana': ['Hyderabad','Warangal','Nizamabad','Khammam','Karimnagar','Ramagundam','Mahbubnagar','Nalgonda'],
  'Tripura': ['Agartala','Dharmanagar','Udaipur','Kailasahar'],
  'Uttar Pradesh': ['Lucknow','Kanpur','Agra','Varanasi','Prayagraj','Meerut','Noida','Ghaziabad','Bareilly','Aligarh','Moradabad','Gorakhpur'],
  'Uttarakhand': ['Dehradun','Haridwar','Roorkee','Haldwani','Rishikesh','Nainital','Mussoorie'],
  'West Bengal': ['Kolkata','Asansol','Siliguri','Durgapur','Bardhaman','Malda','Baharampur','Habra','Kharagpur'],
  'Delhi': ['New Delhi','Dwarka','Rohini','Janakpuri','Laxmi Nagar','Saket','Pitampura','Mayur Vihar'],
  'Jammu & Kashmir': ['Srinagar','Jammu','Anantnag','Baramulla','Sopore','Kathua'],
  'Ladakh': ['Leh','Kargil'],
  'Chandigarh': ['Chandigarh'],
  'Dadra & Nagar Haveli and Daman & Diu': ['Silvassa','Daman','Diu'],
  'Lakshadweep': ['Kavaratti'],
  'Puducherry': ['Puducherry','Karaikal','Mahe','Yanam'],
  'Andaman & Nicobar Islands': ['Port Blair'],
}

const STATES = Object.keys(STATE_CITIES).sort()

function SelectField({ label, value, onChange, options, placeholder, disabled }) {
  return (
    <div>
      <label className="block text-xs font-black tracking-widest mb-1.5">{label}</label>
      <select
        value={value}
        onChange={onChange}
        required
        disabled={disabled}
        className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-400"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function StepIndicator({ step }) {
  return (
    <div className="flex items-center gap-1 mb-8 overflow-x-auto scrollbar-hide">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div className={`flex items-center justify-center w-6 h-6 text-[10px] font-black rounded-full flex-shrink-0 ${
            i < step ? 'bg-orange-500 text-white' : i === step ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
          }`}>
            {i < step ? '✓' : i + 1}
          </div>
          <span className={`text-[10px] font-bold tracking-widest hidden sm:block ${i === step ? 'text-black' : 'text-gray-300'}`}>
            {s.toUpperCase()}
          </span>
          {i < STEPS.length - 1 && <ChevronRight size={12} className="text-gray-200 flex-shrink-0 ml-1" />}
        </div>
      ))}
    </div>
  )
}

function InputField({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs font-black tracking-widest mb-1.5">{label}</label>
      <input
        {...props}
        className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
      />
    </div>
  )
}

export default function Checkout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items } = useSelector((s) => s.cart)
  const { isAuthenticated, user } = useSelector((s) => s.auth)
  const total = useSelector(selectCartTotal)
  const [step, setStep]           = useState(1)
  const [loading, setLoading]     = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderId, setOrderId]     = useState(null)
  const [payMethod, setPayMethod] = useState('cod')

  const shipping   = 99
  const codFee     = payMethod === 'cod' ? 50 : 0
  const gst        = Math.round(total * 0.18)
  const grandTotal = total + shipping + codFee + gst

  const [delivery, setDelivery] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  })

  const handleDeliverySubmit = (e) => {
    e.preventDefault()
    setStep(2)
  }

  const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

  const handleCOD = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/payment/cod-order', {
        delivery,
        items: items.map((i) => ({ product_id: i.product.id, size: i.size, quantity: i.quantity })),
      })
      setOrderId('COD-' + data.order_id)
      dispatch(clearCart())
      setOrderSuccess(true)
    } catch {
      alert('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOnlinePayment = async () => {
    setLoading(true)
    try {
      const loaded = await loadRazorpay()
      if (!loaded) { alert('Failed to load payment gateway. Please try again.'); setLoading(false); return }

      let razorpayOrderId = 'demo_order_' + Date.now()
      try {
        const { data } = await api.post('/payment/create-order', { amount: grandTotal })
        razorpayOrderId = data.order_id
      } catch { /* demo mode */ }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_demo',
        amount: grandTotal * 100,
        currency: 'INR',
        name: 'JerseyShop',
        description: `${items.length} item(s) — Football Jerseys`,
        order_id: razorpayOrderId,
        prefill: { name: delivery.name, email: delivery.email, contact: delivery.phone },
        method: payMethod === 'upi' ? { upi: true } : { card: true, netbanking: true, wallet: true },
        theme: { color: '#000000' },
        handler: async (response) => {
          setLoading(true)
          try {
            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              delivery,
              items: items.map((i) => ({ product_id: i.product.id, size: i.size, quantity: i.quantity })),
            })
          } catch { /* demo mode */ }
          setOrderId(response.razorpay_payment_id || 'DEMO' + Date.now())
          dispatch(clearCart())
          setOrderSuccess(true)
          setLoading(false)
        },
        modal: { ondismiss: () => setLoading(false) },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', () => { alert('Payment failed. Please try again.'); setLoading(false) })
      rzp.open()
    } catch {
      setLoading(false)
    }
  }

  const handlePayment = () => payMethod === 'cod' ? handleCOD() : handleOnlinePayment()

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="font-semibold text-gray-400">Your cart is empty.</p>
        <Link to="/products" className="btn-primary text-xs">SHOP NOW</Link>
      </div>
    )
  }

  if (orderSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center"
      >
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={36} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-black tracking-tight mb-2">ORDER CONFIRMED!</h1>
        <p className="text-gray-400 text-sm mb-2">Thank you, {delivery.name}!</p>
        <p className="text-gray-400 text-sm mb-6">
          Your order <span className="font-bold text-black">#{orderId?.slice(-8).toUpperCase()}</span> has been placed successfully.
        </p>
        <p className="text-xs text-gray-400 mb-8">A confirmation email has been sent to {delivery.email}</p>
        <div className="flex gap-3">
          <Link to="/account" className="btn-outline text-xs">VIEW ORDERS</Link>
          <Link to="/products" className="btn-primary text-xs">CONTINUE SHOPPING</Link>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-10">
      <StepIndicator step={step} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-xs font-black tracking-widest mb-6">DELIVERY DETAILS</h2>
              <form onSubmit={handleDeliverySubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="FULL NAME *" name="name" required value={delivery.name} onChange={(e) => setDelivery((d) => ({ ...d, name: e.target.value }))} placeholder="Enter full name" />
                  <InputField label="EMAIL *" name="email" type="email" required value={delivery.email} onChange={(e) => setDelivery((d) => ({ ...d, email: e.target.value }))} placeholder="Enter email" />
                </div>
                <InputField label="PHONE NUMBER *" name="phone" type="tel" required value={delivery.phone} onChange={(e) => setDelivery((d) => ({ ...d, phone: e.target.value }))} placeholder="10-digit mobile number" />
                <InputField label="ADDRESS LINE *" name="address" required value={delivery.address} onChange={(e) => setDelivery((d) => ({ ...d, address: e.target.value }))} placeholder="Flat, House no., Building, Company, Apartment" />
                <div className="grid grid-cols-3 gap-4">
                  <SelectField
                    label="STATE *"
                    value={delivery.state}
                    onChange={(e) => setDelivery((d) => ({ ...d, state: e.target.value, city: '' }))}
                    options={STATES}
                    placeholder="Select state"
                  />
                  <SelectField
                    label="CITY *"
                    value={delivery.city}
                    onChange={(e) => setDelivery((d) => ({ ...d, city: e.target.value }))}
                    options={delivery.state ? STATE_CITIES[delivery.state] : []}
                    placeholder={delivery.state ? 'Select city' : 'Select state first'}
                    disabled={!delivery.state}
                  />
                  <InputField label="PINCODE *" name="pincode" required value={delivery.pincode} onChange={(e) => setDelivery((d) => ({ ...d, pincode: e.target.value }))} placeholder="6-digit PIN" />
                </div>
                <button type="submit" className="w-full btn-primary text-xs mt-2">
                  CONTINUE TO PAYMENT
                </button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-xs font-black tracking-widest mb-6">SELECT PAYMENT METHOD</h2>

              {/* Payment options */}
              <div className="space-y-3 mb-6">
                {[
                  {
                    id: 'cod',
                    icon: Truck,
                    label: 'Cash on Delivery',
                    desc: 'Pay in cash when your order arrives',
                    badge: null,
                  },
                  {
                    id: 'card',
                    icon: CreditCard,
                    label: 'Credit / Debit Card',
                    desc: 'Visa, Mastercard, RuPay, Amex & more',
                    badge: 'Secure',
                  },
                  {
                    id: 'upi',
                    icon: Smartphone,
                    label: 'UPI',
                    desc: 'GPay, PhonePe, Paytm, BHIM & all UPI apps',
                    badge: 'Instant',
                  },
                ].map(({ id, icon: Icon, label, desc, badge }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPayMethod(id)}
                    className={`w-full flex items-center gap-4 p-4 border-2 transition-all text-left ${
                      payMethod === id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Radio dot */}
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      payMethod === id ? 'border-black' : 'border-gray-300'
                    }`}>
                      {payMethod === id && <div className="w-2 h-2 rounded-full bg-black" />}
                    </div>
                    <div className={`w-10 h-10 flex items-center justify-center rounded flex-shrink-0 ${
                      payMethod === id ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black">{label}</p>
                        {badge && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                            {badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* COD note */}
              {payMethod === 'cod' && (
                <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 px-4 py-3 text-xs text-yellow-700 mb-6 rounded">
                  <Truck size={14} className="flex-shrink-0 mt-0.5" />
                  <span>Cash on Delivery is available. Please keep exact change ready at the time of delivery.</span>
                </div>
              )}

              {/* SSL note for online payments */}
              {payMethod !== 'cod' && (
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                  <Lock size={12} className="text-green-500 flex-shrink-0" />
                  <span>256-bit SSL encrypted & secured by Razorpay</span>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-outline text-xs flex-1">
                  ← BACK
                </button>
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="btn-primary text-xs flex-1"
                >
                  {loading
                    ? 'PROCESSING...'
                    : payMethod === 'cod'
                    ? 'PLACE ORDER'
                    : `PAY ₹${grandTotal.toLocaleString('en-IN')}`}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 sticky top-24">
            <h2 className="text-xs font-black tracking-widest mb-4">ORDER SUMMARY</h2>
            <ul className="space-y-3 mb-5 divide-y">
              {items.map((item) => (
                <li key={item.key} className="flex gap-3 pt-3 first:pt-0">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-14 h-18 object-cover bg-gray-100"
                    style={{ height: 72 }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold line-clamp-2">{item.product.name}</p>
                    <p className="text-[10px] text-gray-400">Size: {item.size} · Qty: {item.quantity}</p>
                    <p className="text-xs font-black mt-1">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span>₹{shipping}</span>
              </div>
              {codFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">COD Fee</span>
                  <span>₹{codFee}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">GST (18%)</span>
                <span>₹{gst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-black text-base pt-2 border-t">
                <span>TOTAL</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
