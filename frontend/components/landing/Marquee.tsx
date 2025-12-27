"use client";
import { motion } from "framer-motion";
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

const integrationLogos = [
  "https://cdn.builder.io/api/v1/image/assets/TEMP/628f567b2e485aad67d93fb60e74b1cdabd543e8?placeholderIfAbsent=true",
  "https://cdn.builder.io/api/v1/image/assets/TEMP/2a800b31805310aa7e66a69e5418fa00690c8447?placeholderIfAbsent=true",
  "https://cdn.builder.io/api/v1/image/assets/TEMP/d63f85ba4135dced28843a0b237ce4cbe013537b?placeholderIfAbsent=true",
  "https://cdn.builder.io/api/v1/image/assets/TEMP/10815a12b7490498be53c31b79b84eaf776fcc3f?placeholderIfAbsent=true",
  "https://cdn.builder.io/api/v1/image/assets/TEMP/b8e021d4bf486876d3ccb34b072e74f69a875dc8?placeholderIfAbsent=true",
  "https://cdn.builder.io/api/v1/image/assets/TEMP/90d0c7fccfd7adb0c28de1420add02e558a3bab6?placeholderIfAbsent=true",
  "https://cdn.builder.io/api/v1/image/assets/TEMP/bc4fb40519b953f51853b7dc2634603678258927?placeholderIfAbsent=true",
  "https://cdn.builder.io/api/v1/image/assets/TEMP/c7138e0e05e4a40992417363eabf2705578e66ca?placeholderIfAbsent=true",
  "https://cdn.builder.io/api/v1/image/assets/TEMP/ce88b7a51387b3ed8dbab1cb1ff8b44ed1f53780?placeholderIfAbsent=true"
];

export const IntegrationsMarquee = () => {
  return (
    <section className="bg-black py-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className={`text-lg font-bold text-white/50 ${inter.className}`}>
            Integrates with your favorite tools
          </div>
        </motion.div>
        
        {/* Animated marquee */}
        <div className="overflow-hidden whitespace-nowrap relative w-full">
          <div 
            className="flex w-max"
            style={{ animation: 'marquee 20s linear infinite' }}
          >
            {/* Triple the logos for seamless loop */}
            {[...integrationLogos, ...integrationLogos, ...integrationLogos].map((src, index) => (
              <img 
                key={index}
                src={src}
                alt={`Integration Logo ${(index % integrationLogos.length) + 1}`}
                className="object-contain shrink-0 h-[32px] md:h-[40px] max-md:h-[24px] transition-transform hover:scale-110 mx-6 opacity-60 hover:opacity-100"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
};
