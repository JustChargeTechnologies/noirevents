import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useSpring, useMotionValue } from 'framer-motion'
import Lenis from 'lenis'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Ticket, 
  Camera, 
  Phone, 
  Instagram, 
  Facebook,
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  Music,
  Users,
  Sparkles,
} from 'lucide-react'

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  extra?: string;
}

const pricingData: PricingPlan[] = [
  { id: 'male-stag', name: 'Male Stag', price: 999, description: 'Single entry for male', extra: 'Unlimited Snacks' },
  { id: 'female-stag', name: 'Female Stag', price: 1000, description: 'Single entry for female', extra: 'Unlimited Snacks' },
  { id: 'couple', name: 'Couple', price: 1499, description: 'Entry for one couple' },
  { id: 'standing-table', name: 'Standing Table', price: 10000, description: '₹8000 to ₹10000 Redeemable' },
  { id: 'vip', name: 'VIP Table', price: 14999, description: '₹12000 Redeemable' },
]

const App = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    entryType: 'male-stag',
    phone: '',
    screenshot: null as File | null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isQrZoomed, setIsQrZoomed] = useState(false)
  const [isHoveringLink, setIsHoveringLink] = useState(false)
  const [successName, setSuccessName] = useState('')

  const bookingRef = useRef<HTMLDivElement>(null)
  
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const springConfig = { damping: 25, stiffness: 200 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      lenis.destroy()
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [cursorX, cursorY])

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  const scrollToBooking = () => {
    if (bookingRef.current) {
      bookingRef.current.scrollIntoView({ behavior: 'smooth' })
      bookingRef.current.focus({ preventScroll: true })
    }
    setMobileMenuOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, screenshot: e.target.files![0] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const formDataObj = new FormData(e.currentTarget)
      
      // Form data automatically includes all fields from the form

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/book`, {
        method: 'POST',
        body: formDataObj,
      })

      const result = await response.json()

      if (result.success) {
        setSuccessName(formData.name)
        setIsSuccess(true)
        setFormData({ name: '', age: '', gender: 'male', entryType: 'male-stag', phone: '', screenshot: null })
      } else {
        alert("Error: " + result.message)
      }

    } catch (error) {
      console.error('Submission error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedPricing = pricingData.find(p => p.id === formData.entryType)

  return (
    <div className="min-h-screen font-sans selection:bg-brand-pink selection:text-white bg-black text-white overflow-x-hidden cursor-none">
      {/* Custom Cursor */}
      <motion.div 
        className="fixed top-0 left-0 w-8 h-8 bg-white mix-blend-difference rounded-full pointer-events-none z-[100] hidden md:block"
        style={{ x: cursorXSpring, y: cursorYSpring, translateX: '-50%', translateY: '-50%', scale: isHoveringLink ? 2.5 : 1 }}
      />
      <motion.div 
        className="fixed top-0 left-0 w-2 h-2 bg-brand-pink rounded-full pointer-events-none z-[100] hidden md:block"
        style={{ x: cursorX, y: cursorY, translateX: '-50%', translateY: '-50%' }}
      />

      {/* Scroll Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-brand-pink z-[60] origin-left" style={{ scaleX }} />
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a 
            href="#home"
            className="text-2xl font-black tracking-tighter cursor-pointer"
            onMouseEnter={() => setIsHoveringLink(true)}
            onMouseLeave={() => setIsHoveringLink(false)}
          >
            NOIR <span className="text-brand-pink">EVENTS</span>
          </a>
          
          <div className="hidden md:flex items-center gap-8">
            {['About', 'Pricing', 'Contact'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="text-sm font-medium text-white/70 hover:text-white transition-colors"
                onMouseEnter={() => setIsHoveringLink(true)}
                onMouseLeave={() => setIsHoveringLink(false)}
              >{item}</a>
            ))}
            <button 
              onClick={scrollToBooking} 
              className="bg-brand-pink text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-brand-pink/20"
              onMouseEnter={() => setIsHoveringLink(true)}
              onMouseLeave={() => setIsHoveringLink(false)}
            >Book Passes</button>
          </div>

          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed inset-0 z-40 bg-black pt-24 px-6 md:hidden">
            <div className="flex flex-col gap-6 text-2xl font-bold">
              {['About', 'Pricing', 'Contact'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)}>{item}</a>
              ))}
              <button onClick={scrollToBooking} className="bg-brand-pink text-white py-4 rounded-xl text-lg font-bold">Book Passes</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* Hero Section */}
        <section id="home" className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/home bg.avif" 
              alt="Holi Event Background" 
              className="w-full h-full object-cover opacity-40 grayscale-[0.2]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black" />
            
            {/* Grid Accent */}
            <div className="absolute inset-0 bg-grid-white opacity-20" />
            
            {/* Animated Blobs */}
            <div className="blob w-[500px] h-[500px] bg-brand-pink top-[-100px] left-[-100px] animate-float" style={{ animationDelay: '0s' }} />
            <div className="blob w-[400px] h-[400px] bg-brand-purple bottom-[-50px] right-[-50px] animate-float" style={{ animationDelay: '-5s' }} />
            <div className="blob w-[300px] h-[300px] bg-brand-cyan top-[20%] right-[10%] animate-float opacity-20" style={{ animationDelay: '-10s' }} />
            
            {/* Volumetric Light */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-radial-gradient from-brand-pink/10 to-transparent opacity-50 pointer-events-none" />
          </div>

          <div className="max-w-4xl w-full text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: 0.2 }}
                className="inline-block"
              >
                <h2 className="text-brand-pink font-bold uppercase mb-4 text-sm md:text-xl tracking-[0.4em] drop-shadow-[0_0_15px_rgba(255,0,127,0.5)]">Noir Events Presents</h2>
              </motion.div>
              
              <h1 className="text-5xl md:text-9xl font-black mb-6 tracking-tighter leading-[0.85] uppercase">
                THE BIGGEST <br />
                <span className="text-gradient drop-shadow-[0_0_30px_rgba(157,0,255,0.3)]">HOLI PARTY</span>
              </h1>
              
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.4 }}
                className="text-lg md:text-2xl text-white/50 mb-10 max-w-2xl mx-auto font-medium"
              >
                Experience the ultimate explosion of colors, music, and luxury vibes in the heart of Udhampur.
              </motion.p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-14 relative group">
                {[
                  { icon: Calendar, text: "4th March", color: "text-brand-pink", glow: "group-hover:shadow-brand-pink/20" },
                  { icon: MapPin, text: "Udhampur", color: "text-brand-purple", glow: "group-hover:shadow-brand-purple/20" },
                  { icon: Clock, text: "10 AM Onwards", color: "text-brand-cyan", glow: "group-hover:shadow-brand-cyan/20" }
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i + 0.6 }}
                    className={`flex items-center gap-3 bg-white/[0.03] backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl transition-all duration-500 hover:bg-white/10 hover:border-white/20 hover:scale-105 shadow-xl ${item.glow}`}
                  >
                    <item.icon className={item.color} size={20} />
                    <span className="font-bold text-base md:text-lg tracking-tight">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <button 
                  onClick={scrollToBooking} 
                  onMouseEnter={() => setIsHoveringLink(true)}
                  onMouseLeave={() => setIsHoveringLink(false)}
                  className="group relative bg-white text-black px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto overflow-hidden"
                >
                  <span className="relative z-10">SECURE YOUR PASS</span>
                  <ArrowRight size={24} className="relative z-10 transition-transform group-hover:translate-x-2" />
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-pink to-brand-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-white group-hover:opacity-0 transition-opacity" />
                </button>
              </motion.div>
            </motion.div>
          </div>
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-10 opacity-30 cursor-pointer hidden md:block"
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <ChevronDown size={32} />
          </motion.div>
        </section>

        <section id="about" className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {[
                { 
                  icon: ShieldCheck, 
                  title: "Safe Environment", 
                  desc: "Professional Men & Women bouncers for a secure celebration.",
                  color: "text-brand-pink",
                  bg: "bg-brand-pink/10"
                },
                { 
                  icon: Music, 
                  title: "Elite DJ Lineup", 
                  desc: "The best Bollywood & EDM tracks to keep you dancing.",
                  color: "text-brand-purple",
                  bg: "bg-brand-purple/10"
                },
                { 
                  icon: Sparkles, 
                  title: "Organic Colors", 
                  desc: "Skin-friendly, high-quality organic gulal provided.",
                  color: "text-brand-orange",
                  bg: "bg-brand-orange/10"
                },
                { 
                  icon: Users, 
                  title: "Premium VIP", 
                  desc: "Exclusive zones with dedicated service and comfort.",
                  color: "text-brand-cyan",
                  bg: "bg-brand-cyan/10"
                },
              ].map((feat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-8 rounded-3xl group hover:border-white/20 transition-all"
                >
                  <div className={`${feat.bg} ${feat.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <feat.icon size={28} />
                  </div>
                  <h3 className="text-xl font-black mb-3 italic tracking-tight uppercase">{feat.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter">Pricing Plans</h2>
              <div className="w-24 h-1 bg-brand-pink mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {pricingData.map((plan, idx) => (
                <motion.div 
                  key={plan.id} 
                  initial={{ opacity: 0, y: 20 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  className="ticket-shape p-0 rounded-3xl relative"
                >
                  <div className="p-8 relative">
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-brand-pink/20 p-2 rounded-lg">
                        <Ticket className="text-brand-pink" size={28} />
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[10px] font-black tracking-widest text-brand-pink uppercase mb-1">Pass No.</span>
                        <div className="text-xs font-mono font-bold text-white/50">#NOIR-{idx + 101}-{idx * 7 + 42}</div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-3xl font-black mb-1 uppercase italic tracking-tighter leading-none">{plan.name}</h3>
                      <div className="w-12 h-1 bg-brand-pink/50 rounded-full" />
                    </div>
                    
                    <p className="text-white text-sm mb-6 leading-relaxed h-10 line-clamp-2">{plan.description}</p>
                    
                    <div className="flex items-end gap-1 mb-2">
                      <span className="text-4xl font-black italic tracking-tighter">₹{plan.price.toLocaleString()}</span>
                      <span className="text-xs font-bold text-white mb-1">/ ENTRY</span>
                    </div>
                    
                    {plan.extra && (
                      <div className="inline-flex items-center gap-1.5 bg-brand-cyan/10 px-3 py-1 rounded-full border border-brand-cyan/20 mb-2">
                        <div className="w-1 h-1 bg-brand-cyan rounded-full animate-pulse" />
                        <span className="text-brand-cyan text-[10px] font-black uppercase tracking-wider">{plan.extra}</span>
                      </div>
                    )}
                  </div>

                  <div className="px-5">
                    <div className="perforation" />
                  </div>

                  <div className="p-8 pt-10 bg-white/2 border-t border-white/5 mt-auto relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-black border border-white/10 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-brand-pink rounded-full animate-ping" />
                    </div>
                    <button 
                      onClick={() => { setFormData(prev => ({ ...prev, entryType: plan.id })); scrollToBooking(); }} 
                      onMouseEnter={() => setIsHoveringLink(true)}
                      onMouseLeave={() => setIsHoveringLink(false)}
                      className="w-full py-4 rounded-xl bg-white text-black hover:bg-brand-pink hover:text-white transition-all duration-500 font-black text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-2 group relative overflow-hidden"
                    >
                      <span className="relative z-10">CLAIM TICKET</span>
                      <ArrowRight size={16} className="relative z-10 transition-transform duration-500 group-hover:translate-x-1" />
                      <div className="absolute inset-0 bg-linear-to-r from-brand-pink to-brand-purple opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </button>
                  </div>
                  
                  {/* Side Stub Indicator */}
                  <div className="absolute left-[-24px] top-1/2 -translate-y-1/2 -rotate-90 hidden xl:flex items-center gap-4 pointer-events-none opacity-20 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] font-black tracking-[0.5em] text-white uppercase whitespace-nowrap">NOIR HOLI FESTIVAL 2026</span>
                    <div className="w-24 h-px bg-white/20" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Booking Form Section */}
        <section id="booking" ref={bookingRef} tabIndex={-1} className="py-24 px-6 bg-black relative outline-none">
          <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="relative">
              <div className="sticky top-32">
                <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">Grab Your <br /><span className="text-gradient">Official Passes</span></h2>
                <p className="text-white/50 mb-12 text-lg max-w-md">Complete the form, scan the QR to pay, and upload your proof. Your digital pass will be sent via WhatsApp.</p>
                
                <div className="glass-card p-1 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                  <div className="bg-black/40 backdrop-blur-xl p-10 rounded-[calc(1.5rem-2px)] border border-white/5">
                    <div className="text-center mb-8">
                      <div className="relative inline-block mb-6 cursor-zoom-in" onClick={() => setIsQrZoomed(true)}>
                        <div className="absolute -inset-4 bg-brand-pink/20 blur-2xl rounded-full" />
                        <div className="relative w-56 h-56 mx-auto bg-white p-4 rounded-3xl flex flex-col items-center justify-center shadow-2xl transition-transform hover:scale-105 active:scale-95">
                          <img 
                            src="/qrcode.jpeg" 
                            alt="Payment QR Code" 
                            className="w-full h-full object-contain rounded-2xl"
                          />
                          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full shadow-lg border border-neutral-100 flex items-center gap-1.5 whitespace-nowrap">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-black tracking-widest uppercase font-mono">Verified Merchant</span>
                          </div>
                        </div>
                        <div className="mt-8 text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">Click to Zoom</div>
                      </div>
                      <h3 className="text-2xl font-black italic tracking-tighter mt-2">NOIR_EVENTS_UPI</h3>
                      <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Scan with any UPI App</p>
                    </div>

                    <AnimatePresence>
                      {isQrZoomed && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setIsQrZoomed(false)}
                          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 cursor-zoom-out"
                        >
                          <motion.div 
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                            className="relative max-w-md w-full aspect-square bg-white p-8 rounded-4xl shadow-[0_0_50px_rgba(255,0,127,0.3)]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button 
                              onClick={() => setIsQrZoomed(false)}
                              className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors"
                            >
                              <X size={32} />
                            </button>
                            <img 
                              src="/qrcode.jpeg" 
                              alt="Payment QR Code Zoomed" 
                              className="w-full h-full object-contain"
                            />
                            <div className="text-center mt-6">
                              <p className="text-black font-black text-xl italic tracking-tighter">OFFICIAL PAYMENT QR</p>
                              <p className="text-black/40 text-xs font-bold uppercase tracking-widest mt-1">Noir Events • Udhampur</p>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between p-5 bg-white/5 rounded-2xl border border-white/10">
                        <span className="text-sm font-bold text-white/40 uppercase tracking-widest">Entry Category</span>
                        <span className="font-black italic text-brand-cyan">{selectedPricing?.name}</span>
                      </div>
                      <div className="flex justify-between items-center p-6 bg-brand-pink/10 rounded-2xl border border-brand-pink/30 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-brand-pink/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-sm font-black text-brand-pink uppercase tracking-widest relative z-10">Total Amount</span>
                        <span className="text-brand-pink text-3xl font-black italic tracking-tighter relative z-10">₹{selectedPricing?.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:mt-12">
              {isSuccess ? (
                <div className="glass-card p-12 rounded-4xl text-center border-2 border-brand-pink/30 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-brand-pink/5 opacity-20 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="bg-brand-pink/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                      <Ticket size={40} className="text-brand-pink" />
                    </div>
                    <h3 className="text-4xl font-black mb-2 italic tracking-tighter uppercase">Pass booked!</h3>
                    <p className="text-white/60 mb-8 text-lg">Hey <span className="text-brand-pink font-bold">{successName}</span>,Your Ticket have been booked. </p>
                    
                    <div className="flex flex-col gap-4">
                      <button 
                        onClick={() => setIsSuccess(false)} 
                        className="w-full bg-white text-black py-4 rounded-2xl font-black text-sm tracking-[0.2em] uppercase hover:bg-brand-pink hover:text-white transition-all duration-300"
                      >
                        New Booking
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-white/40">Full Name</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-pink outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-white/40">Age</label>
                      <input required type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-pink outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-white/40">Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-pink outline-none appearance-none">
                        <option value="male" className="bg-neutral-900">Male</option>
                        <option value="female" className="bg-neutral-900">Female</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-white/40">Entry Type</label>
                    <select name="entryType" value={formData.entryType} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-pink outline-none appearance-none font-bold">
                      {pricingData.map(p => <option key={p.id} value={p.id} className="bg-neutral-900">{p.name} - ₹{p.price}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-white/40">WhatsApp Number</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-brand-pink outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-white/40">Payment SS</label>
                    <label className="w-full flex flex-col items-center justify-center bg-white/5 border-2 border-dashed border-white/10 hover:border-brand-pink/50 rounded-2xl py-8 cursor-pointer group">
                      <Camera className="text-white/20 group-hover:text-brand-pink mb-2" />
                      <span className="text-white/40 text-sm">{formData.screenshot ? (formData.screenshot as File).name : 'Upload Screenshot'}</span>
                      <input name="screenshot" required type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    </div>
                  <button disabled={isSubmitting} type="submit" className="w-full bg-brand-pink text-white py-5 rounded-2xl font-black text-xl disabled:opacity-50">{isSubmitting ? 'SENDING...' : 'SUBMIT BOOKING'}</button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <footer id="contact" className="py-24 px-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-3xl font-black mb-6">NOIR EVENTS</h3>
              <p className="text-white/40 leading-relaxed mb-6">The most immersive Holi celebration in Udhampur.</p>
              <div className="flex gap-4">
                {[Instagram, Facebook].map((Icon, i) => <Icon key={i} className="text-white/40 hover:text-brand-pink cursor-pointer transition-colors" size={24} />)}
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-6">Details</h4>
              <ul className="space-y-4 text-white/60">
                <li className="flex items-center gap-3"><Clock className="text-brand-pink" size={18} /> 10:00 AM Onwards</li>
                <li className="flex items-center gap-3"><MapPin className="text-brand-purple" size={18} /> Udhampur Venue</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-6">Contact</h4>
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                <a href="tel:+918888888888" className="flex items-center gap-4 text-xl font-black hover:text-brand-pink transition-colors"><Phone size={20} /> +91 9070044441</a>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center mt-24 pt-8 border-t border-white/5 gap-4">
            <div className="text-white/20 text-sm">© 2026 Noir Events. All Rights Reserved.</div>
            <a 
              href="https://justcharge.in" 
              target="_blank" 
              rel="noopener noreferrer"
              onMouseEnter={() => setIsHoveringLink(true)}
              onMouseLeave={() => setIsHoveringLink(false)}
              className="group flex items-center gap-2 text-white/30 hover:text-white transition-all duration-300 text-sm font-medium"
            >
              <span>Crafted With</span>
              <span className="font-black tracking-tighter text-white group-hover:text-brand-pink transition-colors">JUSTCHARGE.IN</span>
              <div className="w-1.5 h-1.5 bg-brand-pink rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
            </a>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default App