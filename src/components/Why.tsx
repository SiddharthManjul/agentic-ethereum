import { motion } from "framer-motion";
import FeaturesSectionDemo from "./ui/FeatureSelection";

export default function Why() {
  return (
    <div className="min-h-screen w-full bg-black py-20"> {/* Changed from h-screen and removed overflow control */}
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.2,
          duration: 0.5,
          ease: "easeInOut",
        }}
        className="mb-10 font-Teknaf text-center" // Added text-center
      >
        <h1 className="text-white text-4xl capitalize tracking-wider font-semibold px-4"> {/* Added padding */}
          Why was S.Y.N.X. created ?
        </h1>
      </motion.div>
      <div className="w-full px-4 md:px-10"> {/* Adjusted padding for mobile */}
        <FeaturesSectionDemo />
      </div>
    </div>
  );
}