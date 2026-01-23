import React, { useState, useRef, useEffect } from 'react';
import {
  motion, useScroll, useTransform, useSpring, useMotionValue,
  useVelocity, useAnimationFrame, AnimatePresence
} from 'framer-motion';
import {
  ArrowRight, Github, Linkedin, Mail,
  Code2, Cpu, Globe, Smartphone, Layers,
  Terminal, Database, Wifi, GraduationCap, Award, BookOpen, Calendar,
  Lock, User, Send, LogOut, Radio, MapPin, Zap,
  Music, Brain, Rocket, Search, Coffee, Laptop, Gamepad2, Quote, Sparkles, FileText, CheckCircle
} from 'lucide-react';

// --- FIREBASE INTEGRATION ---
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, signOut, onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, limit, serverTimestamp } from "firebase/firestore";

// ✅ FIREBASE CONFIGURATION (CONFIGURED)
const firebaseConfig = {
  apiKey: "AIzaSyCzdEkumTNyfZMZgFUYAJVZ4LOZVNAQLw8",
  authDomain: "portfolio-maulana.firebaseapp.com",
  projectId: "portfolio-maulana",
  storageBucket: "portfolio-maulana.firebasestorage.app",
  messagingSenderId: "475182837947",
  appId: "1:475182837947:web:0a33c0b41cc5d259f1f99e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

// --- GEMINI API HELPER ---
const callGemini = async (prompt, systemContext = "") => {
  const apiKey = "AIzaSyCrrg0D5ek-Eh_-WqaEQRoU6ADhhLNyJbs";
  if (!apiKey) {
    console.warn("Gemini API Key tidak ditemukan.");
    return "Mode Demo: Hubungkan API Key untuk respons AI yang sebenarnya.";
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemContext }] }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "System Offline. Re-routing...";
  } catch (error) {
    console.error("Neural Net Error:", error);
    return "Connection interrupted. Try again later.";
  }
};

// --- UTILS & DATA ---
const wrap = (min, max, v) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

const PERSONAL_INFO = {
  name: "Maulana Ridwan",
  email: "maulana@example.com",
  github: "https://github.com/maulana-ridwan",
  linkedin: "https://linkedin.com/in/maulana-ridwan",
};

const PROJECTS = [
  { id: 1, title: "EcoSense IoT", cat: "Smart City", img: "./images/projects/ecosense_iot.png", gradient: "from-emerald-900 to-emerald-600", desc: "Monitoring lingkungan real-time.", year: "2024" },
  { id: 2, title: "Campus AR", cat: "Augmented Reality", img: "./images/projects/campus_ar.png", gradient: "from-purple-900 to-indigo-600", desc: "Navigasi spasial interaktif.", year: "2023" },
  { id: 3, title: "Data Viz", cat: "Analytics", img: "./images/projects/data_viz.png", gradient: "from-orange-900 to-red-600", desc: "Visualisasi data kompleks D3.js.", year: "2023" },
  { id: 4, title: "Porto V2", cat: "Immersive Web", img: "./images/projects/porto_v2.png", gradient: "from-blue-900 to-cyan-600", desc: "Eksperimen desain web.", year: "2025" },
  { id: 5, title: "Home Hub", cat: "IoT", img: "./images/projects/home_hub.png", gradient: "from-slate-800 to-slate-500", desc: "Kontrol rumah pintar.", year: "2024" }
];

const ROUTINE = [
  { start: 6, end: 9, title: "System Boot", desc: "Kopi, Code Review, & Update Teknologi.", icon: Coffee, color: "text-orange-400", bg: "bg-orange-500/10", cpu: "45%" },
  { start: 9, end: 17, title: "Core Processing", desc: "Kuliah, Lab Riset, & Project Development.", icon: Laptop, color: "text-blue-400", bg: "bg-blue-500/10", cpu: "98%" },
  { start: 17, end: 21, title: "Skill Augmentation", desc: "Eksplorasi Tech Stack baru (Three.js/AI).", icon: Brain, color: "text-purple-400", bg: "bg-purple-500/10", cpu: "85%" },
  { start: 21, end: 24, title: "Defragmentation", desc: "Gaming, Music, & Rest Mode.", icon: Gamepad2, color: "text-emerald-400", bg: "bg-emerald-500/10", cpu: "20%" },
];

const EDUCATION = [
  { id: 1, institution: "UMM", period: "2022 - Now", degree: "S1 Informatika", desc: "Software Engineering & IoT.", icon: GraduationCap, color: "text-purple-400", borderColor: "border-purple-500" },
  { id: 2, institution: "SMAN 1 Dringu", period: "2019 - 2022", degree: "MIPA", desc: "Best Graduate in Math.", icon: BookOpen, color: "text-blue-400", borderColor: "border-blue-500" },
  { id: 3, institution: "BNSP", period: "2024", degree: "Web Dev", desc: "Certified Competence.", icon: Award, color: "text-emerald-400", borderColor: "border-emerald-500" }
];

const WORKFLOW = [
  { id: 1, title: "Discovery", desc: "Analisis masalah & riset pengguna.", icon: Search, color: "bg-blue-500" },
  { id: 2, title: "Architecture", desc: "Perancangan sistem & database.", icon: Brain, color: "bg-purple-500" },
  { id: 3, title: "Development", desc: "Clean code & rigorous testing.", icon: Code2, color: "bg-emerald-500" },
  { id: 4, title: "Deployment", desc: "CI/CD & optimasi performa.", icon: Rocket, color: "bg-orange-500" }
];

const TESTIMONIALS = [
  { id: 1, name: "Dr. Budi Santoso", role: "Kaprodi Informatika UMM", text: "Maulana memiliki visi teknis yang luar biasa untuk mahasiswa seusianya." },
  { id: 2, name: "Sarah Wijaya", role: "CEO TechStart", text: "Solusi IoT yang dibangun sangat stabil dan mudah digunakan." },
  { id: 3, name: "Rian Ardianto", role: "Senior Dev", text: "Kode yang bersih dan dokumentasi yang sangat rapi. A pleasure to work with." },
  { id: 4, name: "Lab Robotika", role: "Research Team", text: "Kontribusi pada algoritma navigasi sangat krusial bagi tim kami." }
];

// --- CANVAS COMPONENTS ---

const StarfieldCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); let animationFrameId; let stars = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; initStars(); };
    const initStars = () => { stars = Array.from({ length: 300 }, () => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 1.5, speed: Math.random() * 0.2, opacity: Math.random(), fadeSpeed: Math.random() * 0.01 + 0.002 })); };
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2); ctx.fill();
        star.opacity += star.fadeSpeed; if (star.opacity > 1 || star.opacity < 0.2) star.fadeSpeed = -star.fadeSpeed;
        star.y -= star.speed; if (star.y < 0) { star.y = canvas.height; star.x = Math.random() * canvas.width; }
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    window.addEventListener('resize', resize); resize(); animate();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationFrameId); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />;
};

const GlobalParallaxParticles = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 5000], [0, -1000]);
  const y2 = useTransform(scrollY, [0, 5000], [0, -2000]);
  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      <motion.div style={{ y: y1 }} className="absolute top-[20%] left-[10%] w-64 h-64 bg-purple-600/5 rounded-full blur-[100px]" />
      <motion.div style={{ y: y2 }} className="absolute top-[60%] right-[10%] w-96 h-96 bg-cyan-600/5 rounded-full blur-[120px]" />
    </div>
  );
};

