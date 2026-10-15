import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Nav from "./components/Nav.jsx";
import Home from "./components/Home.jsx";
import YinYang from "./components/YinYang.jsx";
import Elements from "./components/Elements.jsx";
import Bagua from "./components/Bagua.jsx";
import Practice from "./components/Practice.jsx";
import Diagnosis from "./components/Diagnosis.jsx";
import ImageAnalysis from "./components/ImageAnalysis.jsx";
import { PageFoot } from "./components/ui.jsx";
import { readHash } from "./router.js";

const PAGES = { yinyang: YinYang, elements: Elements, bagua: Bagua, practice: Practice, diagnosis: Diagnosis, "image-analysis": ImageAnalysis };

export default function App() {
  const [route, setRoute] = useState(readHash);

  useEffect(() => {
    const on = () => setRoute(prev => {
      const next = readHash();
      if (next.page !== prev.page) window.scrollTo({ top: 0, behavior: "instant" });
      return next;
    });
    window.addEventListener("hashchange", on);
    window.addEventListener("popstate", on);
    return () => { window.removeEventListener("hashchange", on); window.removeEventListener("popstate", on); };
  }, []);

  const Page = PAGES[route.page] || Home;
  const pageKey = PAGES[route.page] ? route.page : "home";

  return (
    <>
      <Nav current={pageKey} />
      <main className="main">
        <AnimatePresence mode="wait">
          <motion.div
            key={pageKey}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <Page item={route.item} />
            <PageFoot current={pageKey} />
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}
