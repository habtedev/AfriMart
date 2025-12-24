"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, LayoutGrid, Tags, Package } from "lucide-react";
import { useState } from "react";

const adminProductOptions = [
  {
    key: "categories",
    label: "Categories",
    description: "Manage product categories (CRUD operations)",
    href: "/admine/products/categories",
    icon: Tags,
    color: "text-blue-600 bg-blue-50",
    hoverColor: "hover:bg-blue-100",
  },
  {
    key: "product-categories-card",
    label: "Category Cards",
    description: "View and organize product category cards",
    href: "/admine/products/product-categories-card",
    icon: LayoutGrid,
    color: "text-green-600 bg-green-50",
    hoverColor: "hover:bg-green-100",
  },
  {
    key: "product-card",
    label: "Product Cards",
    description: "View and manage product cards",
    href: "/admine/products/product-card",
    icon: Package,
    color: "text-purple-600 bg-purple-50",
    hoverColor: "hover:bg-purple-100",
  },
];

export default function AdminProductOptions() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    href: string
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleNavigation(href);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Product Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your products, categories, and inventory
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminProductOptions.map((opt) => {
            const Icon = opt.icon;
            const isHovered = hoveredCard === opt.key;

            return (
              <div
                key={opt.key}
                role="button"
                tabIndex={0}
                aria-label={`Navigate to ${opt.label}`}
                onClick={() => handleNavigation(opt.href)}
                onKeyDown={(e) => handleKeyDown(e, opt.href)}
                onMouseEnter={() => setHoveredCard(opt.key)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-xl transition-all duration-300 ${
                  isHovered ? "transform -translate-y-1" : ""
                }`}
              >
                <Card
                  className={`
                    p-6 h-full border-2
                    ${opt.hoverColor}
                    ${isHovered ? "border-gray-300 shadow-lg" : "border-gray-100"}
                    transition-all duration-300
                    group-hover:shadow-lg
                    group-hover:border-gray-300
                  `}
                >
                  {/* Icon Container */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 rounded-lg ${opt.color} transition-colors duration-300`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                        isHovered ? "translate-x-1" : ""
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {opt.label}
                    </h3>
                    <p className="text-gray-600 text-sm mb-6">
                      {opt.description}
                    </p>
                  </div>

                  {/* Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigation(opt.href);
                    }}
                    className={`
                      w-full transition-all duration-300
                      ${isHovered ? "shadow-md" : ""}
                    `}
                    variant={isHovered ? "default" : "outline"}
                  >
                    Access Module
                  </Button>
                </Card>

                {/* Hover Indicator */}
                <div
                  className={`
                    h-1 mt-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500
                    transition-all duration-300
                    ${isHovered ? "w-full opacity-100" : "w-0 opacity-0"}
                  `}
                />
              </div>
            );
          })}
        </div>

        {/* Stats/Info Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">
                {adminProductOptions.length}
              </span>{" "}
              management modules available
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}