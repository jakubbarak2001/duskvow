"use client";

export default function ScrollToTopLogo() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button onClick={scrollToTop} className="lp-nav-logo">
      Dusk<span>vow</span>
    </button>
  );
}
