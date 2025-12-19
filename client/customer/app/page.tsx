"use client";

import { motion, easeOut } from "framer-motion";
import { CarouselRemote } from "@/components/shared/carousel/CarouselRemote";
import HomeCategoryProductGridRemote from "@/components/shared/product-category/product-category-remote";
import ProductCardSection from "@/components/shared/product-card/ProductCardSection";

/* ---------------- Animations ---------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: easeOut },
  },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function Home() {
  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="relative overflow-hidden"
    >
      {/* ===== Hero / Carousel ===== */}
      <motion.section variants={fadeIn}>
        <CarouselRemote />
      </motion.section>

      {/* ===== Floating Category Section ===== */}
      <motion.section
        variants={fadeUp}
        className="relative z-10 -mt-20 md:-mt-28 lg:-mt-36"
      >
        {/* Glass background */}
        <div className="mx-auto max-w-7xl rounded-3xl bg-background/80 backdrop-blur-xl shadow-2xl border border-border px-4 py-6">
          <HomeCategoryProductGridRemote />
        </div>
      </motion.section>

      {/* ===== Product Cards ===== */}
      <motion.section
        variants={fadeUp}
        className="mt-16 md:mt-24"
      >
        <ProductCardSection />
      </motion.section>
    </motion.main>
  );
}
