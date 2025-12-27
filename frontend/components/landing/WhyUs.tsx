// "use client";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import { Inter, Poppins } from 'next/font/google';
// import { FaRobot, FaChartLine, FaClock, FaTargetArrow } from "react-icons/fa6";
// import { FaReddit } from "react-icons/fa";

// const inter = Inter({ subsets: ['latin'] });
// const poppins = Poppins({ 
//   subsets: ['latin'], 
//   weight: ['400', '600', '700', '800', '900'] 
// });

// export const WhyUs = () => {
//   return (
//     <div className="min-h-screen bg-black" style={{
//       WebkitOverflowScrolling: 'touch',
//       scrollBehavior: 'smooth',
//       transform: 'translateZ(0)',
//       willChange: 'scroll-position'
//     }}>
      
//       {/* Background Effects */}
//       <div className="absolute inset-0 z-5">
//         <div className="absolute inset-0 bg-black"></div>
//         <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/40 to-black/20 opacity-70"></div>
//         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.03),transparent_70%)] opacity-50"></div>
//         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.02),transparent_70%)] opacity-40"></div>
    
//         {/* Enhanced Spotlight Beam */}
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
//           <div className="w-[800px] h-[800px] bg-gradient-radial from-orange-400/20 via-orange-300/10 to-transparent rounded-full blur-2xl"></div>
//           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-radial from-orange-300/30 via-orange-200/15 to-transparent rounded-full blur-xl"></div>
//           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-gradient-radial from-orange-200/40 to-transparent rounded-full blur-lg"></div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <main className="px-6 py-4 max-md:px-4 relative z-10 flex items-center justify-center min-h-screen" style={{
//         transform: 'translateZ(0)',
//         contain: 'layout style paint'
//       }}>
        
//         {/* Why AI Section */}
//         <div className="relative rounded-2xl overflow-hidden mx-auto max-w-[98vw]">
//           <div className="absolute inset-0">
//             <div className="w-full h-full bg-black"></div>
//           </div>

//           {/* Main Content */}
//           <div className="relative z-10 px-16 pt-20 pb-12 text-center max-md:px-8 max-md:pt-16 max-md:pb-8">

//             {/* Main Headline */}
//             <div className="overflow-visible mb-12">
//               <motion.h2 
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
//                 className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter leading-[0.9] text-white mb-4 overflow-visible ${poppins.className}`}
//               >
//                 Why{" "}
//                 <motion.span
//                   initial={{ scale: 0.8, opacity: 0 }}
//                   animate={{ scale: 1, opacity: 1 }}
//                   transition={{ duration: 0.8, delay: 0.5, ease: "backOut" }}
//                   className="inline-block relative z-20 overflow-visible"
//                 >
//                   <FaRobot className="inline size-8 sm:size-10 lg:size-12 xl:size-14 text-orange-500 mx-2 relative z-20" />
//                 </motion.span>
//                 <motion.span
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ duration: 0.8, delay: 0.7 }}
//                   className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent inline-block overflow-visible"
//                 >
//                   AI leads
//                 </motion.span>
//                 {" "}beat manual marketing
//               </motion.h2>

//               <motion.p
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.8, delay: 0.9 }}
//                 className={`${inter.className} text-white/70 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed`}
//               >
//                 Stop wasting time on manual outreach. Let AI find, qualify, and engage your perfect prospects while you sleep.
//               </motion.p>
//             </div>

//             {/* Comparison Grid */}
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8, delay: 1.1 }}
//               className="grid md:grid-cols-2 gap-8 mb-16 max-w-6xl mx-auto"
//             >
              
