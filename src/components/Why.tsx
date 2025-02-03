import { motion } from "framer-motion";
import FeaturesSectionDemo from "./ui/FeatureSelection";

export default function Why() {
  return (
    <div className="h-screen w-screen overflow-x-hidden flex flex-col justify-center items-center bg-black">
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mb-10 font-Teknaf"
      >
        <h1 className="text-white text-4xl capitalize tracking-wider font-semibold">
          Why was S.Y.N.X. created ?
        </h1>
      </motion.div>
      <div className="w-full px-10">
        <FeaturesSectionDemo />
      </div>
    </div>
  );
}