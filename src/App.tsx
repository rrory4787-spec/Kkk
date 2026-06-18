import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, FileText, Download, Sprout, ChartLine, Crown, X, LogOut, CloudUpload, Gavel, CheckCircle2, Menu, Settings } from 'lucide-react';
import { FirebaseProvider, useFirebase } from './components/FirebaseProvider';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { GlobalConfig, InvestmentPackage, PackageType } from './types';
import { subscribeToConfig, subscribeToPackages, updateGlobalConfig, updatePackage } from './lib/data';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DynamicLogo = ({ className }: { className?: string }) => (
  <div className={cn("relative rounded-full border-2 border-gold shadow-lg bg-slate-900 overflow-hidden", className)}>
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <defs>
        <linearGradient id="svgGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF3B0"/>
          <stop offset="30%" stopColor="#D4AF37"/>
          <stop offset="70%" stopColor="#8A640F"/>
          <stop offset="100%" stopColor="#D4AF37"/>
        </linearGradient>
        <radialGradient id="svgBlue" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1E3A8A"/>
          <stop offset="70%" stopColor="#0F172A"/>
          <stop offset="100%" stopColor="#020617"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#svgGold)"/>
      <circle cx="50" cy="50" r="44" fill="url(#svgBlue)" stroke="url(#svgGold)" strokeWidth="1.2"/>
      <g stroke="url(#svgGold)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(1, -2)">
        <path d="M 43,40 C 43,37 49,37 49,40 C 49,43 43,43 43,40 Z" />
        <path d="M 51,40 C 51,37 57,37 57,40 C 57,43 51,43 51,40 Z" />
        <path d="M 37,45 Q 36,33 48,32 Q 58,32 62,38" />
        <path d="M 42,58 L 35,66 L 65,66 L 52,58" />
      </g>
      <rect x="36" y="73" width="28" height="11" rx="2" fill="#020617" stroke="url(#svgGold)" strokeWidth="0.8" />
      <text x="50" y="81" fill="url(#svgGold)" fontFamily="Poppins" fontSize="7.5" fontWeight="900" textAnchor="middle" letterSpacing="0.5">KAA</text>
    </svg>
  </div>
);

const Logo = ({ className, logoUrl }: { className?: string; logoUrl?: string }) => {
  if (logoUrl) {
    return (
      <div className={cn("relative rounded-full border-2 border-gold shadow-lg bg-slate-900 overflow-hidden flex items-center justify-center", className)}>
        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
      </div>
    );
  }
  return <DynamicLogo className={className} />;
};

// --- Content and Components ---

