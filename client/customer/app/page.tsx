"use client";

import { motion } from "framer-motion";

import { CarouselRemote } from "@/components/shared/carousel/CarouselRemote";
import HomeCategoryProductGridRemote from "@/components/shared/product-category/product-category-remote";
import ProductCardSection from "@/components/shared/product-card/ProductCardSection";
import Footer from "@/components/shared/footer/footer";

/* -------------------------------------------------------------------------- */
/*                                Motion Tokens                               */
/* -------------------------------------------------------------------------- */

const motionContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.12,
    },
  },
};

const motionFadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

const motionFade = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.7 },
  },
};

const motionScale = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

/* -------------------------------------------------------------------------- */
/*                               Design Tokens                                */
/* -------------------------------------------------------------------------- */

const layout = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

const glassPanel = `
bg-background/70
backdrop-blur-xl
border border-border/40
shadow-[0_20px_60px_rgba(0,0,0,0.12)]
rounded-3xl
`;

/* -------------------------------------------------------------------------- */
/*                                  Page                                      */
/* -------------------------------------------------------------------------- */

export default function Home() {
  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={motionContainer}
      className="relative overflow-hidden bg-background"
    >

      {/* ------------------------------------------------------------------ */}
      {/* HERO SECTION                                                       */}
      {/* ------------------------------------------------------------------ */}

      <motion.section
        variants={motionFade}
        className="relative"
      >
        <CarouselRemote />

        {/* subtle depth overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
      </motion.section>


      {/* ------------------------------------------------------------------ */}
      {/* CATEGORY PANEL                                                     */}
      {/* ------------------------------------------------------------------ */}

      <motion.section
        variants={motionScale}
        className="relative z-20 -mt-20 md:-mt-28 lg:-mt-32"
      >
        <div className={layout}>

          <div className={`${glassPanel} p-6 md:p-8 lg:p-10`}>

            <header className="text-center mb-8">

              <h2 className="
              text-2xl
              md:text-3xl
              lg:text-4xl
              font-semibold
              tracking-tight
              ">
                Shop by Category
              </h2>

              <p className="
              mt-3
              text-muted-foreground
              text-base
              md:text-lg
              max-w-xl
              mx-auto
              ">
                Explore curated collections crafted for modern living
              </p>

            </header>

            <HomeCategoryProductGridRemote />

          </div>

        </div>
      </motion.section>


      {/* ------------------------------------------------------------------ */}
      {/* FEATURED PRODUCTS                                                  */}
      {/* ------------------------------------------------------------------ */}

      <motion.section
        variants={motionFadeUp}
        className="mt-20 md:mt-24 lg:mt-28"
      >

        <div className={layout}>

          <header className="text-center mb-12">

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

            <h2 className="
            text-3xl
            md:text-4xl
            lg:text-5xl
            font-bold
            tracking-tight
            ">
              Best Sellers
            </h2>

            <p className="
            mt-3
            text-muted-foreground
            max-w-2xl
            mx-auto
            ">
              Discover the most loved products by thousands of customers
              this week.
            </p>

          </header>

          <ProductCardSection />

        </div>

      </motion.section>


      {/* ------------------------------------------------------------------ */}
      {/* TRUST FEATURES BAR                                                 */}
      {/* ------------------------------------------------------------------ */}

      <motion.section
        variants={motionFade}
        className="
        mt-20
        border-t
        border-border
        bg-background/80
        backdrop-blur-lg
        "
      >
        <div className={`${layout} py-8`}>

          <div className="
          grid
          grid-cols-2
          md:grid-cols-4
          gap-6
          text-sm
          text-muted-foreground
          text-center
          ">

            <TrustItem label="Free Shipping" />
            <TrustItem label="30-Day Returns" />
            <TrustItem label="Secure Payment" />
            <TrustItem label="Real-Time Stock" />

          </div>

        </div>
      </motion.section>


      {/* ------------------------------------------------------------------ */}
      {/* FOOTER                                                             */}
      {/* ------------------------------------------------------------------ */}

      <Footer />


      {/* ------------------------------------------------------------------ */}
      {/* BACKGROUND GLOW EFFECT                                             */}
      {/* ------------------------------------------------------------------ */}

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


/* -------------------------------------------------------------------------- */
/*                           Reusable Trust Item                              */
/* -------------------------------------------------------------------------- */

function TrustItem({ label }) {
  return (
    <div className="flex flex-col items-center gap-1">

      <span className="text-green-500 text-lg">
        ✓
      </span>

      {label}

    </div>
  );
}