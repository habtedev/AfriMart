"use client";
import dynamic from "next/dynamic";

const CarouselAdminPage = dynamic(() => import("@/components/shared/product/carousel/CarouselAdminPage"), { ssr: false });

export default function CarouselPage() {
  return <CarouselAdminPage />;
}