const defaultPackages: Record<PackageType, InvestmentPackage> = {
  smart: {
    id: 'smart',
    badgeAr: "بـاقـة الـبـدايـة الـذكـيـة (الـفـئـة أ)",
    badgeEn: "SMART START PACKAGE (TIER A)",
    descAr: "الدليل الاستثماري الشامل لشراكة الـ 30 يوماً الأولى",
    descEn: "Comprehensive Guide for the First 30-Day Trial Partnership",
    introAr: "نحن نؤمن في منظومة خزائن الأرض أن الثقة لا تُطلب شفهياً، بل تُبنى وتُثبت بالتجربة العملية والنتائج الفعلية على أرض الواقع. لذك صممنا هذه الباقة الاستثمارية لتكون بمثابة بوابتك الآمنة ومنخفضة المخاطر لاختبار كفاءة الإدارة المالية والفنية وتدقيق مصداقيتنا قبل الانتقال إلى الشراكات طويلة الأمد.",
    introEn: "At Khazain Al-Ard, we firmly believe that trust is not demanded; it is earned through real performance and verified results. Therefore, we designed the \"Smart Start Package\" as a secure, low-risk gateway for you to test our financial and technical expertise firsthand before committing to long-term partnerships.",
    f1TitleAr: "بناء الثقة بالتجربة الحقيقية",
    f1TitleEn: "Trust Through Real Performance",
    f1TextAr: "تتيح لك معاينة دقة صفقات الخبير ومعدل نمو حسابك يومياً بشكل مباشر.",
    f1TextEn: "Directly monitor the precision of our financial expert's trades and daily account growth.",
    f2TitleAr: "مخاطر مدروسة ومنخفضة جداً",
    f2TitleEn: "Controlled & Minimal Risks",
    f2TextAr: "البدء بسيولة بسيطة ومحدودة تضمن لك راحة البال الكاملة في أولى خطواتك.",
    f2TextEn: "Starting with a modest, capped capital allows absolute peace of mind during your trial phase.",
    tr1ValueAr: "يتراوح بين $700 إلى $1,500 كحد أقصى.",
    tr1ValueEn: "Strictly capped from $700 to $1,500 USD.",
    tr2ValueAr: "30 يوماً كاملة (شهر تعاقدي واحد).",
    tr2ValueEn: "30 full calendar days (1-month trial contract).",
    tr3ValueAr: "مناصفة بالتمام بنسبة 50% للمستثمر و 50% لمنظومة الإدارة.",
    tr3ValueEn: "Divided equally on a 50/50 basis (Investor/Management).",
    tr4ValueAr: "يسترد المستثمر كامل أصل رأس ماله مضافاً إليه الأرباح نقداً بنهاية اليوم الثلاثين.",
    tr4ValueEn: "Principal capital plus earned net profits returned in full on Day 30.",
    showCustodyRow: false,
    updatedAt: new Date()
  },
  advanced: {
    id: 'advanced',
    badgeAr: "بـاقـة الـنـمـو الـم_تـقـدم (الـفـئـة ب)",
    badgeEn: "ADVANCED GROWTH PACKAGE (TIER B)",
    descAr: "خطة توسيع المحفظة الاستثمارية وضمان الاستدامة",
    descEn: "Portfolio Expansion & Sustainability Strategic Plan",
    introAr: "بعد نجاح مرحلة الاختبار، ننتقل بك في باقة النمو المتقدم إلى مرحلة البناء الحقيقي للثروة الرقمية، حيث يتم رفع سقف السيولة المدارة مع تزويد المستثمر بتقارير تحليلية أعمق لإدارة صفقاته.",
    introEn: "Following a successful trial, our Advanced Growth Package transitions you into real digital wealth building, increasing managed liquidity thresholds while providing deeper analytical reports.",
    f1TitleAr: "عائد مركب ونمو متسارع",
    f1TitleEn: "Compound Yield & Faster Growth",
    f1TextAr: "استراتيجيات تداول تستهدف عوائد مجزية مع الحفاظ على أمان رأس المال.",
    f1TextEn: "Trading strategies targeting substantial returns while maintaining capital security.",
    f2TitleAr: "حوكمة مالية متكاملة",
    f2TitleEn: "Integrated Financial Governance",
    f2TextAr: "تطبيق أعلى معايير الشفافية والتدقيق في كافة العمليات المنفذة.",
    f2TextEn: "Applying the highest standards of transparency and auditing in all executed operations.",
    tr1ValueAr: "بين $2,000 إلى $5,000.",
    tr1ValueEn: "From $2,000 to $5,000 USD.",
    tr2ValueAr: "90 يوماً (دورة اقتصادية ربع سنوية).",
    tr2ValueEn: "90 days (Quarterly economic cycle).",
    tr3ValueAr: "60% للمستثمر و 40% لمنظومة الإدارة.",
    tr3ValueEn: "60% for the Investor and 40% for Management.",
    tr4ValueAr: "خيارات إعادة الاستثمار أو سحب الأرباح شهرياً.",
    tr4ValueEn: "Monthly options for reinvestment or profit withdrawal.",
    showCustodyRow: true,
    updatedAt: new Date()
  },
  vip: {
    id: 'vip',
    badgeAr: "بـاقـة الـشـراكـة VIP (الـفـئـة الـمـاسـية)",
    badgeEn: "VIP PARTNERSHIP (DIAMOND TIER)",
    descAr: "إدارة الثروات والحلول الاستثمارية لكبار المستثمرين",
    descEn: "Wealth Management & Diamond Solutions for HNWIs",
    introAr: "باقة النخبة صُممت لمن يبحث عن إدارة متكاملة ومخصصة بالكامل لثرواته الرقمية، مع تأمين قانوني مضاعف وأولوية قصوى في التنفيذ والاستلام.",
    introEn: "The Elite Package is designed for those seeking fully customized digital wealth management, featuring double legal security and top execution priority.",
    f1TitleAr: "إدارة مخصصة وحصرية",
    f1TitleEn: "Exclusive Tailored Management",
    f1TextAr: "خبير مالي مخصص لمتابعة محفظتك وتقديم استشارات خاصة على مدار الساعة.",
    f1TextEn: "Dedicated financial advisor for your portfolio with 24/7 private consulting.",
    f2TitleAr: "حماية قانونية سيادية",
    f2TitleEn: "Sovereign Legal Protection",
    f2TextAr: "عقود موثقة رسمياً مع ضمانات بنكية أو تجارية إضافية للمبالغ الكبيرة.",
    f2TextEn: "Officially notarized contracts with additional bank or commercial guarantees.",
    tr1ValueAr: "تبدأ من $10,000 فما فوق.",
    tr1ValueEn: "Starting from $10,000 USD and above.",
    tr2ValueAr: "180 يوماً (دورة استثمارية متوسطة المدى).",
    tr2ValueEn: "180 days (Mid-term investment cycle).",
    tr3ValueAr: "70% للمستثمر و 30% لمنظومة الإدارة.",
    tr3ValueEn: "70% for the Investor and 30% for Management.",
    tr4ValueAr: "تصفية فورية أو مرونة عالية في إدارة التدفقات النقدية.",
    tr4ValueEn: "Immediate liquidation or high flexibility in cash flow management.",
    showCustodyRow: true,
    updatedAt: new Date()
  }
};