//               {/* Manual Marketing Side */}
//               <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 relative">
//                 <div className="absolute -top-3 left-6 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
//                   Manual Marketing
//                 </div>
//                 <div className="mt-4 space-y-4 text-left">
//                   <div className="flex items-start gap-3">
//                     <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
//                     <p className={`${inter.className} text-white/80`}>Spend hours browsing Reddit manually</p>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
//                     <p className={`${inter.className} text-white/80`}>Miss potential leads while you sleep</p>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
//                     <p className={`${inter.className} text-white/80`}>Inconsistent outreach quality</p>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
//                     <p className={`${inter.className} text-white/80`}>Limited to your working hours</p>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
//                     <p className={`${inter.className} text-white/80`}>No data-driven insights</p>
//                   </div>
//                 </div>
//               </div>

//               {/* AI Marketing Side */}
//               <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-8 relative">
//                 <div className="absolute -top-3 left-6 bg-gradient-to-r from-orange-400 to-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
//                   RedLead AI
//                 </div>
//                 <div className="mt-4 space-y-4 text-left">
//                   <div className="flex items-start gap-3">
//                     <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
//                     <p className={`${inter.className} text-white/80`}>AI scans 1000s of posts per minute</p>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
//                     <p className={`${inter.className} text-white/80`}>Works 24/7 - never misses opportunities</p>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
//                     <p className={`${inter.className} text-white/80`}>Personalized responses every time</p>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
//                     <p className={`${inter.className} text-white/80`}>Scales infinitely across subreddits</p>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
//                     <p className={`${inter.className} text-white/80`}>Advanced analytics & optimization</p>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Stats Section */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8, delay: 1.3 }}
//               className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto"
//             >
//               <div className="text-center">
//                 <div className="flex justify-center mb-2">
//                   <FaClock className="w-6 h-6 text-orange-500" />
//                 </div>
//                 <div className={`${poppins.className} text-2xl font-bold text-white mb-1`}>95%</div>
//                 <div className={`${inter.className} text-white/70 text-sm`}>Time Saved</div>
//               </div>
//               <div className="text-center">
//                 <div className="flex justify-center mb-2">
//                   <FaTargetArrow className="w-6 h-6 text-orange-500" />
//                 </div>
//                 <div className={`${poppins.className} text-2xl font-bold text-white mb-1`}>10x</div>
//                 <div className={`${inter.className} text-white/70 text-sm`}>More Leads</div>
//               </div>
//               <div className="text-center">
//                 <div className="flex justify-center mb-2">
//                   <FaChartLine className="w-6 h-6 text-orange-500" />
//                 </div>
//                 <div className={`${poppins.className} text-2xl font-bold text-white mb-1`}>24/7</div>
//                 <div className={`${inter.className} text-white/70 text-sm`}>Operation</div>
//               </div>
//               <div className="text-center">
//                 <div className="flex justify-center mb-2">
//                   <FaReddit className="w-6 h-6 text-orange-500" />
//                 </div>
//                 <div className={`${poppins.className} text-2xl font-bold text-white mb-1`}>100+</div>
//                 <div className={`${inter.className} text-white/70 text-sm`}>Subreddits</div>
//               </div>
//             </motion.div>

//             {/* CTA Section */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, delay: 1.5 }}
//               className="text-center"
//             >
//               <h3 className={`${poppins.className} text-2xl font-bold text-white mb-4`}>
//                 Ready to automate your lead generation?
//               </h3>
              
//               <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
//                 <Link 
//                   href="/signup"
//                   className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-lg text-base font-semibold hover:bg-gray-100 transition-colors"
//                 >
//                   <FaRobot className="w-4 h-4 text-orange-500" />
//                   <span className={`${inter.className} font-semibold`}>Start AI Lead Generation</span>
//                 </Link>

//                 <Link 
//                   href="/demo"
//                   className="inline-flex items-center px-8 py-4 rounded-lg text-base font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-200"
//                 >
//                   <span className={`${inter.className} font-semibold`}>Watch Demo</span>
//                 </Link>
//               </div>

//               <motion.p
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.6, delay: 1.7 }}
//                 className={`${inter.className} text-white/60 text-sm`}
//               >
//                 Join 2,000+ businesses already using AI to scale their Reddit marketing
//               </p>
//             </div>

//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };
