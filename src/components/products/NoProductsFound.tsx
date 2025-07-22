import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

interface NoProductsFoundProps {
  onClearFilters: () => void;
}

export function NoProductsFound({ onClearFilters }: NoProductsFoundProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <div className="text-gray-400 mb-4">
        <Search className="h-16 w-16 mx-auto" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No products found
      </h3>
      <p className="text-gray-600 mb-4">
        Try adjusting your filters or search terms
      </p>
      <Button onClick={onClearFilters}>Clear Filters</Button>
    </motion.div>
  );
}