const defaultGlobalConfig: GlobalConfig = {
  whatsapp: "009627825058",
  lawyerAr: "مكتب مستشارنا القانوني المعتمد",
  lawyerEn: "our certified legal counsel's office",
  location: "العاصمة عمان، الأردن",
  updatedAt: new Date()
};

// --- Sub-components for cleaner structure ---
const SidebarNav = ({ 
  isAdmin, 
  activePackage, 
  setActivePackage, 
  setIsAdminPanelOpen, 
  isAdminPanelOpen, 
  setIsLoginModalOpen 
}: {
  isAdmin: boolean;
  activePackage: PackageType;
  setActivePackage: (p: PackageType) => void;
  setIsAdminPanelOpen: (o: boolean) => void;
  isAdminPanelOpen: boolean;
  setIsLoginModalOpen: (o: boolean) => void;
}) => (
  <>
    <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4 pr-2">قائمة الباقات المعتمدة</div>
    
    <button 
      onClick={() => setActivePackage('smart')}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm",
        activePackage === 'smart' ? "bg-gold text-navy shadow-lg shadow-gold/10" : "hover:bg-slate-800 text-slate-400"
      )}
    >
      <div className={cn("p-1.5 rounded-lg", activePackage === 'smart' ? "bg-navy/10 text-navy" : "bg-slate-800 text-slate-500")}>
        <Sprout className="w-4 h-4" />
      </div>
      البداية الذكية ($700+)
    </button>

    <button 
      onClick={() => setActivePackage('advanced')}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm",
        activePackage === 'advanced' ? "bg-gold text-navy shadow-lg shadow-gold/10" : "hover:bg-slate-800 text-slate-400"
      )}
    >
      <div className={cn("p-1.5 rounded-lg", activePackage === 'advanced' ? "bg-navy/10 text-navy" : "bg-slate-800 text-slate-500")}>
        <ChartLine className="w-4 h-4" />
      </div>
      النمو المتقدم ($2k+)
    </button>

    <button 
      onClick={() => setActivePackage('vip')}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm",
        activePackage === 'vip' ? "bg-gold text-navy shadow-lg shadow-gold/10" : "hover:bg-slate-800 text-slate-400"
      )}
    >
      <div className={cn("p-1.5 rounded-lg", activePackage === 'vip' ? "bg-navy/10 text-navy" : "bg-slate-800 text-slate-500")}>
        <Crown className="w-4 h-4" />
      </div>
      الشراكة VIP ($5k+)
    </button>

    <div className="pt-8 text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4 pr-2 border-t border-white/5 mt-4">أدوات الإدارة</div>
    <button 
      onClick={() => isAdmin ? setIsAdminPanelOpen(!isAdminPanelOpen) : setIsLoginModalOpen(true)}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-medium text-sm transition-all border border-transparent",
        isAdminPanelOpen ? "bg-gold/10 border-gold/20 text-gold shadow-lg shadow-gold/5" : "text-slate-400"
      )}
    >
      <div className={cn("p-1.5 rounded-lg", isAdminPanelOpen ? "bg-gold/20 text-gold" : "bg-slate-800 text-slate-500")}>
        <Settings className="w-4 h-4" />
      </div>
      {isAdmin ? "لوحة التحكم السحابية" : "دخول الإدارة الفنية"}
    </button>
  </>
);

const AdminStatus = ({ isAdmin }: { isAdmin: boolean }) => (
  <div className="bg-slate-900/50 rounded-2xl p-3 flex items-center gap-3 border border-white/5 shadow-inner">
    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-gold transition-all", isAdmin ? "bg-gold/20 shadow-lg shadow-gold/5" : "bg-slate-800")}>
      {isAdmin ? <Crown className="w-5 h-5 shadow-gold animate-pulse text-gold" /> : <Lock className="w-5 h-5" />}
    </div>
    <div className="overflow-hidden">
      <p className="text-[11px] font-black text-white truncate">{isAdmin ? "مبرمجة المنظومة" : "ضيف زائر"}</p>
      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{isAdmin ? "ONLINE ADMIN" : "VIEW ONLY"}</p>
    </div>
  </div>
);

