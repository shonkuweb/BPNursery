"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  FiChevronRight,
  FiGrid,
  FiHome,
  FiMenu,
  FiPackage,
  FiSearch,
  FiShoppingBag,
  FiTruck,
  FiUser,
  FiX
} from "react-icons/fi";
import { FaLeaf, FaSeedling, FaTree, FaWhatsapp } from "react-icons/fa";
import { GiFlowerPot, GiFlowerTwirl } from "react-icons/gi";
import { categories as defaultCategories } from "./data/categories";
import { useCart } from "./context/CartContext";

export default function Home() {
  const heroEndRef = useRef(null);
  const [showBottomNav, setShowBottomNav] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [dbCategories, setDbCategories] = useState([]);
  
  const { addItem, items, products, productsLoading, setIsSidebarOpen } = useCart();
  const cartCount = (items || []).reduce((acc, item) => acc + (item.qty || 1), 0);

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDbCategories(data);
      })
      .catch(console.error);
  }, []);

  const filteredProducts = (products || []).filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategoryId ? p.categoryId === parseInt(activeCategoryId) || p.categoryId === activeCategoryId : true;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    const checkHero = () => {
      if (!heroEndRef.current) return;
      const heroEndTop = heroEndRef.current.getBoundingClientRect().top;
      const atTop = window.scrollY <= 4;

      // Show nav right after the hero block ends. Keep it visible while
      // scrolling upward, and hide only when the website top is visible.
      setShowBottomNav((prev) => {
        if (atTop) return false;
        if (heroEndTop <= 0) return true;
        return prev;
      });
    };

    checkHero();
    window.addEventListener("scroll", checkHero, { passive: true });
    window.addEventListener("resize", checkHero);

    return () => {
      window.removeEventListener("scroll", checkHero);
      window.removeEventListener("resize", checkHero);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const activeCategory = dbCategories.find(c => c.id === activeCategoryId || c.id === parseInt(activeCategoryId));
  const isAdenium = activeCategory?.slug?.toLowerCase() === 'adenium' || activeCategory?.name?.toLowerCase() === 'adenium';
  const heroStyle = isAdenium
    ? { background: 'url("https://pub-ce8688bc6c654bcfb99716f7c9373bcd.r2.dev/bpn/1782732499136_c85775c1-ac41-427e-85ce-6bb60f9a3a40__1_.png") center/cover no-repeat' }
    : {};

  return (
    <main className="mobile-page">


      <header className="header">
        <button className="icon-btn" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
          <FiMenu />
        </button>
        <Link href="/" className="header-center" aria-label="Blooming Partners Nursery home" style={{ textDecoration: 'none', color: '#1f6b2c', fontSize: '19px', fontWeight: '800', textAlign: 'center', lineHeight: '1.2', letterSpacing: '-0.3px' }}>
          Blooming Partners
          <span style={{ display: 'block', fontSize: '10px', fontWeight: '700', letterSpacing: '1.5px', color: '#68846f', textTransform: 'uppercase' }}>Nursery</span>
        </Link>
        <div className="header-actions">
          <button className="icon-btn header-cart-btn" aria-label="Shopping bag" onClick={() => setIsSidebarOpen(true)}>
            <FiShoppingBag />
            {cartCount > 0 && <span className="header-cart-badge">{cartCount}</span>}
          </button>
        </div>
      </header>

      <div className="search-wrap">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search rare hoyas, adeniums, pots..." 
            aria-label="Search" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#8fa096',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              <FiX />
            </button>
          )}
        </div>
      </div>

      {!searchQuery && (
        <>
          <section className="hero" style={heroStyle}>
            <div className="hero-overlay">
              <span className="badge">CURATED FLORA</span>
              <h2>Bring Life to Your Home</h2>
              <p>Explore our nursery-fresh collection of exotic & rare indoor plants.</p>
              <button className="cta-btn" onClick={() => {
                const el = document.querySelector('.best-sellers');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}>Shop Collection</button>
            </div>
          </section>
          <div ref={heroEndRef} aria-hidden="true" />

          <div className="notice">
            <p className="notice-track">
              🌿 100% Live Delivery Guarantee • Safe Plant Transit Packaging • Record continuous unboxing video for replacement claims.
            </p>
          </div>
        </>
      )}

      {/* Circular Category Row with Images */}
      <section className="category-row" aria-label="Plant categories">
        {/* All Plants Button */}
        <button
          type="button"
          className={`category-circle-card ${activeCategoryId === null ? 'active' : ''}`}
          onClick={() => setActiveCategoryId(null)}
          aria-label="All Categories"
        >
          <div className="category-circle-avatar">
            <div className="category-circle-inner" style={{ background: activeCategoryId === null ? '#187a32' : '#f0f5f1' }}>
              <FaSeedling style={{ color: activeCategoryId === null ? '#ffffff' : '#187a32', fontSize: '22px' }} />
            </div>
          </div>
          <p>All Plants</p>
        </button>

        {/* Dynamic Category Circles */}
        {dbCategories.map((category) => {
          const isActive = activeCategoryId === category.id;
          return (
            <button
              key={category.id}
              type="button"
              className={`category-circle-card ${isActive ? 'active' : ''}`}
              onClick={() => setActiveCategoryId(isActive ? null : category.id)}
              aria-label={`Category ${category.name}`}
            >
              <div className="category-circle-avatar">
                <div className="category-circle-inner">
                  {category.image ? (
                    <img src={category.image} alt={category.name} loading="lazy" />
                  ) : (
                    <FaLeaf style={{ color: isActive ? '#ffffff' : '#187a32', fontSize: '20px' }} />
                  )}
                </div>
              </div>
              <p>{category.name}</p>
            </button>
          );
        })}
      </section>

      <section className="best-sellers">
        <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{activeCategory ? activeCategory.name : "Trending Plants"}</h2>
          {activeCategory && (
            <button
              onClick={() => setActiveCategoryId(null)}
              style={{
                background: '#eaf4ee',
                color: '#187a32',
                border: 'none',
                borderRadius: '14px',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Show All ✕
            </button>
          )}
        </div>

        <div className="product-grid">
          {productsLoading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>Loading plants...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FiSearch />
              </div>
              <h4>No plants found</h4>
              <p>We couldn't find any plants matching your search. Try adjusting your filters or browsing our categories.</p>
              <button className="clear-search-btn" onClick={() => setSearchQuery("")}>Clear Search</button>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <article key={product.id || product.slug} className="product-card">
                <span className="offer-pill">{product.offer}</span>
                <Link href={`/product/${product.slug}`} className="product-image-link" style={{ display: 'block', overflow: 'hidden' }}>
                  <img src={product.image} alt={product.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                </Link>
                <div className="product-info">
                  <p className="product-title">{product.title}</p>
                  <p className="product-rating">☆ ☆ ☆ ☆ ☆ 5.0 | 120 Reviews</p>
                  <div className="price-row">
                    <strong>₹{product.price}</strong>
                    {product.oldPrice && <span>₹{product.oldPrice}</span>}
                  </div>
                  <button className="add-btn" onClick={() => addItem(product.slug, 1)}>
                    Add to Cart
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {menuOpen && <button className="menu-overlay" aria-label="Close menu overlay" onClick={() => setMenuOpen(false)} />}
      <aside className={`side-menu ${menuOpen ? "open" : ""}`} aria-label="Website menu">
        <div className="side-menu-head">
          <strong>Menu</strong>
          <button className="icon-btn" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            <FiX />
          </button>
        </div>
        <nav className="side-menu-links">
          <Link href="/" onClick={() => setMenuOpen(false)}>
            Home <FiChevronRight />
          </Link>
          <button type="button" className="side-menu-link-btn" onClick={() => {
            setMenuOpen(false);
            setIsSidebarOpen(true);
          }}>
            Cart <FiChevronRight />
          </button>
          <Link href="/checkout" onClick={() => setMenuOpen(false)}>
            Checkout <FiChevronRight />
          </Link>

        </nav>
        <div className="menu-categories">
          <p>Categories</p>
          <div className="menu-category-grid">
            {dbCategories.map((item) => (
              <button 
                key={item.id} 
                type="button" 
                className="menu-category-item" 
                onClick={() => {
                  setActiveCategoryId(item.id);
                  setMenuOpen(false);
                }}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </aside>



      <nav className={`bottom-nav ${showBottomNav ? "visible" : ""}`} aria-label="Primary navigation">
        <Link href="/" className="bottom-item" aria-label="Home">
          <span className="bottom-icon">
            <FiHome />
          </span>
          <span>Home</span>
        </Link>
        <button className="bottom-item" type="button" aria-label="Menu" onClick={() => setMenuOpen(true)}>
          <span className="bottom-icon">
            <FiGrid />
          </span>
          <span>Menu</span>
        </button>
        <button className="bottom-item" type="button" aria-label="Cart" onClick={() => setIsSidebarOpen(true)}>
          <span className="bottom-icon" style={{ position: 'relative' }}>
            <FiShoppingBag />
            {cartCount > 0 && <span className="bottom-cart-badge">{cartCount}</span>}
          </span>
          <span>Cart</span>
        </button>
        <a href="https://wa.me/919153117740" className="bottom-item" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
          <span className="bottom-icon" style={{ color: '#25D366' }}>
            <FaWhatsapp />
          </span>
          <span>WhatsApp</span>
        </a>
      </nav>
    </main>
  );
}
