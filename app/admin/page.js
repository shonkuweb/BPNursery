"use client";
import { useState, useEffect } from "react";
import {
  FiUpload,
  FiTrash2,
  FiPlus,
  FiTag,
  FiEdit2,
  FiBox,
  FiShoppingBag,
  FiSettings,
  FiSearch,
  FiExternalLink,
  FiX
} from "react-icons/fi";
import Link from "next/link";
import imageCompression from 'browser-image-compression';

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // 4 Main Tabs: "products" | "categories" | "orders" | "settings"
  const [activeTab, setActiveTab] = useState("products");

  // Products Subview on Mobile: "list" | "form"
  const [productSubView, setProductSubView] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit mode state
  const [editingProductId, setEditingProductId] = useState(null);
  const [existingImage, setExistingImage] = useState("");

  // Product form fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [offer, setOffer] = useState("");
  const [file, setFile] = useState(null);
  const [categoryId, setCategoryId] = useState("");

  // Adenium options state
  const [adeniumPrice8, setAdeniumPrice8] = useState("");
  const [adeniumPrice10, setAdeniumPrice10] = useState("");
  const [adeniumPriceSingle, setAdeniumPriceSingle] = useState("");

  // Category form state
  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [categoryFile, setCategoryFile] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryImage, setEditingCategoryImage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  // Temporary feature: auto-select Hoya category on load for new products
  useEffect(() => {
    if (categories.length > 0 && !categoryId && !editingProductId) {
      const hoyaCat = categories.find(c => c.name.toLowerCase() === 'hoya');
      if (hoyaCat) {
        setCategoryId(hoyaCat.id.toString());
        setTitle('Hoya');
        setSlug(`hoya-${Date.now()}`);
        setPrice('450');
        setOldPrice('650');
        setOffer('20% OFF');
      }
    }
  }, [categories, categoryId, editingProductId]);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories")
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      setProducts(Array.isArray(prodData) ? prodData : []);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productSlug) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetch(`/api/products?slug=${productSlug}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  };

  const handleDeleteCategory = async (catSlug) => {
    if (!confirm("Are you sure you want to delete this category? Products in this category will keep their details.")) return;
    try {
      await fetch(`/api/categories?slug=${catSlug}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete category");
    }
  };

  const handleEditCategory = (cat) => {
    setEditingCategoryId(cat.id);
    setCategoryName(cat.name || "");
    setCategorySlug(cat.slug || "");
    setEditingCategoryImage(cat.image || "");
    setCategoryFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setCategoryName("");
    setCategorySlug("");
    setEditingCategoryImage("");
    setCategoryFile(null);
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    if (!categoryName || !categorySlug) return;
    setIsAddingCategory(true);
    try {
      let imageUrl = editingCategoryImage;

      // Upload category image to R2 if selected
      if (categoryFile) {
        const options = {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 800,
          useWebWorker: true
        };
        const compressedFile = await imageCompression(categoryFile, options);
        const formData = new FormData();
        formData.append("file", new File([compressedFile], categoryFile.name, { type: compressedFile.type }));

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || "Failed to upload category image to R2");
        }
        imageUrl = uploadData.url;
      }

      if (editingCategoryId) {
        const res = await fetch("/api/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingCategoryId,
            name: categoryName,
            slug: categorySlug,
            image: imageUrl || undefined
          }),
        });
        if (!res.ok) throw new Error("Failed to update category");
        alert("Category updated successfully!");
      } else {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: categoryName,
            slug: categorySlug,
            image: imageUrl || undefined
          }),
        });
        if (!res.ok) throw new Error("Failed to add category");
        alert("Category added successfully!");
      }

      handleCancelCategoryEdit();
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setIsAddingCategory(false);
    }
  };


  const handleEditProduct = (product) => {
    setEditingProductId(product.id);
    setTitle(product.title || "");
    setSlug(product.slug || "");
    setPrice(product.price || "");
    setOldPrice(product.oldPrice || "");
    setOffer(product.offer || "");
    setExistingImage(product.image || "");
    setCategoryId(product.categoryId ? product.categoryId.toString() : "");
    setFile(null);

    if (product.adeniumOptions) {
      setAdeniumPrice8(product.adeniumOptions["Multigrafted 8\" Pot"] || "");
      setAdeniumPrice10(product.adeniumOptions["Multigrafted 10\" Pot"] || "");
      setAdeniumPriceSingle(product.adeniumOptions["Single Grafted"] || "");
    } else {
      setAdeniumPrice8("");
      setAdeniumPrice10("");
      setAdeniumPriceSingle("");
    }

    setProductSubView("form");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setTitle("");
    setSlug("");
    setPrice("");
    setOldPrice("");
    setOffer("");
    setExistingImage("");
    setFile(null);
    setCategoryId("");
    setAdeniumPrice8("");
    setAdeniumPrice10("");
    setAdeniumPriceSingle("");
    setProductSubView("list");
  };

  const handleCategoryChange = (e) => {
    const newCatId = e.target.value;
    setCategoryId(newCatId);

    // Temporary feature for Hoya category
    const selectedCat = categories.find(c => c.id == newCatId);
    if (selectedCat && selectedCat.name.toLowerCase() === 'hoya' && !editingProductId) {
      setTitle('Hoya');
      setSlug(`hoya-${Date.now()}`);
      setPrice('450');
      setOldPrice('650');
      setOffer('20% OFF');
    }
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (!title || !slug || !price) {
      alert("Title, Slug, and Price are required!");
      return;
    }
    if (!editingProductId && !file) {
      alert("Please choose an image for the new product!");
      return;
    }

    setIsUploading(true);

    try {
      let imageUrl = existingImage;

      // 1. Compress and Upload the image if a new file is selected
      if (file) {
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1200,
          useWebWorker: true
        };
        const compressedFile = await imageCompression(file, options);

        const formData = new FormData();
        formData.append("file", new File([compressedFile], file.name, { type: compressedFile.type }));

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          throw new Error(uploadData.error || "Failed to upload image");
        }

        imageUrl = uploadData.url;
      }

      // 2. Format options
      const isAdenium = categories.find(c => c.id == categoryId)?.name === "Adenium";
      const adeniumOptions = isAdenium ? {
        "Multigrafted 8\" Pot": adeniumPrice8 || null,
        "Multigrafted 10\" Pot": adeniumPrice10 || null,
        "Single Grafted": adeniumPriceSingle || null
      } : undefined;

      const productData = {
        slug,
        title,
        price,
        oldPrice: oldPrice || undefined,
        offer: offer || undefined,
        image: imageUrl,
        categoryId: categoryId ? parseInt(categoryId) : null,
        rating: 5.0,
        reviews: 120,
        adeniumOptions
      };

      let res;
      if (editingProductId) {
        productData.id = editingProductId;
        res = await fetch("/api/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
      } else {
        res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
      }

      if (!res.ok) {
        throw new Error(`Failed to ${editingProductId ? 'update' : 'save'} product`);
      }

      // Reset form and switch to inventory list
      handleCancelEdit();
      fetchData();
      alert(`Product ${editingProductId ? 'updated' : 'added'} successfully!`);

    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!editingProductId) {
      setSlug(newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleCategoryNameChange = (e) => {
    const newName = e.target.value;
    setCategoryName(newName);
    setCategorySlug(newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  // Filter products by search query
  const filteredProducts = products.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = p.title?.toLowerCase().includes(q);
    const slugMatch = p.slug?.toLowerCase().includes(q);
    const cat = categories.find(c => c.id == p.categoryId)?.name?.toLowerCase();
    return titleMatch || slugMatch || (cat && cat.includes(q));
  });

  return (
    <div className="admin-container">
      {/* Top Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <h1 className="admin-header-title">
              BPN Admin <span className="admin-badge-pill">Store</span>
            </h1>
          </div>
          <Link href="/" className="admin-back-btn" target="_blank" rel="noopener noreferrer">
            <FiExternalLink /> View Store
          </Link>
        </div>
      </header>

      {/* 4 Tabs Bar - Sticky, Mobile Optimized */}
      <nav className="admin-tabs-nav" aria-label="Admin Navigation Tabs">
        <div className="admin-tabs-list">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            <FiBox className="tab-icon" />
            <span>Products</span>
            {products.length > 0 && (
              <span className="admin-tab-counter">{products.length}</span>
            )}
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "categories" ? "active" : ""}`}
            onClick={() => setActiveTab("categories")}
          >
            <FiTag className="tab-icon" />
            <span>Categories</span>
            {categories.length > 0 && (
              <span className="admin-tab-counter">{categories.length}</span>
            )}
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <FiShoppingBag className="tab-icon" />
            <span>Orders</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <FiSettings className="tab-icon" />
            <span>Settings</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* ================= TAB 1: PRODUCTS ================= */}
        {activeTab === "products" && (
          <div>
            {/* Sub-navigation Segmented Control */}
            <div className="admin-subnav">
              <button
                type="button"
                className={`admin-subnav-btn ${productSubView === "list" ? "active" : ""}`}
                onClick={() => setProductSubView("list")}
              >
                <FiBox /> Inventory ({products.length})
              </button>
              <button
                type="button"
                className={`admin-subnav-btn ${productSubView === "form" ? "active" : ""}`}
                onClick={() => {
                  if (productSubView !== "form") {
                    setProductSubView("form");
                  }
                }}
              >
                {editingProductId ? (
                  <>
                    <FiEdit2 /> Edit Product
                  </>
                ) : (
                  <>
                    <FiPlus /> Add Product
                  </>
                )}
              </button>
            </div>

            {/* Sub-view A: Product Inventory List */}
            {productSubView === "list" && (
              <section className="admin-card">
                <div className="admin-card-header">
                  <h2>
                    <FiBox /> Products Catalog
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      handleCancelEdit();
                      setProductSubView("form");
                    }}
                    style={{
                      background: '#187a32',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '13px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <FiPlus /> New
                  </button>
                </div>

                {/* Instant Mobile Search */}
                <div className="admin-search-wrapper">
                  <FiSearch className="admin-search-icon" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products by name or category..."
                    className="admin-search-input"
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

                {isLoading ? (
                  <p className="admin-loading">Loading catalog...</p>
                ) : filteredProducts.length === 0 ? (
                  <div className="admin-placeholder-box" style={{ padding: '24px 12px' }}>
                    <p>{searchQuery ? "No products matching your search." : "No products added yet. Tap '+ Add Product' to start."}</p>
                  </div>
                ) : (
                  <div className="admin-product-list">
                    {filteredProducts.map((product) => {
                      const catName = categories.find(c => c.id == product.categoryId)?.name;
                      return (
                        <div key={product.id || product.slug} className="admin-product-item">
                          <div className="admin-product-image">
                            {product.image ? (
                              <img src={product.image} alt={product.title} loading="lazy" />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'grid', placeContent: 'center', color: '#8fa096' }}>
                                <FiBox />
                              </div>
                            )}
                          </div>

                          <div className="admin-product-details">
                            <h3>{product.title}</h3>
                            <div className="admin-product-pricing">
                              ₹{product.price}
                              {product.oldPrice && <span>₹{product.oldPrice}</span>}
                            </div>
                            <div className="admin-tag-badges">
                              {catName && <span className="admin-cat-badge">{catName}</span>}
                              {product.offer && <span className="admin-offer-badge">{product.offer}</span>}
                            </div>
                          </div>

                          <div className="admin-item-actions">
                            <button
                              type="button"
                              onClick={() => handleEditProduct(product)}
                              className="admin-action-btn edit"
                              title="Edit product"
                              aria-label="Edit product"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product.slug)}
                              className="admin-action-btn delete"
                              title="Delete product"
                              aria-label="Delete product"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* Sub-view B: Add / Edit Product Form */}
            {productSubView === "form" && (
              <section className="admin-card">
                <div className="admin-card-header">
                  <h2>
                    {editingProductId ? <FiEdit2 /> : <FiPlus />}
                    {editingProductId ? "Edit Product" : "Add New Product"}
                  </h2>
                  {editingProductId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      style={{
                        background: 'transparent',
                        border: '1px solid #c9d8ce',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '12px',
                        color: '#55685d',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmitProduct} className="admin-form">
                  <div className="form-group">
                    <label>Product Title *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={handleTitleChange}
                      placeholder="e.g. Rare Hoya Compacta"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>URL Slug *</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. rare-hoya-compacta"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={categoryId}
                      onChange={handleCategoryChange}
                    >
                      <option value="">Select a Category (Optional)</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Adenium Specific Options */}
                  {categories.find((c) => c.id == categoryId)?.name === "Adenium" && (
                    <div
                      className="form-group"
                      style={{
                        background: '#f4f9f5',
                        padding: '14px',
                        borderRadius: '12px',
                        border: '1px solid #d8ebd9'
                      }}
                    >
                      <label style={{ color: '#187a32', marginBottom: '8px' }}>
                        Adenium Variations (₹)
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                          type="number"
                          value={adeniumPrice8}
                          onChange={(e) => setAdeniumPrice8(e.target.value)}
                          placeholder={'Multigrafted 8" Pot Price'}
                        />
                        <input
                          type="number"
                          value={adeniumPrice10}
                          onChange={(e) => setAdeniumPrice10(e.target.value)}
                          placeholder={'Multigrafted 10" Pot Price'}
                        />
                        <input
                          type="number"
                          value={adeniumPriceSingle}
                          onChange={(e) => setAdeniumPriceSingle(e.target.value)}
                          placeholder="Single Grafted Price"
                        />
                      </div>
                    </div>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label>Price (₹) *</label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="450"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Old Price (₹)</label>
                      <input
                        type="number"
                        value={oldPrice}
                        onChange={(e) => setOldPrice(e.target.value)}
                        placeholder="650"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Offer Badge (Optional)</label>
                    <input
                      type="text"
                      value={offer}
                      onChange={(e) => setOffer(e.target.value)}
                      placeholder="e.g. 20% OFF"
                    />
                  </div>

                  {/* Mobile Image Upload */}
                  <div className="form-group">
                    <label>Product Image {editingProductId ? "(Optional)" : "*"}</label>
                    <div className="file-upload-wrapper">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files[0])}
                        required={!editingProductId && !existingImage}
                        id="product-file-upload"
                      />
                      <label htmlFor="product-file-upload" className="file-upload-label">
                        <FiUpload className="upload-icon" />
                        <span>
                          {file
                            ? file.name
                            : editingProductId
                            ? "Tap to choose a replacement image..."
                            : "Tap to select product photo"}
                        </span>
                      </label>
                    </div>

                    {/* Image Preview */}
                    {(file || existingImage) && (
                      <div className="admin-image-preview">
                        <img
                          src={file ? URL.createObjectURL(file) : existingImage}
                          alt="Preview"
                        />
                        <span>
                          {file ? "New file selected (will compress automatically)" : "Current product image"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="admin-btn-group">
                    <button
                      type="submit"
                      className="admin-submit-btn"
                      disabled={isUploading}
                    >
                      {isUploading
                        ? "Compressing & Saving..."
                        : editingProductId
                        ? "Update Product"
                        : "Save Product"}
                    </button>
                    {editingProductId && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="admin-cancel-btn"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </section>
            )}
          </div>
        )}

        {/* ================= TAB 2: CATEGORIES ================= */}
        {activeTab === "categories" && (
          <div>
            <section className="admin-card">
              <div className="admin-card-header">
                <h2>
                  {editingCategoryId ? <FiEdit2 /> : <FiPlus />}
                  {editingCategoryId ? "Edit Category" : "Add New Category"}
                </h2>
                {editingCategoryId && (
                  <button
                    type="button"
                    onClick={handleCancelCategoryEdit}
                    style={{
                      background: 'transparent',
                      border: '1px solid #c9d8ce',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      color: '#55685d',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmitCategory} className="admin-form" style={{ marginTop: '12px' }}>
                <div className="form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={handleCategoryNameChange}
                    placeholder="e.g. Bonsai, Ferns, Hoya, Adenium"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category URL Slug *</label>
                  <input
                    type="text"
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    placeholder="e.g. bonsai"
                    required
                  />
                </div>

                {/* Category Image Upload */}
                <div className="form-group">
                  <label>Category Icon / Image (Uploads to R2 for fast loading)</label>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCategoryFile(e.target.files[0])}
                      id="category-file-upload"
                    />
                    <label htmlFor="category-file-upload" className="file-upload-label">
                      <FiUpload className="upload-icon" />
                      <span>
                        {categoryFile
                          ? categoryFile.name
                          : editingCategoryId
                          ? "Tap to choose replacement image..."
                          : "Tap to select circular category image"}
                      </span>
                    </label>
                  </div>

                  {/* Circular Preview */}
                  {(categoryFile || editingCategoryImage) && (
                    <div className="admin-image-preview" style={{ alignItems: 'center' }}>
                      <div
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          border: '2px solid #187a32',
                          flexShrink: 0
                        }}
                      >
                        <img
                          src={categoryFile ? URL.createObjectURL(categoryFile) : editingCategoryImage}
                          alt="Category preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <span>
                        {categoryFile
                          ? "New category image ready (will upload to R2)"
                          : "Current category image"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="admin-btn-group">
                  <button
                    type="submit"
                    disabled={isAddingCategory}
                    className="admin-submit-btn"
                  >
                    {isAddingCategory
                      ? "Uploading to R2 & Saving..."
                      : editingCategoryId
                      ? "Update Category"
                      : "Add Category"}
                  </button>
                  {editingCategoryId && (
                    <button
                      type="button"
                      onClick={handleCancelCategoryEdit}
                      className="admin-cancel-btn"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="admin-card">
              <h2>
                <FiTag /> Existing Categories ({categories.length})
              </h2>
              {categories.length === 0 ? (
                <p className="admin-empty">No categories found.</p>
              ) : (
                <div className="admin-category-list" style={{ marginTop: '12px' }}>
                  {categories.map((cat) => {
                    const count = products.filter((p) => p.categoryId == cat.id).length;
                    return (
                      <div key={cat.id} className="admin-category-item">
                        {/* Circular Thumbnail */}
                        <div className="admin-category-thumb">
                          {cat.image ? (
                            <img src={cat.image} alt={cat.name} loading="lazy" />
                          ) : (
                            <FiTag />
                          )}
                        </div>

                        <div className="admin-category-info">
                          <strong>{cat.name}</strong>
                          <span>
                            slug: /{cat.slug} • {count} {count === 1 ? "product" : "products"}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleEditCategory(cat)}
                            className="admin-action-btn edit"
                            title="Edit Category"
                            aria-label="Edit Category"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.slug)}
                            className="admin-action-btn delete"
                            title="Delete Category"
                            aria-label="Delete Category"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ================= TAB 3: ORDERS ================= */}
        {activeTab === "orders" && (
          <div>
            <section className="admin-card">
              <h2>
                <FiShoppingBag /> Orders Overview
              </h2>
              <div className="admin-stats-grid" style={{ marginTop: '14px' }}>
                <div className="admin-stat-card">
                  <div className="stat-val">0</div>
                  <div className="stat-lbl">Total Orders</div>
                </div>
                <div className="admin-stat-card">
                  <div className="stat-val">0</div>
                  <div className="stat-lbl">Pending</div>
                </div>
                <div className="admin-stat-card">
                  <div className="stat-val">0</div>
                  <div className="stat-lbl">Delivered</div>
                </div>
                <div className="admin-stat-card">
                  <div className="stat-val">₹0</div>
                  <div className="stat-lbl">Revenue</div>
                </div>
              </div>

              <div className="admin-placeholder-box">
                <FiShoppingBag className="box-icon" />
                <h3>Order Management</h3>
                <p>
                  Customer orders submitted via checkout and WhatsApp will be tracked and listed here. You will be able to update order delivery statuses, payment confirmations, and customer details.
                </p>
              </div>
            </section>
          </div>
        )}

        {/* ================= TAB 4: SETTINGS ================= */}
        {activeTab === "settings" && (
          <div>
            <section className="admin-card">
              <h2>
                <FiSettings /> Store Settings
              </h2>
              <div className="admin-settings-group" style={{ marginTop: '14px' }}>
                <div className="admin-setting-item">
                  <div className="admin-setting-info">
                    <strong>Store Domain</strong>
                    <span>Live customer domain</span>
                  </div>
                  <span className="admin-setting-val">bpn.shonku.site</span>
                </div>

                <div className="admin-setting-item">
                  <div className="admin-setting-info">
                    <strong>WhatsApp Business Number</strong>
                    <span>Receives instant checkout order texts</span>
                  </div>
                  <span className="admin-setting-val">+91 9836820811</span>
                </div>

                <div className="admin-setting-item">
                  <div className="admin-setting-info">
                    <strong>Media Cloud Storage</strong>
                    <span>Cloudflare R2 Bucket for fast image loading</span>
                  </div>
                  <span className="admin-setting-val" style={{ background: '#e5f3ff', color: '#0969da' }}>
                    Connected (chf-media)
                  </span>
                </div>

                <div className="admin-setting-item">
                  <div className="admin-setting-info">
                    <strong>Store Status</strong>
                    <span>Online store catalog visibility</span>
                  </div>
                  <span className="admin-setting-val">Active</span>
                </div>
              </div>

              <div className="admin-placeholder-box" style={{ marginTop: '16px' }}>
                <FiSettings className="box-icon" />
                <h3>More Settings Coming Soon</h3>
                <p>
                  Delivery pricing tiers, minimum order values, store banners, and admin credentials settings will be configurable directly from this panel.
                </p>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
