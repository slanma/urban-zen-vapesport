import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { useEffect } from "react";

const Contact = () => {
  useEffect(() => {
    document.title = "Kontakt — Vapesport";
    const meta =
      document.querySelector('meta[name="description"]') ||
      Object.assign(document.createElement("meta"), { name: "description" });
    meta.setAttribute(
      "content",
      "Kontaktujte Vapesport — Paskovská 636/275, Ostrava-Hrabová. Telefon, e-mail, mapa a kontaktní formulář.",
    );
    if (!meta.parentElement) document.head.appendChild(meta);
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-20">
        <ContactSection />
      </div>
      <Footer />
    </main>
  );
};

export default Contact;