// --- AWWWARDS-INSPIRED IMMERSIVE HERO (OPTIMIZED) ---
const RealisticMountainHero = () => {
  const { scrollY } = useScroll();
  const containerRef = useRef(null);

  // Parallax transforms
  const yText = useTransform(scrollY, [0, 500], [0, 200]);
  const textOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const textScale = useTransform(scrollY, [0, 400], [1, 0.9]);
  const bgY = useTransform(scrollY, [0, 800], [0, 300]);
  const overlayOpacity = useTransform(scrollY, [0, 300], [0, 0.5]);

  // Throttled mouse tracking for shapes parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 30 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 30, damping: 30 });

  useEffect(() => {
    let lastTime = 0;
    const throttleMs = 50; // Only update every 50ms

    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastTime < throttleMs) return;
      lastTime = now;

      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set((clientX - innerWidth / 2) / 80);
      mouseY.set((clientY - innerHeight / 2) / 80);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Letter animation for title
  const titleLetters = "MAULANA".split("");
  const subtitleWords = "THE SUMMIT OF CODE".split(" ");

  return (
    <section
      ref={containerRef}
      className="relative h-screen overflow-hidden z-10"
    >
      {/* Premium CSS Styles (Optimized) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        
        .font-display { font-family: 'Syne', sans-serif; }
        .font-body { font-family: 'Space Grotesk', sans-serif; }
        
        @keyframes aurora {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-20px); opacity: 0.5; }
        }
        
        @keyframes floatShape {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        
        .aurora-bg {
          animation: aurora 20s ease-in-out infinite;
          will-change: transform, opacity;
        }
        
        .floating-shape {
          animation: floatShape 10s ease-in-out infinite;
          will-change: transform;
        }
        
        .glow-text {
          text-shadow: 0 0 60px rgba(139, 92, 246, 0.4),
                       0 0 120px rgba(139, 92, 246, 0.2);
        }
        
        .letter-hover {
          transition: transform 0.3s ease, color 0.3s ease;
        }
        
        .letter-hover:hover {
          transform: translateY(-8px) scale(1.05);
          color: #a855f7;
        }
      `}</style>

      {/* Deep Gradient Background */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 bg-[#030014] z-0 will-change-transform"
      >
        {/* Aurora Effect (Optimized - reduced blur) */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="aurora-bg absolute top-[-30%] left-[-20%] w-[120%] h-[120%] rounded-full"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.12) 0%, transparent 50%)',
              filter: 'blur(40px)',
            }}
          />
          <div
            className="aurora-bg absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.08) 0%, transparent 50%)',
              filter: 'blur(50px)',
              animationDelay: '7s',
            }}
          />
        </div>

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}
        />
      </motion.div>

      {/* Floating Geometric Shapes (Optimized) */}
      <motion.div
        style={{ x: smoothMouseX, y: smoothMouseY }}
        className="absolute inset-0 pointer-events-none z-[5] will-change-transform"
      >
        {/* Shape 1 - Hollow Circle */}
        <div
          className="floating-shape absolute top-[15%] left-[10%] w-32 h-32 md:w-40 md:h-40 rounded-full border border-purple-500/20"
        />

        {/* Shape 2 - Filled Circle */}
        <div
          className="floating-shape absolute top-[60%] left-[5%] w-3 h-3 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500"
          style={{ animationDelay: '2s' }}
        />

        {/* Shape 3 - Diamond */}
        <div
          className="floating-shape absolute top-[25%] right-[15%] w-12 h-12 md:w-16 md:h-16 border border-cyan-500/20 rotate-45"
          style={{ animationDelay: '4s' }}
        />

        {/* Shape 4 - Large Ring */}
        <div
          className="floating-shape absolute bottom-[20%] right-[10%] w-48 h-48 md:w-64 md:h-64 rounded-full border border-white/5"
          style={{ animationDelay: '1s' }}
        />

        {/* Shape 5 - Small Circle */}
        <div
          className="floating-shape absolute top-[40%] right-[30%] w-2 h-2 rounded-full bg-purple-400/50"
          style={{ animationDelay: '3s' }}
        />
      </motion.div>

      {/* Scroll Overlay */}
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 bg-black pointer-events-none z-[8]"
      />

      {/* Main Content */}
      <motion.div
        style={{ y: yText, opacity: textOpacity, scale: textScale }}
        className="relative z-40 flex flex-col items-center justify-center min-h-screen px-4 will-change-transform"
      >
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-8 md:mb-12"
        >
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-body text-slate-400 tracking-widest uppercase">
              Available for Projects
            </span>
          </div>
        </motion.div>

        {/* Main Title - Letter by Letter Animation */}
        <div className="relative mb-6">
          <motion.h1
            className="text-[12vw] md:text-[10vw] lg:text-[8vw] font-display font-bold tracking-tighter leading-none text-white glow-text flex"
          >
            {titleLetters.map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.5 + i * 0.08,
                  duration: 0.6,
                  ease: "easeOut"
                }}
                className="letter-hover inline-block cursor-default"
              >
                {letter}
              </motion.span>
            ))}
          </motion.h1>

          {/* Underline Animation */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
            className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent origin-center"
          />
        </div>

        {/* Subtitle - Word by Word */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-12">
          {subtitleWords.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 + i * 0.08, duration: 0.4 }}
              className="text-sm md:text-lg tracking-[0.3em] text-slate-400 font-body uppercase"
            >
              {word}
            </motion.span>
          ))}
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            className="group px-8 py-4 rounded-full bg-white text-black font-medium text-sm hover:scale-105 hover:-translate-y-1 transition-transform duration-300"
          >
            <span className="flex items-center gap-2">
              <span>View Projects</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </button>

          <button
            className="px-8 py-4 rounded-full border border-white/20 text-white font-medium text-sm hover:bg-white/5 hover:scale-105 hover:-translate-y-1 transition-all duration-300"
          >
            Get in Touch
          </button>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.3 }}
          className="absolute bottom-24 left-8 hidden md:flex flex-col gap-4"
        >
          {[Github, Linkedin, Mail].map((Icon, i) => (
            <a
              key={i}
              href="#"
              className="text-white/40 hover:text-white hover:scale-110 hover:translate-x-1 transition-all duration-300"
            >
              <Icon size={18} />
            </a>
          ))}
          <div className="w-px h-16 bg-gradient-to-b from-white/20 to-transparent mx-auto" />
        </motion.div>

        {/* Location */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.3 }}
          className="absolute bottom-24 right-8 hidden md:block"
        >
          <div className="text-right">
            <div className="text-[10px] text-white/40 tracking-widest uppercase mb-1">Based in</div>
            <div className="text-sm text-white/80 font-body">East Java, Indonesia</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3"
      >
        <div className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-2 rounded-full bg-white/60"
          />
        </div>
        <span className="text-[10px] text-white/40 tracking-widest uppercase">Scroll</span>
      </motion.div>
    </section>
  );
};

// --- INTERACTIVE FEATURES ---

const CinematicPreloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [bootText, setBootText] = useState("INITIALIZING...");
  useEffect(() => {
    const texts = ["CALIBRATING SENSORS...", "LOADING TERRAIN...", "SYNCING STARS...", "WELCOME MAULANA"];
    let i = 0;
    const interval = setInterval(() => {
      setProgress(prev => { if (prev >= 100) { clearInterval(interval); setTimeout(onComplete, 800); return 100; } if (prev % 25 === 0 && i < texts.length) { setBootText(texts[i]); i++; } return prev + 1; });
    }, 30);
    return () => clearInterval(interval);
  }, [onComplete]);
  return (
    <motion.div exit={{ y: "-100%" }} transition={{ duration: 0.8, ease: "easeInOut" }} className="fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center font-mono text-purple-500">
      <div className="w-64 mb-4 flex justify-between text-xs"><span>SYSTEM_BOOT</span><span>{progress}%</span></div>
      <div className="w-64 h-1 bg-purple-900 rounded-full overflow-hidden"><motion.div className="h-full bg-purple-400" initial={{ width: 0 }} animate={{ width: `${progress}%` }} /></div>
      <div className="mt-4 text-sm animate-pulse tracking-widest text-white">{bootText}</div>
    </motion.div>
  );
};

const CustomCursor = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovering, setIsHovering] = useState(false);

  // Smooth spring for cursor position - high stiffness for fast response
  const springX = useSpring(mouseX, { stiffness: 1000, damping: 50 });
  const springY = useSpring(mouseY, { stiffness: 1000, damping: 50 });

  useEffect(() => {
    const moveMouse = (e) => {
      mouseX.set(e.clientX - 16);
      mouseY.set(e.clientY - 16);
    };
    window.addEventListener("mousemove", moveMouse, { passive: true });
    const handleMouseOver = (e) => { if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('.interactive')) setIsHovering(true); };
    const handleMouseOut = () => setIsHovering(false);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    return () => {
      window.removeEventListener("mousemove", moveMouse);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full border border-purple-500 pointer-events-none z-[100] mix-blend-difference will-change-transform"
      style={{ x: springX, y: springY }}
      animate={{
        scale: isHovering ? 2.5 : 1,
        backgroundColor: isHovering ? "rgba(168, 85, 247, 0.2)" : "transparent",
        borderColor: isHovering ? "transparent" : "#a855f7"
      }}
      transition={{ type: "spring", stiffness: 800, damping: 35 }}
    ><div className="w-1 h-1 bg-purple-400 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" /></motion.div>
  );
};

const MagneticButton = ({ children, className, onClick }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e; const { height, width, left, top } = ref.current.getBoundingClientRect();
    const x = clientX - (left + width / 2); const y = clientY - (top + height / 2);
    setPosition({ x, y });
  };
  const handleMouseLeave = () => setPosition({ x: 0, y: 0 });
  return (
    <motion.button ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} animate={position} transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }} className={`interactive ${className}`}>
      {children}
    </motion.button>
  );
};

const GlitchText = ({ text }) => (
  <div className="relative group inline-block interactive">
    <span className="relative z-10">{text}</span>
    <span className="absolute top-0 left-0 -z-10 w-full h-full text-purple-500 opacity-0 group-hover:opacity-70 group-hover:translate-x-[2px] transition-all duration-100 animate-pulse">{text}</span>
    <span className="absolute top-0 left-0 -z-10 w-full h-full text-cyan-500 opacity-0 group-hover:opacity-70 group-hover:-translate-x-[2px] transition-all duration-100 delay-75">{text}</span>
  </div>
);

// --- SECTIONS ---

const VelocityText = () => (
  <section className="bg-[#020617] py-20 overflow-hidden relative z-40 border-b border-white/5">
    <ParallaxText baseVelocity={-2}>DESIGN • CODE • DEPLOY • </ParallaxText>
    <ParallaxText baseVelocity={2}>INNOVATE • CREATE • SOLVE • </ParallaxText>
  </section>
);

function ParallaxText({ children, baseVelocity = 100 }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);
  const directionFactor = useRef(1);
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() < 0) { directionFactor.current = -1; } else if (velocityFactor.get() > 0) { directionFactor.current = 1; }
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });
  return (
    <div className="overflow-hidden m-0 whitespace-nowrap flex flex-nowrap">
      <motion.div className="font-bold uppercase text-6xl md:text-9xl text-white/5 font-mono tracking-tighter flex whitespace-nowrap" style={{ x }}>
        {[...Array(4)].map((_, i) => <span key={i} className="block mr-8 interactive hover:text-white/20 transition-colors">{children} </span>)}
      </motion.div>
    </div>
  );
}

// --- PHILOSOPHY (RESTORED) ---
const Philosophy = () => {
  return (
    <section className="bg-[#020617] text-slate-300 py-32 relative z-40 border-b border-white/5">
      <div className="max-w-4xl mx-auto px-6 space-y-40">
        <StickyText>
          Saya percaya bahwa kode bukan sekadar logika...
        </StickyText>
        <StickyText>
          ...tetapi adalah <span className="text-purple-400">kanvas seni</span> di era digital.
        </StickyText>
        <StickyText>
          Dari sirkuit IoT hingga pixel layar, saya merangkai pengalaman.
        </StickyText>
      </div>
    </section>
  );
};

const StickyText = ({ children }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const opacity = useTransform(scrollYProgress, [0.3, 0.5, 0.8], [0, 1, 0]);
  const scale = useTransform(scrollYProgress, [0.3, 0.5, 0.8], [0.8, 1, 0.8]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, scale }}
      className="h-[50vh] flex items-center justify-center text-center"
    >
      <h2 className="text-3xl md:text-6xl font-bold leading-tight tracking-tight">
        {children}
      </h2>
    </motion.div>
  );
};

const HolographicBio = () => (
  <section className="bg-[#020617] relative z-40">
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 h-[50vh] md:h-screen sticky top-0 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm border-r border-white/5 overflow-hidden">
        <div className="relative w-72 h-96 group perspective-1000 interactive">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-2xl border border-white/10 backdrop-blur-md animate-[pulse_4s_infinite]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_2px,transparent_2px)] bg-[size:100%_4px] opacity-20 pointer-events-none"></div>
            <div className="p-8 h-full flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full border-2 border-purple-400 bg-white/5 mb-6 flex items-center justify-center overflow-hidden relative"><User size={40} className="text-purple-300" /><div className="absolute inset-0 bg-gradient-to-t from-purple-500/50 to-transparent opacity-50"></div></div>
              <h3 className="text-2xl font-bold text-white font-mono mb-1"><GlitchText text="MAULANA R." /></h3>
              <p className="text-cyan-400 text-xs tracking-[0.2em] mb-8">ID: 2026-UMM-DEV</p>
              <div className="w-full space-y-3">
                <div className="flex justify-between text-xs text-slate-400 border-b border-white/10 pb-1"><span>CLASS</span><span className="text-white">ENGINEER</span></div>
                <div className="flex justify-between text-xs text-slate-400 border-b border-white/10 pb-1"><span>LEVEL</span><span className="text-white">LVL. 23</span></div>
              </div>
              <div className="mt-auto pt-4"><Cpu size={32} className="text-white/20 animate-spin-slow" /></div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/2">
        <BioChapter title="The Origin" subtitle="PROBOLINGGO, INDONESIA" icon={MapPin} text="Perjalanan saya dimulai di pesisir utara Jawa Timur. Di sinilah logika saya ditempa, mempersiapkan fondasi untuk algoritma yang saya tulis hari ini." />
        <BioChapter title="The Awakening" subtitle="UNIVERSITAS MUHAMMADIYAH MALANG" icon={Zap} text="Malang menjadi kawah candradimuka saya. Di Teknik Informatika UMM, saya tidak hanya belajar coding, tapi belajar memecahkan masalah." />
        <BioChapter title="The Vision" subtitle="FUTURE ARCHITECT" icon={Globe} text="Visi saya adalah menjembatani kesenjangan antara hardware (IoT) dan pengalaman manusia (Web/AR)." />
      </div>
    </div>
  </section>
);

