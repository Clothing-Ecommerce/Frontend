// src/components/FeaturesSection.tsx
import { Truck, Shield, Headphones } from "lucide-react"; // Import icons

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Truck,
              title: "Free Shipping",
              desc: "Free shipping on orders over $50",
              color: "blue",
            },
            {
              icon: Shield,
              title: "Quality Guarantee",
              desc: "Committed to the best product quality and service",
              color: "green",
            },
            {
              icon: Headphones,
              title: "24/7 Support",
              desc: "Customer support team always ready to serve",
              color: "purple",
            },
          ].map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="text-center group animate-in slide-in-from-bottom duration-1000"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div
                  className={`w-16 h-16 bg-${feature.color}-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent
                    className={`w-8 h-8 text-${feature.color}-600`}
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}