function AppContent() {
  const { user, isAdmin, loading } = useFirebase();
  const [activePackage, setActivePackage] = useState<PackageType>('smart');
  const [config, setConfig] = useState<GlobalConfig>(defaultGlobalConfig);
  const [packages, setPackages] = useState<Record<PackageType, InvestmentPackage>>(defaultPackages);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  
  // Close admin panel if user is not admin
  useEffect(() => {
    if (!isAdmin) {
      setIsAdminPanelOpen(false);
    }
  }, [isAdmin]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubConfig = subscribeToConfig((newConfig) => {
      if (newConfig) setConfig(newConfig);
    });
    const unsubPackages = subscribeToPackages((newPackages) => {
      if (newPackages && newPackages.length > 0) {
        setPackages(prev => {
          const pkgMap = { ...prev };
          newPackages.forEach(p => {
            if (p.id === 'smart' || p.id === 'advanced' || p.id === 'vip') {
              pkgMap[p.id as PackageType] = p;
            }
          });
          return pkgMap;
        });
      }
    });

    return () => {
      unsubConfig();
      unsubPackages();
    };
  }, []);

  const showToast = (title: string, desc: string) => {
    setToast({ title, desc });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (user.email === 'admin@americanaash.com' || user.email === 'apple@americanaash.com') {
        setIsLoginModalOpen(false);
        setIsAdminPanelOpen(true);
        showToast("تم الدخول بنجاح", `مرحباً بكِ ${user.displayName || 'في لوحة التحكم'}.`);
      } else {
        await signOut(auth);
        alert("عذراً، هذا الحساب ليس له صلاحيات إدارة.");
      }
    } catch (error) {
      console.error(error);
      alert("تعذر تسجيل الدخول عبر جوجل. يرجى المحاولة مرة أخرى.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsAdminPanelOpen(false);
    showToast("تم الخروج", "تم تسجيل الخروج بنجاح.");
  };

  const currentPkg = packages[activePackage];

  const handleDownloadPDF = async (pkgType: PackageType = activePackage) => {
    if (!printRef.current || isGeneratingPdf) return;
    
    setIsGeneratingPdf(true);
    showToast("جاري المعالجة", `يتم الآن توليد ملف PDF لباقة: ${packages[pkgType].badgeAr}`);

    // Wait to allow React to remove scale class before painting
    await new Promise(resolve => setTimeout(resolve, 300));

    // Store the current package to return to it later
    const originalPackage = activePackage;
    
    try {
      // Force switch to the target package to ensure state updates the DOM
      if (pkgType !== activePackage) {
        setActivePackage(pkgType);
        // Wait for React to complete the re-render and for the browser to paint
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const _html2pdfModule = await import('html2pdf.js');
      const html2pdf: any = _html2pdfModule.default || _html2pdfModule;
      
      const opt = {
        margin: 0,
        filename: `Americanaash_Catalog_2026_${pkgType.toUpperCase()}_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 3, 
          useCORS: true,
          logging: false,
          letterRendering: true
        },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      await html2pdf().from(printRef.current).set(opt).save();
      showToast("اكتمل التحميل", "تم حفظ المستند بنجاح على جهازك.");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      showToast("خطأ في التحميل", "تعذر توليد ملف PDF، يرجى المحاولة مرة أخرى.");
    } finally {
      // Return to original view if we switched
      if (originalPackage !== pkgType) {
        setActivePackage(originalPackage);
      }
      setIsGeneratingPdf(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      updateGlobalConfig({ logoUrl: base64String });
      showToast("تم رفع الشعار", "تم تحديث الشعار بنجاح.");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex h-screen w-full bg-dark text-slate-100 overflow-hidden relative" dir="rtl">
      {/* Navigation Sidebar - Desktop */}
      <aside className="no-print hidden lg:flex w-72 border-l border-slate-800 bg-deep-navy flex-col shrink-0 shadow-2xl relative z-20">
        <div className="p-8 border-b border-gold/30 bg-deep-navy/30 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gold/20 blur-xl rounded-full" />
              <Logo className="w-12 h-12 relative z-10" logoUrl={config.logoUrl} />
            </div>
            <div>
              <h1 className="text-base font-black text-white leading-tight">خزائن الأرض</h1>
              <p className="text-[9px] text-gold uppercase tracking-[0.2em] font-black poppins italic">Financial Services</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          <SidebarNav 
            isAdmin={isAdmin} 
            activePackage={activePackage} 
            setActivePackage={setActivePackage} 
            setIsAdminPanelOpen={setIsAdminPanelOpen} 
            isAdminPanelOpen={isAdminPanelOpen} 
            setIsLoginModalOpen={setIsLoginModalOpen} 
          />
        </nav>

        <div className="p-6 border-t border-slate-800 bg-slate-950/20">
          <AdminStatus isAdmin={isAdmin} />
        </div>
      </aside>

      {/* Navigation Sidebar - Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="no-print fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[70] lg:hidden cursor-pointer"
            />
            <motion.aside 
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="no-print fixed inset-y-0 right-0 w-80 bg-deep-navy border-l border-slate-800 z-[80] lg:hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-gold/30 flex items-center justify-between bg-deep-navy/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3 text-right">
                  <Logo className="w-12 h-12" logoUrl={config.logoUrl} />
                  <div>
                    <h1 className="text-sm font-black text-white leading-tight">خزائن الأرض</h1>
                    <p className="text-[8px] text-gold uppercase tracking-widest font-black poppins">Financial Services</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white border border-white/5 active:scale-95 transition-all cursor-pointer shadow-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
                <SidebarNav 
                  isAdmin={isAdmin} 
                  activePackage={activePackage} 
                  setActivePackage={(p) => { setActivePackage(p); setIsMobileMenuOpen(false); }} 
                  setIsAdminPanelOpen={setIsAdminPanelOpen} 
                  isAdminPanelOpen={isAdminPanelOpen} 
                  setIsLoginModalOpen={setIsLoginModalOpen} 
                />
              </nav>
              <div className="p-6 border-t border-slate-800 bg-slate-950/20">
                <AdminStatus isAdmin={isAdmin} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-dark overflow-hidden relative min-w-0">
        {/* Top Header Bar */}
        <header className="no-print h-16 md:h-20 border-b border-slate-800 px-4 md:px-8 flex items-center justify-between bg-dark/20 backdrop-blur-xl shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-11 h-11 flex items-center justify-center text-gold hover:text-white bg-gold/10 hover:bg-gold/20 rounded-xl border border-gold/20 transition-all active:scale-95 shadow-[0_0_20px_rgba(212,175,55,0.1)]"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h2 className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest poppins truncate max-w-[120px] md:max-w-none">
                مركز المستندات المعتمدة
              </h2>
              <span className="text-sm md:text-lg font-black text-white">{currentPkg.badgeAr}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <button 
                disabled={isGeneratingPdf}
                className={cn(
                  "bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg shadow-lg hover:shadow-emerald-600/20 transition-all flex items-center gap-2 border border-emerald-400 text-xs poppins shrink-0",
                  isGeneratingPdf && "opacity-50 cursor-wait"
                )}
              >
                {isGeneratingPdf ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{isGeneratingPdf ? "GENERATING..." : "EXPORT PDF"}</span>
              </button>
              
              {!isGeneratingPdf && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden backdrop-blur-xl">
                  <div className="px-4 py-2 bg-slate-950/50 text-[9px] text-slate-500 font-bold border-b border-white/5 uppercase tracking-widest">اختر ملف التحميل</div>
                  <button onClick={() => handleDownloadPDF('smart')} className="w-full px-4 py-3 text-right text-[11px] hover:bg-gold hover:text-navy border-b border-white/5 transition-all flex items-center justify-between group/item">
                    <span>الباقة الذكية</span>
                    <Download className="w-3 h-3 opacity-30 group-hover/item:opacity-100" />
                  </button>
                  <button onClick={() => handleDownloadPDF('advanced')} className="w-full px-4 py-3 text-right text-[11px] hover:bg-gold hover:text-navy border-b border-white/5 transition-all flex items-center justify-between group/item">
                    <span>باقة النمو</span>
                    <Download className="w-3 h-3 opacity-30 group-hover/item:opacity-100" />
                  </button>
                  <button onClick={() => handleDownloadPDF('vip')} className="w-full px-4 py-3 text-right text-[11px] hover:bg-gold hover:text-navy transition-all flex items-center justify-between group/item">
                    <span>باقة VIP</span>
                    <Download className="w-3 h-3 opacity-30 group-hover/item:opacity-100" />
                  </button>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => isAdmin ? setIsAdminPanelOpen(!isAdminPanelOpen) : setIsLoginModalOpen(true)}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              {isAdmin && isAdminPanelOpen ? <X className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* PDF Preview Area */}
        <div className="flex-1 p-2 md:p-8 flex justify-center bg-slate-950/20 overflow-y-auto scroll-smooth custom-scrollbar overflow-x-hidden">
          <div 
            ref={printRef} 
            className={cn("flex flex-col gap-6 md:gap-12 origin-top py-10 md:py-0 w-[210mm]", !isGeneratingPdf && "doc-preview-scale")}
          >
            
            {/* Page 1: Arabic */}
            <div className="a4-page relative flex flex-col text-navy shrink-0" dir="rtl">
              <div className="flex justify-between items-center border-b border-gold/40 pb-3 mb-6">
                <span className="text-[10px] font-black text-navy">خزائن الأرض للخدمات المالية</span>
                <span className="text-[10px] font-bold text-gold uppercase tracking-widest poppins">KHAZAIN AL-ARD</span>
              </div>

              <div className="text-center mb-6">
                <Logo className="w-20 h-20 mx-auto mb-3" logoUrl={config.logoUrl} />
                <h2 className="text-2xl font-black text-navy mb-1">{currentPkg.badgeAr}</h2>
                <p className="text-[10px] text-slate-500 font-bold poppins tracking-widest uppercase italic">{currentPkg.badgeEn}</p>
              </div>

              <div className="bg-navy text-white p-4 rounded-xl text-center mb-6 border border-gold shadow-md">
                <h3 className="text-lg font-black">{currentPkg.badgeAr}</h3>
                <p className="text-[10px] text-gold font-bold uppercase tracking-wide mt-1">{currentPkg.descAr}</p>
              </div>

              <div className="space-y-4 flex-1">
                <div className="border-r-2 border-gold pr-3">
                  <h4 className="text-[11px] font-black text-navy mb-1 uppercase tracking-wide">مقدمة الباقة</h4>
                  <p className="text-[10px] leading-relaxed text-slate-600 text-justify" dangerouslySetInnerHTML={{ __html: currentPkg.introAr }} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-amber-100 p-3 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-3 h-3 text-gold" />
                      <p className="text-[10px] font-black text-navy uppercase">{currentPkg.f1TitleAr}</p>
                    </div>
                    <p className="text-[9px] text-slate-500 leading-tight">{currentPkg.f1TextAr}</p>
                  </div>
                  <div className="bg-white border border-amber-100 p-3 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-3 h-3 text-gold" />
                      <p className="text-[10px] font-black text-navy uppercase">{currentPkg.f2TitleAr}</p>
                    </div>
                    <p className="text-[9px] text-slate-500 leading-tight">{currentPkg.f2TextAr}</p>
                  </div>
                </div>

                <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-navy text-gold p-2 text-[9px] flex justify-between px-3 font-bold uppercase tracking-wider">
                    <span>البند الاستثماري والتقني</span>
                    <span>التفاصيل والشروط المعتمدة</span>
                  </div>
                  <div className="bg-white">
                    <div className="p-2 px-3 text-[9px] border-b border-slate-100 flex justify-between items-center">
                      <span className="text-navy font-black">رأس المال المستهدف</span>
                      <span className="text-slate-600">{currentPkg.tr1ValueAr}</span>
                    </div>
                    {currentPkg.showCustodyRow && (
                      <div className="p-2 px-3 text-[9px] border-b border-slate-100 flex justify-between items-center">
                        <span className="text-navy font-black">مكان السيولة</span>
                        <span className="text-slate-600">Binance - حساب شخصي</span>
                      </div>
                    )}
                    <div className="p-2 px-3 text-[9px] border-b border-slate-100 flex justify-between items-center">
                      <span className="text-navy font-black">مدة الدورة</span>
                      <span className="text-slate-600">{currentPkg.tr2ValueAr}</span>
                    </div>
                    <div className="p-2 px-3 text-[9px] border-b border-slate-100 flex justify-between items-center">
                      <span className="text-navy font-black">توزيع الأرباح</span>
                      <span className="text-slate-600">{currentPkg.tr3ValueAr}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-amber-50/50 border border-dashed border-gold p-3 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Gavel className="w-3 h-3 text-gold" />
                  <p className="text-[9px] font-black text-navy uppercase tracking-wide">الضوابط القانونية والتوثيق</p>
                </div>
                <p className="text-[8px] text-slate-600 leading-relaxed text-justify">
                  يُصاغ العقد بصفة أمانة تجارية ملزمة يوقّع عليها الخبير المالي في عمان، الأردن لضمان كامل الحقوق. 
                  للتواصل: <strong>{config.whatsapp}</strong> في <strong>{config.lawyerAr}</strong>.
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-200 flex justify-between text-[8px] text-slate-400 font-mono uppercase tracking-widest">
                <span>Page 1 of 2</span>
                <span>© KHAZAIN AL-ARD 2026</span>
              </div>
            </div>

            {/* Page 2: English */}
            <div className="a4-page relative flex flex-col text-navy shrink-0" dir="ltr">
               <div className="flex justify-between items-center border-b border-gold/40 pb-3 mb-6">
                <span className="text-[10px] font-bold text-gold uppercase tracking-widest poppins">KHAZAIN AL-ARD</span>
                <span className="text-[10px] font-black text-navy">خزائن الأرض</span>
              </div>

              <div className="text-center mb-6">
                <Logo className="w-20 h-20 mx-auto mb-3" logoUrl={config.logoUrl} />
                <h2 className="text-2xl font-black text-navy mb-1 poppins uppercase">{currentPkg.badgeEn}</h2>
                <p className="text-[10px] text-slate-500 font-bold poppins tracking-widest uppercase italic">Master Portfolio Guide</p>
              </div>

              <div className="bg-navy text-white p-4 rounded-xl text-center mb-6 border border-gold shadow-md">
                <h3 className="text-lg font-black poppins uppercase tracking-tight">{currentPkg.badgeEn}</h3>
                <p className="text-[10px] text-gold font-bold uppercase tracking-widest poppins mt-1">{currentPkg.descEn}</p>
              </div>

              <div className="space-y-4 flex-1 poppins">
                <div className="border-l-2 border-gold pl-3">
                  <h4 className="text-[11px] font-black text-navy mb-1 uppercase tracking-wide">Introduction</h4>
                  <p className="text-[10px] leading-relaxed text-slate-600 text-justify" dangerouslySetInnerHTML={{ __html: currentPkg.introEn }} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-amber-100 p-3 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-3 h-3 text-gold" />
                      <p className="text-[10px] font-black text-navy uppercase">{currentPkg.f1TitleEn}</p>
                    </div>
                    <p className="text-[9px] text-slate-500 leading-tight">{currentPkg.f1TextEn}</p>
                  </div>
                  <div className="bg-white border border-amber-100 p-3 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-3 h-3 text-gold" />
                      <p className="text-[10px] font-black text-navy uppercase">{currentPkg.f2TitleEn}</p>
                    </div>
                    <p className="text-[9px] text-slate-500 leading-tight">{currentPkg.f2TextEn}</p>
                  </div>
                </div>

                <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-navy text-gold p-2 text-[9px] flex justify-between px-3 font-bold uppercase tracking-wider">
                    <span>TECHNICAL PARAMETERS</span>
                    <span>OFFICIAL TERMS & LIMITS</span>
                  </div>
                  <div className="bg-white">
                    <div className="p-2 px-3 text-[9px] border-b border-slate-100 flex justify-between items-center">
                      <span className="text-navy font-black">TARGET CAPITAL</span>
                      <span className="text-slate-600">{currentPkg.tr1ValueEn}</span>
                    </div>
                    {currentPkg.showCustodyRow && (
                      <div className="p-2 px-3 text-[9px] border-b border-slate-100 flex justify-between items-center">
                        <span className="text-navy font-black">ASSET CUSTODY</span>
                        <span className="text-slate-600">Binance Personal Account</span>
                      </div>
                    )}
                    <div className="p-2 px-3 text-[9px] border-b border-slate-100 flex justify-between items-center">
                      <span className="text-navy font-black">DURATION</span>
                      <span className="text-slate-600">{currentPkg.tr2ValueEn}</span>
                    </div>
                    <div className="p-2 px-3 text-[9px] border-b border-slate-100 flex justify-between items-center">
                      <span className="text-navy font-black">PROFIT SPLIT</span>
                      <span className="text-slate-600">{currentPkg.tr3ValueEn}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-amber-50/50 border border-dashed border-gold p-3 rounded-xl poppins">
                <div className="flex items-center gap-2 mb-1">
                  <Gavel className="w-3 h-3 text-gold" />
                  <p className="text-[9px] font-black text-navy uppercase tracking-wide">LEGAL GOVERNANCE</p>
                </div>
                <p className="text-[8px] text-slate-600 leading-relaxed text-justify">
                  The contract is legally drafted as a binding commercial trust signed at 
                  <strong> {config.lawyerEn}</strong> in Amman. Support: <strong>{config.whatsapp}</strong>.
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-200 flex justify-between text-[8px] text-slate-400 font-mono uppercase tracking-widest poppins">
                <span>Page 2 of 2</span>
                <span>© KHAZAIN AL-ARD 2026</span>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Editor Sidebar (Admin only) */}
      <AnimatePresence>
        {isAdmin && isAdminPanelOpen && (
          <>
            {/* Backdrop for closing */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdminPanelOpen(false)}
              className="no-print fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[55] lg:hidden cursor-pointer"
            />
            
            <motion.aside 
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="no-print w-80 sm:w-96 border-r border-slate-800 bg-navy flex flex-col shrink-0 fixed inset-y-0 right-0 lg:relative z-[60] shadow-2xl h-full"
            >
              <div className="p-6 border-b border-white/10 shrink-0 flex items-center justify-between bg-navy/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex flex-col">
                  <h3 className="text-xs font-bold text-gold uppercase tracking-widest poppins">LIVE CONFIGURATION</h3>
                  <p className="text-[9px] text-slate-500 font-medium">لوحة التحكم الفورية</p>
                </div>
                <button 
                  onClick={() => setIsAdminPanelOpen(false)} 
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer border border-white/5"
                  title="إغلاق لوحة التحكم"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            
            <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
              <div className="pb-4 border-b border-white/5">
                <label className="block text-[10px] text-slate-400 mb-1.5 font-bold uppercase tracking-wide">شعار المنظومة</label>
                <div className="flex items-center gap-4">
                  <Logo className="w-12 h-12 shrink-0" logoUrl={config.logoUrl} />
                  <label className="flex-1 cursor-pointer">
                    <div className="bg-slate-900 border border-dashed border-slate-700 rounded-xl p-3 text-center text-[10px] text-slate-400 hover:border-gold hover:text-gold transition-all">
                      <CloudUpload className="mx-auto w-4 h-4 mb-1" />
                      رفع شعار جديد
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1.5 font-bold uppercase tracking-wide">واتساب التواصل</label>
                <input 
                  type="text" 
                  value={config.whatsapp || ''}
                  onChange={(e) => updateGlobalConfig({ whatsapp: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:border-gold outline-none transition-all poppins"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1.5 font-bold uppercase tracking-wide">مكتب المحاماة (AR)</label>
                <input 
                  type="text" 
                  value={config.lawyerAr || ''}
                  onChange={(e) => updateGlobalConfig({ lawyerAr: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:border-gold outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1.5 font-bold uppercase tracking-wide">موقع التعاقد</label>
                <input 
                  type="text" 
                  value={config.location || ''}
                  onChange={(e) => updateGlobalConfig({ location: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:border-gold outline-none transition-all"
                />
              </div>

              <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] text-slate-400 font-bold mb-3 uppercase tracking-widest">تعديل باقة {currentPkg.id.toUpperCase()}</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[8px] text-slate-500 mb-1 font-bold uppercase">عنوان الباقة (AR)</label>
                    <input 
                      type="text" 
                      value={currentPkg.badgeAr || ''}
                      onChange={(e) => updatePackage(activePackage, { badgeAr: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-[10px] text-white focus:border-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-slate-500 mb-1 font-bold uppercase">وصف الباقة (AR)</label>
                    <input 
                      type="text" 
                      value={currentPkg.descAr || ''}
                      onChange={(e) => updatePackage(activePackage, { descAr: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-[10px] text-white focus:border-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-slate-500 mb-1 font-bold uppercase">المقدمة (AR)</label>
                    <textarea 
                      value={currentPkg.introAr || ''}
                      onChange={(e) => updatePackage(activePackage, { introAr: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-[10px] text-white focus:border-gold outline-none h-24 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] text-slate-500 mb-1 font-bold uppercase">الرأس المال (AR)</label>
                      <input 
                        type="text" 
                        value={currentPkg.tr1ValueAr || ''}
                        onChange={(e) => updatePackage(activePackage, { tr1ValueAr: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-[10px] text-white focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] text-slate-500 mb-1 font-bold uppercase">Capital (EN)</label>
                      <input 
                        type="text" 
                        value={currentPkg.tr1ValueEn || ''}
                        onChange={(e) => updatePackage(activePackage, { tr1ValueEn: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-[10px] text-white focus:border-gold outline-none poppins"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] text-slate-500 mb-1 font-bold uppercase">مدة الدورة (AR)</label>
                      <input 
                        type="text" 
                        value={currentPkg.tr2ValueAr || ''}
                        onChange={(e) => updatePackage(activePackage, { tr2ValueAr: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-[10px] text-white focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] text-slate-500 mb-1 font-bold uppercase">Duration (EN)</label>
                      <input 
                        type="text" 
                        value={currentPkg.tr2ValueEn || ''}
                        onChange={(e) => updatePackage(activePackage, { tr2ValueEn: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-[10px] text-white focus:border-gold outline-none poppins"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] text-slate-500 mb-1 font-bold uppercase">توزيع الأرباح (AR)</label>
                      <input 
                        type="text" 
                        value={currentPkg.tr3ValueAr || ''}
                        onChange={(e) => updatePackage(activePackage, { tr3ValueAr: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-[10px] text-white focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] text-slate-500 mb-1 font-bold uppercase">Profit (EN)</label>
                      <input 
                        type="text" 
                        value={currentPkg.tr3ValueEn || ''}
                        onChange={(e) => updatePackage(activePackage, { tr3ValueEn: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-[10px] text-white focus:border-gold outline-none poppins"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full mt-4 bg-red-900/40 hover:bg-red-800/60 text-red-100 text-xs font-bold py-3 rounded-xl transition-all border border-red-900/50 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
            
            <div className="p-6 bg-slate-950/20 mt-auto border-t border-white/5 shrink-0">
              <div className="text-[9px] text-slate-500 leading-relaxed italic pr-2">
                * التعديلات التي يتم إجراؤها هنا تنعكس فوراً على معاينة المستندات الرقمية لجميع الزوار.
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>

      {/* Auth Modals & Toasts */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setIsLoginModalOpen(false)}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[100] no-print cursor-pointer"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-gold/30 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative cursor-default"
            >
              <button 
                onClick={() => setIsLoginModalOpen(false)} 
                className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gold/30">
                  <Shield className="w-8 h-8 text-gold" />
                </div>
                <h4 className="text-white font-black text-xl poppins">ADMIN PORTAL</h4>
                <p className="text-xs text-slate-400 mt-1">خاص لمدارة المنظومة حصراً</p>
              </div>
              <div className="space-y-4">
                <button 
                  onClick={handleLogin} 
                  className="w-full bg-white hover:bg-slate-50 text-navy font-black py-4 rounded-xl shadow-lg transition-all text-sm mt-4 uppercase tracking-widest poppins flex items-center justify-center gap-3 border border-slate-200"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 16.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V9.06H2.18C1.43 10.55 1 12.22 1 14s.43 3.45 1.18 4.94L5.84 16.1z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>LOG IN WITH GOOGLE</span>
                </button>
                <p className="text-[10px] text-center text-slate-500 mt-4 leading-relaxed">
                  سيتم التحقق من البريد الإلكتروني للتأكد من صلاحيات الإدارة الممنوحة لمجموعة بلس أمريكان.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-6 bg-slate-900 border border-emerald-500/50 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[101] no-print"
          >
            <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-emerald-400" /></div>
            <div>
              <h5 className="font-bold text-sm">{toast.title}</h5>
              <p className="text-xs text-slate-400">{toast.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <AppContent />
    </FirebaseProvider>
  );
}