const BioChapter = ({ title, subtitle, text, icon: Icon }) => (
  <div className="min-h-screen flex flex-col justify-center p-12 md:p-24 border-b border-white/5">
    <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
      <div className="w-12 h-12 bg-purple-900/30 rounded-xl flex items-center justify-center mb-6 text-purple-400 border border-purple-500/30"><Icon size={24} /></div>
      <span className="text-cyan-500 font-mono tracking-widest text-sm block mb-2">{subtitle}</span>
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 interactive"><GlitchText text={title} /></h2>
      <p className="text-lg md:text-xl text-slate-400 leading-relaxed font-light">{text}</p>
    </motion.div>
  </div>
);

// --- CODE EVOLUTION (COMPLETE) ---
const CodeEvolution = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const opacityCode = useTransform(scrollYProgress, [0.3, 0.5], [1, 0]);
  const opacityCard = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);
  const scaleCard = useTransform(scrollYProgress, [0.4, 0.6], [0.8, 1]);

  return (
    <section ref={containerRef} className="h-[200vh] bg-[#020617] relative z-40">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden px-6">
        <motion.div style={{ opacity: opacityCode }} className="absolute max-w-2xl w-full p-8 rounded-3xl bg-slate-900 border border-white/10 font-mono text-sm text-slate-400 shadow-2xl">
          <div className="flex gap-2 mb-4"><div className="w-3 h-3 rounded-full bg-red-500" /><div className="w-3 h-3 rounded-full bg-yellow-500" /><div className="w-3 h-3 rounded-full bg-green-500" /></div>
          <pre>
            {`const skillSet = {
  id: "MAULANA",
  role: "Creative Technologist",
  capabilities: [
    "React.js", 
    "Three.js",
    "IoT Systems"
  ],
  status: "READY_TO_DEPLOY"
};

// Transforming data into reality...`}
          </pre>
        </motion.div>
        <motion.div style={{ opacity: opacityCard, scale: scaleCard }} className="absolute max-w-md w-full p-8 rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-2xl text-white text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-6 flex items-center justify-center backdrop-blur-lg"><Zap size={40} className="text-white" /></div>
          <h2 className="text-3xl font-bold mb-2">Ready to Deploy</h2><p className="text-white/80">Turning complex code into beautiful, functional experiences.</p>
        </motion.div>
        <div className="absolute bottom-10 text-slate-500 text-xs font-mono">SCROLL TO COMPILE</div>
      </div>
    </section>
  );
};

const EducationTimeline = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start center", "end center"] });
  return (
    <section ref={containerRef} className="bg-[#020617] py-32 relative overflow-hidden z-40">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20"><h2 className="text-4xl font-bold text-white mb-4">Space Log</h2><p className="text-slate-400">Jejak akademik dan sertifikasi dalam perjalanan ini.</p></div>
        <div className="relative">
          <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-[2px] bg-white/5 md:-translate-x-1/2" />
          <motion.div style={{ scaleY: scrollYProgress }} className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-purple-500 via-blue-500 to-emerald-500 md:-translate-x-1/2 origin-top shadow-[0_0_20px_rgba(147,51,234,0.8)]" />
          <div className="space-y-24">{EDUCATION.map((edu, index) => <TimelineItem key={edu.id} data={edu} index={index} />)}</div>
        </div>
      </div>
    </section>
  );
};

