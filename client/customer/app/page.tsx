
import { CarouselRemote } from "@/components/shared/carousel/CarouselRemote";
import HomeCategoryProductGridRemote from "@/components/shared/product-category/product-category-remote";

export default function Home() {
  return (
    <>
      <CarouselRemote />
      <HomeCategoryProductGridRemote />
    </>
  );
}
