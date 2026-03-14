"use client";

import { motion } from "framer-motion";

import { CarouselRemote } from "@/components/shared/carousel/CarouselRemote";
import HomeCategoryProductGridRemote from "@/components/shared/product-category/product-category-remote";
import ProductCardSection from "@/components/shared/product-card/ProductCardSection";

/* ---------------- Motion System ---------------- */

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

const fade = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
    },
  },
};

const scaleSoft = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

/* ---------------- Design Tokens ---------------- */

const containerWidth = "mx-auto max-w-7xl px-4";

const glassCard = `
bg-background/70
backdrop-blur-xl
border border-border/40
shadow-[0_20px_60px_rgba(0,0,0,0.12)]
rounded-3xl
`;

/* ---------------- Page ---------------- */

export default function Home() {
  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={container}
      className="relative overflow-hidden bg-background"
    >

      {/* ================= HERO ================= */}

      <motion.section
        variants={fade}
        className="relative"
      >
        <CarouselRemote />

        {/* hero gradient for depth */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
      </motion.section>


      {/* ================= CATEGORY FLOATING PANEL ================= */}

      <motion.section
        variants={scaleSoft}
        className="relative z-20 -mt-20 md:-mt-28 lg:-mt-32"
      >
        <div className={containerWidth}>
          <div className={`${glassCard} p-6 md:p-8`}>

            <header className="mb-8 text-center">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight">
                Shop by Category
              </h2>

              <p className="mt-2 text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
                Explore curated collections designed for everyday life
              </p>
            </header>

            <HomeCategoryProductGridRemote />

          </div>
        </div>
      </motion.section>


      {/* ================= FEATURED PRODUCTS ================= */}

      <motion.section
        variants={fadeUp}
        className="mt-16 md:mt-24 lg:mt-28"
      >
        <div className={containerWidth}>

          <header className="mb-12 text-center">

            <div className="
            inline-flex
            items-center
            gap-2
            rounded-full
            bg-primary/10
            px-4
            py-1
            text-sm
            font-medium
            text-primary
            mb-4
            ">
              Trending Products
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Best Sellers
            </h2>

            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Popular items chosen by thousands of customers this week
            </p>

          </header>

          <ProductCardSection />

        </div>
      </motion.section>


      {/* ================= TRUST BAR ================= */}

      <motion.section
        variants={fade}
        className="
        mt-16
        border-t
        border-border
        bg-background/80
        backdrop-blur-lg
        "
      >
        <div className={`${containerWidth} py-8`}>

          <div className="
          grid
          grid-cols-2
          md:grid-cols-4
          gap-6
          text-sm
          text-muted-foreground
          text-center
          ">

            <div className="flex flex-col items-center gap-1">
              <span className="text-green-500 text-lg">✓</span>
              Free Shipping
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-green-500 text-lg">✓</span>
              30-Day Returns
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-green-500 text-lg">✓</span>
              Secure Payment
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-green-500 text-lg">✓</span>
              Real-Time Stock
            </div>

          </div>

        </div>
      </motion.section>


      {/* ================= BACKGROUND GLOW ================= */}

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">

        <div className="
        absolute
        -top-40
        left-1/2
        h-[400px]
        w-[400px]
        -translate-x-1/2
        rounded-full
        bg-primary/10
        blur-[140px]
        " />

        <div className="
        absolute
        bottom-0
        right-0
        h-[350px]
        w-[350px]
        rounded-full
        bg-purple-500/10
        blur-[140px]
        " />

      </div>

    </motion.main>
  );
}