const TimelineItem = ({ data, index }) => {
  const isEven = index % 2 === 0;
  return (
    <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7, delay: index * 0.2 }} className={`flex flex-col md:flex-row gap-8 items-start md:items-center relative ${isEven ? 'md:flex-row-reverse' : ''}`}>
      <div className={`hidden md:block flex-1 ${isEven ? 'text-left' : 'text-right'}`}><div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-purple-300 font-mono text-sm"><Calendar size={14} />{data.period}</div></div>
      <div className="relative z-10 shrink-0"><div className={`w-10 h-10 rounded-full bg-[#020617] border-2 ${data.borderColor} flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] group`}><data.icon size={18} className={`${data.color} group-hover:scale-110 transition-transform`} /></div><div className={`absolute inset-0 rounded-full border ${data.borderColor} animate-ping opacity-20`} /></div>
      <div className="flex-1 w-full md:w-auto">
        <div className="md:hidden mb-4"><span className="text-purple-400 font-mono text-xs border border-purple-500/30 px-2 py-1 rounded">{data.period}</span></div>
        <motion.div whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }} className={`p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:border-white/20 transition-all interactive`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <h3 className="text-xl font-bold text-white mb-1">{data.institution}</h3>
          <div className={`text-sm font-semibold ${data.color} mb-3 uppercase tracking-wider`}>{data.degree}</div>
          <p className="text-slate-400 text-sm leading-relaxed border-l-2 border-white/10 pl-4">{data.desc}</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

const WorkflowReactor = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const yGrid = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const [activeStep, setActiveStep] = useState(null);

  return (
    <section ref={containerRef} className="bg-[#020617] py-32 px-6 relative z-40 overflow-hidden">
      {/* Premium CSS Styles */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
        .bento-card {
          position: relative;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
          backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        .bento-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 1.5rem;
          padding: 1px;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05), rgba(255,255,255,0.02));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .bento-card:hover {
          transform: translateY(-10px) rotateX(5deg) rotateY(-5deg);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5),
                      0 0 0 1px rgba(139, 92, 246, 0.2),
                      0 0 80px -20px rgba(139, 92, 246, 0.3);
        }
        .bento-card:hover::before {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.5), rgba(6, 182, 212, 0.3), rgba(139, 92, 246, 0.2));
        }
        .icon-container {
          position: relative;
          overflow: visible;
        }
        .icon-container::after {
          content: '';
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          background: inherit;
          filter: blur(20px);
          opacity: 0;
          transition: opacity 0.5s ease;
          z-index: -1;
        }
        .bento-card:hover .icon-container::after {
          opacity: 0.5;
        }
        .step-line {
          position: relative;
        }
        .step-line::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 100%;
          width: 1px;
          height: 30px;
          background: linear-gradient(to bottom, rgba(139, 92, 246, 0.3), transparent);
          transform: translateX(-50%);
        }
      `}</style>

      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating Orbs */}
        <div
          className="absolute top-20 right-10 w-64 h-64 rounded-full bg-purple-500/5 blur-3xl"
          style={{ animation: 'orbFloat 15s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-cyan-500/5 blur-3xl"
          style={{ animation: 'orbFloat 12s ease-in-out infinite', animationDelay: '3s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full bg-emerald-500/3 blur-3xl -translate-x-1/2 -translate-y-1/2"
          style={{ animation: 'orbFloat 20s ease-in-out infinite', animationDelay: '5s' }}
        />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header - Premium Design */}
        <div className="flex flex-col lg:flex-row gap-16 items-start lg:items-center mb-16">
          <motion.div
            className="lg:w-2/5"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Label with animated line */}
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: 48 }}
                transition={{ duration: 0.6 }}
                className="h-[1px] bg-gradient-to-r from-emerald-500 to-transparent"
              />
              <span className="text-emerald-400 text-xs font-mono tracking-[0.3em] uppercase">
                Metodologi
              </span>
            </div>

            {/* Title with gradient */}
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">The </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400">
                Reactor
              </span>
              <br />
              <span className="text-white">Core</span>
            </h2>

            <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-md">
              Setiap proyek melewati proses teruji ini—dioptimalkan untuk hasil maksimal dan pengalaman yang luar biasa.
            </p>

            {/* CTA Button with glow */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-medium text-sm overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>EXPLORE PROCESS</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.button>

            {/* Stats */}
            <div className="flex gap-8 mt-12">
              <div>
                <div className="text-3xl font-bold text-white">50+</div>
                <div className="text-xs text-slate-500 font-mono uppercase tracking-wider">Projects</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">98%</div>
                <div className="text-xs text-slate-500 font-mono uppercase tracking-wider">Success Rate</div>
              </div>
            </div>
          </motion.div>

          {/* Bento Grid Cards */}
          <motion.div
            style={{ y: yGrid }}
            className="lg:w-3/5 grid grid-cols-1 sm:grid-cols-2 gap-5"
          >
            {WORKFLOW.map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 40, rotateX: -10 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.15,
                  type: "spring",
                  stiffness: 100
                }}
                onMouseEnter={() => setActiveStep(step.id)}
                onMouseLeave={() => setActiveStep(null)}
                className="bento-card p-8 relative overflow-hidden group interactive cursor-pointer"
              >
                {/* Step Number - Large Watermark */}
                <div className="absolute -top-4 -right-4 text-[100px] font-bold text-white/[0.02] select-none pointer-events-none">
                  0{step.id}
                </div>

                {/* Animated Background Gradient on Hover */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: activeStep === step.id ? 1 : 0 }}
                  className={`absolute inset-0 bg-gradient-to-br ${step.color.replace('bg-', 'from-')}/10 to-transparent pointer-events-none`}
                />

                {/* Icon Container */}
                <div className="relative mb-6">
                  <motion.div
                    className={`icon-container w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center text-white relative z-10`}
                    animate={activeStep === step.id ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    } : {}}
                    transition={{ duration: 0.5 }}
                    style={{
                      boxShadow: activeStep === step.id
                        ? `0 0 30px ${step.color === 'bg-blue-500' ? 'rgba(59, 130, 246, 0.4)'
                          : step.color === 'bg-purple-500' ? 'rgba(139, 92, 246, 0.4)'
                            : step.color === 'bg-emerald-500' ? 'rgba(16, 185, 129, 0.4)'
                              : 'rgba(249, 115, 22, 0.4)'}`
                        : 'none'
                    }}
                  >
                    <step.icon size={24} />
                  </motion.div>

                  {/* Pulse Ring on Hover */}
                  <AnimatePresence>
                    {activeStep === step.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: [0.5, 0], scale: [1, 2] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className={`absolute inset-0 w-14 h-14 rounded-2xl ${step.color} opacity-50`}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Step Number Badge */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-slate-500">
                    STEP 0{step.id}
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  {step.desc}
                </p>

                {/* Progress Line (for connected flow look) */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ delay: i * 0.2, duration: 0.8 }}
                />

                {/* Arrow indicator on hover */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: activeStep === step.id ? 1 : 0, x: activeStep === step.id ? 0 : -10 }}
                  className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60"
                >
                  <ArrowRight size={14} />
                </motion.div>

                {/* Corner decoration */}
                <div className={`absolute top-0 right-0 w-20 h-20 ${step.color} opacity-5 rounded-bl-[60px] transition-all duration-500 group-hover:opacity-20 group-hover:scale-150`} />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom Process Flow Line */}
        <motion.div
          className="mt-16 flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {WORKFLOW.map((step, i) => (
            <React.Fragment key={step.id}>
              <motion.div
                className={`w-3 h-3 rounded-full ${step.color}`}
                whileHover={{ scale: 1.5 }}
                animate={{
                  boxShadow: ['0 0 0 0 rgba(16, 185, 129, 0)', '0 0 0 10px rgba(16, 185, 129, 0)']
                }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
              />
              {i < WORKFLOW.length - 1 && (
                <motion.div
                  className="w-12 md:w-20 h-px bg-gradient-to-r from-white/20 to-white/5"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                />
              )}
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const ProjectArchitect = () => {
  const [idea, setIdea] = useState("");
  const [blueprint, setBlueprint] = useState("");
  const [loading, setLoading] = useState(false);

  const generateBlueprint = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    const systemPrompt = "Anda adalah Senior Solutions Architect. Berdasarkan ide pengguna, buatkan ringkasan teknis singkat: 1. Rekomendasi Tech Stack. 2. Fitur Utama. 3. Tingkat Kesulitan. Format output dalam Markdown sederhana/bullet points. Bahasa Indonesia.";
    const result = await callGemini(`Ide Proyek: ${idea}`, systemPrompt);
    setBlueprint(result);
    setLoading(false);
  };

  return (
    <section className="bg-[#020617] py-32 px-6 relative z-40 border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">The Architect Engine</h2>
          <p className="text-slate-400">Punya ide liar? Biarkan AI saya merancang blueprint teknis awalnya.</p>
        </div>

        <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
          <div className="flex gap-4 mb-6">
            <input
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              type="text"
              placeholder="Cth: Aplikasi AR untuk museum sejarah..."
              className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors"
            />
            <button
              onClick={generateBlueprint}
              disabled={loading || !idea}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <FileText size={18} />}
              Generate
            </button>
          </div>

          <AnimatePresence>
            {blueprint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-black/40 rounded-xl p-6 border border-white/5"
              >
                <div className="flex items-center gap-2 mb-4 text-emerald-400 text-sm font-bold uppercase tracking-wider">
                  <CheckCircle size={16} /> Blueprint Generated
                </div>
                <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-wrap font-mono">
                  {blueprint}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const CyberneticField = () => {
  return (
    <section className="bg-[#020617] py-32 relative overflow-hidden z-40">
      <div className="max-w-6xl mx-auto px-6 mb-12 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">The Neural Grid</h2>
        <p className="text-slate-500">Berinteraksi dengan matriks digital. Coba gerakkan kursor Anda.</p>
      </div>
      <div className="relative w-full h-[500px] bg-slate-900/50 rounded-3xl border border-white/5 overflow-hidden flex flex-wrap justify-center content-center gap-[2px] cursor-none shadow-2xl shadow-purple-900/20">
        {[...Array(140)].map((_, i) => <GridItem key={i} />)}
        <div className="absolute bottom-4 right-4 text-[10px] font-mono text-white/30 pointer-events-none">INTERACTIVE_ZONE_V1.0</div>
      </div>
    </section>
  );
};

const GridItem = () => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="w-10 h-10 md:w-16 md:h-16 bg-slate-800/50 relative interactive" animate={{ backgroundColor: hovered ? "rgba(147, 51, 234, 0.4)" : "rgba(30, 41, 59, 0.5)", scale: hovered ? 0.9 : 1 }} transition={{ duration: 0.2 }}>
      <AnimatePresence>
        {hovered && <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className="absolute inset-1 bg-cyan-400 rounded-sm shadow-[0_0_15px_cyan]" />}
      </AnimatePresence>
    </motion.div>
  );
};

const HorizontalGallery = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const x = useTransform(scrollYProgress, [0, 1], ["5%", "-85%"]);
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <section ref={targetRef} className="relative h-[400vh] bg-[#020617] z-40">
      {/* Optimized CSS Styles - removed heavy animations, using GPU-accelerated transforms */}
      <style>{`
        .project-card {
          perspective: 1000px;
          transform-style: preserve-3d;
          will-change: transform;
        }
        .project-card-inner {
          transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          will-change: transform;
        }
        .project-card:hover .project-card-inner {
          transform: rotateY(-3deg) rotateX(3deg) scale(1.01);
        }
        .animated-border::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 1.5rem;
          background: linear-gradient(90deg, #8b5cf6, #06b6d4, #ec4899, #8b5cf6);
          background-size: 200% 100%;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .project-card:hover .animated-border::before {
          opacity: 1;
        }
        .shimmer-overlay {
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }
        .project-card:hover .shimmer-overlay {
          transform: translateX(100%);
        }
      `}</style>

      <div className="sticky top-0 flex h-screen items-center overflow-hidden will-change-transform">
        {/* Section Header - Premium Design */}
        <div className="absolute top-10 left-10 z-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-[1px] bg-gradient-to-r from-purple-500 to-transparent" />
            <span className="text-purple-400 text-xs font-mono tracking-[0.3em] uppercase">Portfolio</span>
          </div>
          <h2 className="text-white text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Selected <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400">Works</span>
          </h2>
          <p className="text-slate-500 text-sm flex items-center gap-2">
            <span>Scroll to explore</span>
            <span className="text-purple-400 animate-pulse">→</span>
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="absolute bottom-10 left-10 z-20 flex items-center gap-4">
          <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              style={{ scaleX: scrollYProgress }}
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 origin-left will-change-transform"
            />
          </div>
          <span className="text-xs font-mono text-slate-500">
            {PROJECTS.length} Projects
          </span>
        </div>

        {/* Simplified Floating Elements - no blur for better performance */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-purple-500/10 rounded-full opacity-50" />
        <div className="absolute bottom-40 left-1/3 w-40 h-40 bg-cyan-500/10 rounded-full opacity-50" />

        {/* Cards Container */}
        <motion.div style={{ x }} className="flex gap-8 pl-10 md:pl-20 pr-20 pt-20 will-change-transform">
          {PROJECTS.map((project, index) => (
            <div
              key={project.id}
              className="project-card relative shrink-0"
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="animated-border relative h-[65vh] w-[85vw] md:w-[42vw] rounded-3xl overflow-hidden">
                <div className="project-card-inner relative w-full h-full bg-slate-900/90 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10">

                  {/* Project Number - Watermark Style */}
                  <div className="absolute top-6 right-6 z-10">
                    <span className="text-[120px] md:text-[180px] font-bold leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent select-none">
                      0{project.id}
                    </span>
                  </div>


                  {/* Project Image */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={project.img}
                      alt={project.title}
                      className="w-full h-full object-cover opacity-70"
                      loading="lazy"
                    />
                    {/* Gradient Overlay for readability */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent`} />
                    <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-30 mix-blend-overlay`} />
                  </div>

                  {/* Shimmer Effect - CSS only, no JS animation */}
                  <div className="absolute inset-0 shimmer-overlay z-10 pointer-events-none" />

                  {/* Decorative Grid Pattern */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), 
                                       linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                      backgroundSize: '50px 50px'
                    }}
                  />


                  {/* Content Container */}
                  <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between z-20">
                    {/* Top Section - Category & Year */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400" />
                          <span className="text-xs font-mono text-purple-300 tracking-wider uppercase">
                            {project.cat}
                          </span>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                          <span className="text-xs font-mono text-slate-400">{project.year}</span>
                        </div>
                      </div>

                      {/* View Project Button */}
                      <button
                        className="w-12 h-12 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 hover:scale-110 hover:rotate-45 transition-all duration-300 group"
                      >
                        <ArrowRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </button>
                    </div>

                    {/* Bottom Section - Title & Description */}
                    <div className="space-y-4">
                      <h3 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
                        {project.title}
                      </h3>

                      <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                        {project.desc}
                      </p>

                      {/* Tech Stack Pills */}
                      <div className="flex gap-2 pt-4">
                        {['React', 'IoT', 'API'].map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1 text-xs font-mono rounded-full bg-white/5 border border-white/10 text-slate-500"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-purple-500/20 to-transparent pointer-events-none" />

                  {/* Hover Glow Effect - simplified */}
                  {hoveredId === project.id && (
                    <div
                      className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                      style={{
                        boxShadow: 'inset 0 0 80px rgba(139, 92, 246, 0.1)'
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* End Card - CTA */}
          <div className="h-[65vh] w-[40vw] md:w-[30vw] flex flex-col items-center justify-center shrink-0 relative">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full border border-dashed border-purple-500/30 flex items-center justify-center animate-spin-slow">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
              </div>

              <h3 className="text-3xl font-bold text-white">
                More <span className="text-purple-400">Coming</span>
              </h3>
              <p className="text-slate-500 text-sm max-w-xs">
                Exciting projects in progress. Stay tuned for updates.
              </p>

              <button
                className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium text-sm hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:scale-105 transition-all duration-300"
              >
                Get in Touch
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const SkillParallax = () => {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left - width / 2;
    const y = e.clientY - top - height / 2;
    mouseX.set(x); mouseY.set(y);
  };
  return (
    <section ref={containerRef} onMouseMove={handleMouseMove} className="bg-[#020617] py-40 overflow-hidden relative cursor-crosshair perspective-1000 z-40">
      <div className="max-w-6xl mx-auto px-6 text-center mb-32 relative z-10">
        <h2 className="text-4xl font-bold text-white mb-4">Tech Arsenal</h2>
        <p className="text-slate-400">Gerakkan kursor untuk menjelajahi galaksi teknologi saya.</p>
      </div>
      <div className="relative h-[600px] w-full max-w-6xl mx-auto">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]"></div>
        <FloatItem mouseX={smoothX} mouseY={smoothY} depth={0.05} x="10%" y="10%" icon={Code2} label="React" />
        <FloatItem mouseX={smoothX} mouseY={smoothY} depth={-0.08} x="80%" y="20%" icon={Cpu} label="IoT" />
        <FloatItem mouseX={smoothX} mouseY={smoothY} depth={0.1} x="20%" y="60%" icon={Globe} label="Three.js" />
        <FloatItem mouseX={smoothX} mouseY={smoothY} depth={-0.05} x="70%" y="70%" icon={Database} label="PostgreSQL" />
        <FloatItem mouseX={smoothX} mouseY={smoothY} depth={0.02} x="50%" y="40%" icon={Terminal} label="Backend" scale={1.5} main />
        <FloatItem mouseX={smoothX} mouseY={smoothY} depth={-0.1} x="15%" y="30%" icon={Smartphone} label="Mobile" />
        <FloatItem mouseX={smoothX} mouseY={smoothY} depth={0.08} x="85%" y="50%" icon={Layers} label="Figma" />
        <FloatItem mouseX={smoothX} mouseY={smoothY} depth={-0.03} x="40%" y="80%" icon={Wifi} label="ESP32" />
      </div>
    </section>
  );
};

const FloatItem = ({ mouseX, mouseY, depth, x, y, icon: Icon, label, scale = 1, main = false }) => {
  const xMove = useTransform(mouseX, (val) => val * depth);
  const yMove = useTransform(mouseY, (val) => val * depth);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      style={{ left: x, top: y, x: xMove, y: yMove }}
      className="absolute flex flex-col items-center gap-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Electric Card Container */}
      <motion.div
        whileHover={{ scale: 1.8, zIndex: 50 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: scale }}
        transition={{ type: "spring", stiffness: 300 }}
        className="relative p-4 rounded-2xl cursor-pointer interactive"
        style={{
          background: main
            ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.9), rgba(139, 92, 246, 0.95))'
            : 'rgba(255, 255, 255, 0.05)',
          border: main ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Animated Electric Border - Only shows on hover */}
        <AnimatePresence>
          {isHovered && (
            <>
              {/* Electric Border Glow */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0.5, 1, 0.7, 1, 0.5],
                  boxShadow: [
                    '0 0 10px rgba(139, 92, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)',
                    '0 0 25px rgba(139, 92, 246, 0.8), 0 0 50px rgba(59, 130, 246, 0.5), 0 0 75px rgba(6, 182, 212, 0.3)',
                    '0 0 15px rgba(6, 182, 212, 0.6), 0 0 35px rgba(139, 92, 246, 0.4)',
                    '0 0 30px rgba(139, 92, 246, 0.9), 0 0 60px rgba(59, 130, 246, 0.6), 0 0 90px rgba(168, 85, 247, 0.4)',
                    '0 0 10px rgba(139, 92, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)',
                  ]
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-[-3px] rounded-2xl z-[-1]"
                style={{
                  background: 'linear-gradient(90deg, #8b5cf6, #3b82f6, #06b6d4, #8b5cf6)',
                  backgroundSize: '300% 100%',
                }}
              />

              {/* Animated Gradient Border */}
              <motion.div
                initial={{ opacity: 0, backgroundPosition: '0% 50%' }}
                animate={{
                  opacity: 1,
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-2px] rounded-2xl z-[-1]"
                style={{
                  background: 'linear-gradient(90deg, #8b5cf6, #3b82f6, #06b6d4, #ec4899, #8b5cf6)',
                  backgroundSize: '300% 100%',
                }}
              />

              {/* Inner Background */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-2xl z-0"
                style={{
                  background: main
                    ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.95), rgba(139, 92, 246, 0.98))'
                    : 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
                }}
              />

              {/* Lightning Sparks */}
              <motion.span
                initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
                animate={{
                  opacity: [0, 1, 0.5, 1, 0],
                  scale: [0.8, 1.3, 1, 1.2, 0.8],
                  rotate: [0, 10, -5, 8, 0]
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="absolute -top-2 -right-2 text-sm z-10"
              >
                ⚡
              </motion.span>

              <motion.span
                initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
                animate={{
                  opacity: [0, 1, 0.3, 1, 0],
                  scale: [0.8, 1.2, 0.9, 1.3, 0.8],
                  rotate: [0, -8, 5, -10, 0]
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                className="absolute -bottom-2 -left-2 text-sm z-10"
              >
                ⚡
              </motion.span>

              {/* Electric Arc Effect */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: [0, 0.8, 0.4, 0.9, 0],
                  scale: [0.9, 1.1, 1, 1.15, 0.9]
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="absolute inset-[-1px] rounded-2xl border-2 border-cyan-400/60 z-10"
              />
            </>
          )}
        </AnimatePresence>

        {/* Icon */}
        <motion.div
          className="relative z-20"
          animate={isHovered ? {
            filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1.2)', 'brightness(1.4)', 'brightness(1)'],
            textShadow: [
              '0 0 0px rgba(255,255,255,0)',
              '0 0 20px rgba(139, 92, 246, 0.8)',
              '0 0 10px rgba(59, 130, 246, 0.5)',
              '0 0 25px rgba(6, 182, 212, 0.7)',
              '0 0 0px rgba(255,255,255,0)',
            ]
          } : {}}
          transition={{ duration: 0.8, repeat: isHovered ? Infinity : 0 }}
        >
          <Icon size={main ? 40 : 24} className={main ? 'text-white' : isHovered ? 'text-white' : 'text-slate-400'} />
        </motion.div>
      </motion.div>

      {/* Label with Electric Underline on Hover */}
      <div className="relative">
        <span className={`text-[10px] md:text-xs font-mono uppercase tracking-wider pointer-events-none transition-colors duration-300 ${isHovered ? 'text-purple-400' : 'text-slate-500'}`}>
          {label}
        </span>
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent origin-center"
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const SystemRuntime = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const timeProgress = useTransform(scrollYProgress, [0, 1], [6, 24]);
  const [displayTime, setDisplayTime] = useState("06:00");
  const [activePhase, setActivePhase] = useState(0);

  useAnimationFrame(() => {
    const timeVal = timeProgress.get();
    const hours = Math.floor(timeVal) % 24;
    const mins = Math.floor((timeVal % 1) * 60);
    const formatted = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    setDisplayTime(formatted);

    let phase = 0;
    if (hours >= 6 && hours < 9) phase = 0;
    else if (hours >= 9 && hours < 17) phase = 1;
    else if (hours >= 17 && hours < 21) phase = 2;
    else phase = 3;

    if (phase !== activePhase) setActivePhase(phase);
  });

  const currentRoutine = ROUTINE[activePhase];

  return (
    <section ref={containerRef} className="h-[300vh] relative z-40 bg-[#020617]">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0 transition-colors duration-1000"
          animate={{
            background: activePhase === 0 ? "radial-gradient(circle at center, #ea580c20 0%, #020617 70%)" :
              activePhase === 1 ? "radial-gradient(circle at center, #3b82f620 0%, #020617 70%)" :
                activePhase === 2 ? "radial-gradient(circle at center, #9333ea20 0%, #020617 70%)" :
                  "radial-gradient(circle at center, #10b98110 0%, #020617 70%)"
          }}
        />
        <div className="relative z-10 w-full max-w-6xl px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col items-center md:items-start">
            <div className="text-emerald-500 font-mono text-sm tracking-widest uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>System Runtime
            </div>
            <h2 className="text-[120px] md:text-[180px] font-bold text-white leading-none font-mono tracking-tighter tabular-nums select-none opacity-90">{displayTime}</h2>
            <div className="flex gap-4 mt-8">
              {ROUTINE.map((r, i) => (
                <div key={i} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${i === activePhase ? 'bg-white scale-x-110' : 'bg-white/20'}`} />
              ))}
            </div>
          </div>
          <div className="relative h-64 md:h-80 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePhase}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className={`absolute inset-0 rounded-3xl border border-white/10 backdrop-blur-xl p-8 flex flex-col justify-between ${currentRoutine.bg}`}
              >
                <div className="flex justify-between items-start">
                  <div className={`p-4 rounded-2xl bg-black/20 ${currentRoutine.color}`}><currentRoutine.icon size={32} /></div>
                  <div className="text-right"><div className="text-xs font-mono text-white/40 uppercase">CPU Load</div><div className={`text-2xl font-bold font-mono ${currentRoutine.color}`}>{currentRoutine.cpu}</div></div>
                </div>
                <div><h3 className="text-3xl font-bold text-white mb-2">{currentRoutine.title}</h3><p className="text-slate-300 text-lg">{currentRoutine.desc}</p></div>
                <div className="w-full h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
                  <motion.div className={`h-full ${currentRoutine.color.replace('text-', 'bg-')}`} initial={{ width: 0 }} animate={{ width: currentRoutine.cpu }} transition={{ duration: 1, delay: 0.2 }} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

const TestimonialMarquee = () => {
  return (
    <section className="bg-[#020617] py-20 overflow-hidden relative z-40 border-t border-white/5">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white">Transmission Logs</h2>
        <p className="text-slate-500 text-sm mt-2">Apa kata mereka tentang kolaborasi ini.</p>
      </div>

      <div className="flex gap-6 w-max animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused]">
        {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
          <div key={i} className="w-80 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-sm hover:border-purple-500/50 transition-colors group cursor-default">
            <Quote size={24} className="text-purple-500 mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            <p className="text-slate-300 text-sm leading-relaxed mb-6">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">{t.name[0]}</div>
              <div>
                <div className="text-white text-sm font-bold">{t.name}</div>
                <div className="text-slate-500 text-xs">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
};

const ForumSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const yChat = useTransform(scrollYProgress, [0, 1], [50, -50]);

  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    // Handle redirect result for GitHub Pages
    getRedirectResult(auth).catch((error) => {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error("Redirect login error:", error);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "forum_messages"), orderBy("createdAt", "asc"), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (firebaseConfig.apiKey === "ISI_API_KEY_ANDA_DISINI") {
      alert("⚠️ KONFIGURASI DIPERLUKAN: Ganti 'firebaseConfig' di dalam kode dengan data dari Firebase Console Anda.");
      return;
    }
    try { await signInWithRedirect(auth, googleProvider); }
    catch (error) { console.error("Login Gagal:", error); alert(`Gagal login: ${error.message}`); }
  };

  const handleLogout = async () => { await signOut(auth); };

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;
    await addDoc(collection(db, "forum_messages"), {
      text: newMessage, user: user.displayName, uid: user.uid, avatar: user.photoURL, createdAt: serverTimestamp()
    });
    setNewMessage("");
  };

  return (
    <section ref={containerRef} className="bg-[#020617] py-32 px-6 relative border-t border-white/5 z-40 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-400 text-xs font-mono mb-4 animate-pulse"><Radio size={12} /> LIVE FEED</div>
          <h2 className="text-4xl font-bold text-white mb-4">Orbit Comm-Link</h2>
          <p className="text-slate-400">Bergabung dengan transmisi global. Login dengan Google untuk chat.</p>
        </div>
        <motion.div style={{ y: yChat }} className="relative rounded-3xl overflow-hidden border border-white/10 bg-slate-900 shadow-2xl h-[500px] flex flex-col">
          <div className="bg-slate-800/50 p-4 border-b border-white/5 flex justify-between items-center backdrop-blur-sm">
            <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-red-500" /><div className="w-3 h-3 rounded-full bg-yellow-500" /><div className="w-3 h-3 rounded-full bg-green-500" /></div>
            <div className="text-xs font-mono text-slate-500">{user ? "CONNECTED: " + user.displayName.toUpperCase() : "SECURE_CONNECTION"}</div>
          </div>
          <div className="flex-1 relative overflow-hidden bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
            {!user ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-20 p-6 text-center">
                <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-400"><Lock size={32} /></div>
                <h3 className="text-xl font-bold text-white mb-2">Access Restricted</h3>
                <p className="text-slate-400 text-sm mb-8">Identifikasi Google diperlukan untuk mengakses saluran komunikasi ini.</p>
                <button onClick={handleLogin} className="mt-6 px-6 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"><User size={18} /> Login dengan Google</button>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                  <AnimatePresence>
                    {messages.map((msg) => (
                      <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.uid === user.uid ? 'flex-row-reverse' : ''}`}>
                        <img src={msg.avatar} alt="av" className="w-8 h-8 rounded-full border border-white/20" />
                        <div className={`p-3 rounded-xl text-xs max-w-[80%] ${msg.uid === user.uid ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-200 border border-white/10'}`}>
                          <div className="font-bold mb-1 opacity-50 text-[10px]">{msg.user}</div>{msg.text}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={chatEndRef} />
                </div>
                <div className="p-4 bg-slate-800/80 backdrop-blur-md border-t border-white/5 flex gap-2">
                  <button onClick={handleLogout} className="p-2 rounded-lg bg-red-500/10 text-red-400" title="Logout"><LogOut size={18} /></button>
                  <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} type="text" placeholder="Ketik pesan..." className="flex-1 bg-slate-900/50 border border-white/10 rounded-lg px-3 text-white focus:outline-none focus:border-purple-500 text-sm" />
                  <button onClick={handleSend} className="p-2 bg-purple-600 text-white rounded-lg"><Send size={18} /></button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const FooterReveal = () => {
  return (
    <div className="relative z-0 bg-black min-h-[50vh] flex items-center justify-center sticky bottom-0">
      <div className="w-full h-full absolute top-0 left-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black opacity-50"></div>
      <div className="max-w-4xl mx-auto text-center relative z-10 px-6 py-20">
        <p className="text-purple-500 font-mono mb-4 text-xs tracking-[0.3em]">SYSTEM SHUTDOWN IMMINENT</p>
        <h2 className="text-5xl md:text-8xl font-bold mb-8 text-white tracking-tighter">Let's Create.</h2>
        <a href={`mailto:${PERSONAL_INFO.email}`} className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full text-lg font-bold hover:scale-105 transition-transform cursor-pointer">
          Start Project <ArrowRight size={20} />
        </a>
        <div className="mt-20 max-w-sm mx-auto bg-white/5 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 border border-white/5">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center animate-pulse"><Music size={24} className="text-black" /></div>
          <div className="text-left flex-1 overflow-hidden">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Current Vibe</div>
            <div className="text-sm font-bold truncate">Lo-Fi Coding Beats</div>
          </div>
          <div className="flex gap-1 h-4 items-end">
            <div className="w-1 bg-green-500 animate-[bounce_1s_infinite] h-2"></div>
            <div className="w-1 bg-green-500 animate-[bounce_1.5s_infinite] h-4"></div>
            <div className="w-1 bg-green-500 animate-[bounce_1.2s_infinite] h-3"></div>
          </div>
        </div>
        <div className="mt-12 flex justify-between items-end text-xs text-slate-600 font-mono">
          <div><p>PROBOLINGGO — MALANG</p><p>EST. 2026</p></div>
          <div className="flex gap-4">
            <a href={PERSONAL_INFO.github} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors cursor-pointer"><Github /></a>
            <a href={PERSONAL_INFO.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors cursor-pointer"><Linkedin /></a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <AnimatePresence>
        {isLoading && <CinematicPreloader onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {!isLoading && (
        <div className="bg-[#020617] min-h-screen text-slate-200 selection:bg-purple-500 selection:text-white cursor-none">
          <CustomCursor />
          <GlobalParallaxParticles />

          <div className="relative z-10 bg-[#020617] mb-[50vh] shadow-2xl">
            <RealisticMountainHero />
            <VelocityText />
            <Philosophy /> {/* RESTORED HERE */}
            <HolographicBio />
            <CodeEvolution />
            <EducationTimeline />
            <WorkflowReactor />
            <CyberneticField />
            <HorizontalGallery />
            <SkillParallax />
            <SystemRuntime />
            <TestimonialMarquee />
            <ProjectArchitect />
            <ForumSection />
          </div>

          <FooterReveal />
        </div>
      )}
    </>
  );
}