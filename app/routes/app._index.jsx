/*
This file manages the main application logic.
Templates and UI components are imported to keep the file clean.
No Remix dependencies are used.
*/
import React, { useState, useEffect, useCallback } from "react";

// Mock FAQ Templates
const UI_STYLES = [
  { id: 'accordion', label: 'Classic Accordion', desc: 'Standard expandable list' },
  { id: 'grid', label: 'Bento Grid', desc: 'Modern card layout' },
  { id: 'minimal', label: 'Minimalist', desc: 'Clean, simple text' },
  { id: 'chat', label: 'Support Bot', desc: 'Conversational style' },
];

const AccordionTemplate = ({ faqs, config }) => ( <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}> {faqs.map((faq) => ( <div key={faq.id} style={{ border: '1px solid #e1e3e5', borderRadius: `${config.radius}px`, padding: '15px', backgroundColor: 'white' }}> <div style={{ fontWeight: '600', color: '#333' }}>{faq.question || "Question?"}</div> <div style={{ marginTop: '5px', color: '#666', fontSize: '14px' }}>{faq.answer || "Answer goes here."}</div> </div> ))} </div> );
const GridTemplate = ({ faqs, config }) => ( <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}> {faqs.map((faq) => ( <div key={faq.id} style={{ padding: '20px', border: `1px solid ${config.color || '#e1e3e5'}`, borderRadius: `${config.radius}px`, backgroundColor: 'white', borderTop: `4px solid ${config.color}` }}> <h3 style={{ margin: '0 0 10px 0', fontSize: '15px' }}>{faq.question || "Question?"}</h3> <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>{faq.answer || "Answer goes here."}</p> </div> ))} </div> );
const MinimalTemplate = ({ faqs, config }) => ( <div> {faqs.map((faq) => ( <div key={faq.id} style={{ padding: '15px 0', borderBottom: '1px solid #e1e3e5' }}> <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{faq.question || "Question?"}</h3> <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{faq.answer || "Answer goes here."}</p> </div> ))} </div> );
const ChatTemplate = ({ faqs, config }) => ( <div style={{ border: '1px solid #e1e3e5', borderRadius: `${config.radius}px`, padding: '15px', background: '#f9fafb' }}> {faqs.map(f => ( <div key={f.id} style={{ alignSelf: 'flex-end', border: `1px solid ${config.color}`, color: config.color, padding: '8px 15px', borderRadius: '15px 15px 0 15px', fontSize: '13px', marginBottom: '10px', background: 'white' }}> {f.question || "Question?"} </div> ))} </div> );

// Mock UI Components
const SPage = ({ children, heading, primaryAction }) => ( <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}> <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}> <h1 style={{ fontSize: "28px", fontWeight: "700", margin: 0, color: "#202223" }}>{heading}</h1> {primaryAction} </div> {children} </div> );
const SButton = ({ children, onClick, variant = "default", tone, loading }) => ( <button onClick={onClick} disabled={loading} style={{ background: variant === 'primary' ? (tone === 'critical' ? '#d82c0d' : '#000') : 'transparent', color: variant === 'primary' ? '#fff' : (tone === 'critical' ? '#d82c0d' : '#005bd3'), border: variant === 'primary' ? 'none' : '1px solid #babfc3', padding: "8px 16px", borderRadius: "4px", cursor: loading ? "wait" : "pointer", fontWeight: "500", fontSize: "14px", opacity: loading ? 0.7 : 1 }}>{loading ? "Saving..." : children}</button> );
const SSection = ({ heading, children }) => ( <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e1e3e5", padding: "20px", marginBottom: "20px", boxShadow: "0 0 0 1px rgba(63, 63, 68, 0.05), 0 1px 3px 0 rgba(63, 63, 68, 0.15)" }}> {heading && <h3 style={{ fontSize: "16px", fontWeight: "600", marginTop: 0, marginBottom: "15px" }}>{heading}</h3>} {children} </div> );
const SStack = ({ children, direction = "row", gap = "10px" }) => ( <div style={{ display: "flex", flexDirection: direction === "block" ? "column" : "row", gap: gap === "large" ? "20px" : "10px" }}>{children}</div> );
const SHeading = ({ children }) => <h2 style={{ fontSize: "16px", fontWeight: "600", margin: "0", color: "#202223" }}>{children}</h2>;
const SInput = (props) => <input style={{ width: "100%", padding: "10px", border: "1px solid #babfc3", borderRadius: "4px", boxSizing: "border-box" }} {...props} />;
const STextArea = (props) => <textarea style={{ width: "100%", padding: "10px", border: "1px solid #babfc3", borderRadius: "4px", boxSizing: "border-box", resize: "vertical" }} {...props} />;
const SLabel = ({ children }) => <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "13px" }}>{children}</label>;
const SCard = ({ title, desc, actionLabel, onAction }) => ( <div style={{ background: "#fff", border: "1px solid #e1e3e5", borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "150px" }}> <div><SHeading>{title}</SHeading><p style={{ margin: "10px 0", color: "#666", fontSize: "14px", lineHeight: "1.5" }}>{desc}</p></div> <SButton onClick={onAction}>{actionLabel}</SButton> </div> );
const SToast = ({ message }) => message ? <div style={{ position: "fixed", bottom: "30px", left: "50%", transform: "translateX(-50%)", background: "#202223", color: "white", padding: "10px 20px", borderRadius: "4px", zIndex: 1000, fontWeight: "500", fontSize: "14px" }}>{message}</div> : null;
const SProductTag = ({ label, onRemove }) => ( <div style={{ display: "inline-flex", alignItems: "center", background: "#e4e5e7", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}> {label} <span onClick={onRemove} style={{ marginLeft: "5px", cursor: "pointer", fontWeight: "bold" }}>×</span> </div> );
const SAddButton = ({ onClick, label }) => ( <div onClick={onClick} style={{ textAlign: "center", padding: "15px", border: "1px dashed #babfc3", borderRadius: "4px", cursor: "pointer", background: "#f9fafb", marginTop: "10px", fontWeight: "600" }}>{label}</div> );

// TESTIMONIAL MOCK DATA & CONFIG
const INITIAL_TESTIMONIALS = [
  { id: 1, title: "Homepage Reviews", author: "Sarah Jenkins", subtitle: "Verified Buyer", rating: 5, content: "Absolutely love this product! It has completely changed my daily routine." },
  { id: 2, title: "Homepage Reviews", author: "David Chen", subtitle: "Tech Enthusiast", rating: 4, content: "Great quality and works exactly as described. The customer service team was also very helpful." },
];

const TESTIMONIAL_UI_STYLES = [
  { id: 'grid', label: 'Bento Grid', desc: 'Modern card layout with stars' },
  { id: 'list', label: 'Stacked List', desc: 'Clean vertical list with avatars' },
  { id: 'minimal', label: 'Minimal Quotes', desc: 'Large text, focus on typography' },
  { id: 'social', label: 'Social Cards', desc: 'Looks like Twitter/Social posts' },
];

const StarRating = ({ rating, color }) => (
  <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
    {[1, 2, 3, 4, 5].map(star => (
      <svg key={star} width="16" height="16" viewBox="0 0 24 24" fill={star <= rating ? color : "#e1e3e5"} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    ))}
  </div>
);

const AvatarPlaceholder = ({ name, color }) => (
  <div style={{ 
    width: '40px', height: '40px', borderRadius: '50%', background: `${color}20`, 
    color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', 
    fontWeight: 'bold', fontSize: '16px', flexShrink: 0 
  }}>
    {name ? name.charAt(0).toUpperCase() : '?'}
  </div>
);

const TestimonialGridTemplate = ({ testimonials, config }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
    {testimonials.map((testi) => (
      <div key={testi.id} style={{ padding: '20px', border: '1px solid #e1e3e5', borderRadius: `${config.radius}px`, backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
        <StarRating rating={testi.rating} color={config.color} />
        <p style={{ margin: '0 0 15px 0', color: '#444', fontSize: '14px', lineHeight: '1.5', flex: 1 }}>"{testi.content}"</p>
        <div>
          <h4 style={{ margin: '0 0 2px 0', fontSize: '14px', fontWeight: 'bold', color: '#202223' }}>{testi.author}</h4>
          <span style={{ fontSize: '12px', color: '#666' }}>{testi.subtitle}</span>
        </div>
      </div>
    ))}
  </div>
);

const TestimonialListTemplate = ({ testimonials, config }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
    {testimonials.map((testi) => (
      <div key={testi.id} style={{ padding: '20px', border: '1px solid #e1e3e5', borderRadius: `${config.radius}px`, backgroundColor: 'white', display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
        <AvatarPlaceholder name={testi.author} color={config.color} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#202223' }}>{testi.author}</h4>
            <span style={{ fontSize: '12px', color: '#666' }}>• {testi.subtitle}</span>
          </div>
          <StarRating rating={testi.rating} color={config.color} />
          <p style={{ margin: '8px 0 0 0', color: '#444', fontSize: '14px', lineHeight: '1.5' }}>{testi.content}</p>
        </div>
      </div>
    ))}
  </div>
);

const TestimonialMinimalTemplate = ({ testimonials, config }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', padding: '20px 0' }}>
    {testimonials.map((testi) => (
      <div key={testi.id} style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ color: config.color, fontSize: '40px', lineHeight: '0.8', opacity: 0.5, marginBottom: '10px' }}>"</div>
        <p style={{ margin: '0 0 20px 0', color: '#202223', fontSize: '18px', fontStyle: 'italic', lineHeight: '1.6' }}>{testi.content}</p>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold', color: '#202223', textTransform: 'uppercase', letterSpacing: '1px' }}>— {testi.author}</h4>
        <span style={{ fontSize: '12px', color: '#666' }}>{testi.subtitle}</span>
      </div>
    ))}
  </div>
);

const TestimonialSocialTemplate = ({ testimonials, config }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
    {testimonials.map((testi) => (
      <div key={testi.id} style={{ padding: '20px', border: '1px solid #e1e3e5', borderRadius: `${config.radius}px`, backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
          <AvatarPlaceholder name={testi.author} color={config.color} />
          <div>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#202223' }}>{testi.author}</h4>
            <span style={{ fontSize: '13px', color: '#666' }}>@{testi.author.replace(/\s+/g, '').toLowerCase()}</span>
          </div>
          <div style={{ marginLeft: 'auto', color: '#1da1f2' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
          </div>
        </div>
        <p style={{ margin: 0, color: '#202223', fontSize: '14px', lineHeight: '1.5' }}>{testi.content}</p>
        <div style={{ marginTop: '15px', color: config.color, fontSize: '13px', fontWeight: '500' }}>
          {testi.rating === 5 ? 'Highly Recommended!' : 'Verified Purchase'}
        </div>
      </div>
    ))}
  </div>
);

export default function Index() {
  const [shop, setShop] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shopDomain = params.get("shop") || "my-store.myshopify.com";
    setShop(shopDomain);
  }, []);

  // STATE: General
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const [toastMessage, setToastMessage] = useState(null);

  // STATE: FAQs
  const [faqs, setFaqs] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [settings, setSettings] = useState({ style: "accordion", color: "#008060", radius: 8 });
  const [draftSettings, setDraftSettings] = useState(null);
  const [formTitle, setFormTitle] = useState("");
  const [formRows, setFormRows] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);
  const [assigningFaqTitle, setAssigningFaqTitle] = useState(null);

  // STATE: Testimonials
  const [testimonials, setTestimonials] = useState([]);
  const [testiMappings, setTestiMappings] = useState([]);
  const [testiSettings, setTestiSettings] = useState({ style: "grid", color: "#ffb800", radius: 12 });
  const [testiDraftSettings, setTestiDraftSettings] = useState(null);
  const [testiFormTitle, setTestiFormTitle] = useState("");
  const [testiFormRows, setTestiFormRows] = useState([]);
  const [testiDeletedIds, setTestiDeletedIds] = useState([]);
  const [assigningTestiTitle, setAssigningTestiTitle] = useState(null);

  // DATA FETCHING
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchInitialData = useCallback(async () => {
    if (!shop) return; 
    try {
      const res = await fetch(`/api/faqs?shop=${shop}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      // Load FAQ Data
      setFaqs(data.faqs || []);
      setMappings(data.mappings || []);
      setSettings(data.settings || { style: "accordion", color: "#008060", radius: 8 });
      setDraftSettings(data.settings || { style: "accordion", color: "#008060", radius: 8 });

      // Load Testimonial Data
      setTestimonials(data.testimonials || []);
      setTestiMappings(data.testiMappings || []);
      setTestiSettings(data.testiSettings || { style: "grid", color: "#ffb800", radius: 12 });
      setTestiDraftSettings(data.testiSettings || { style: "grid", color: "#ffb800", radius: 12 });
    } catch (error) {
      console.error("Failed to fetch data:", error);
      showToast("Error loading data");
    } finally {
      setIsInitializing(false);
    }
  }, [shop]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const sendApiRequest = async (payload) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, shop })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      await fetchInitialData();
      return result;
    } catch (error) {
      console.error("API Error:", error);
      showToast("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // ACTIONS (Original FAQs)
  const handleApplyTheme = async () => {
    await sendApiRequest({ intent: "saveSettings", ...draftSettings });
    setSettings(draftSettings);
    showToast("Storefront Design Updated!");
    setCurrentView("dashboard");
  };

  const handleSaveFaqs = async () => {
    if (!formTitle.trim()) { showToast("Please enter a Group Title"); return; }
    await sendApiRequest({ intent: "saveFaqSet", title: formTitle, questions: formRows, idsToDelete: deletedIds });
    showToast("FAQ Set Saved!");
    setCurrentView("faq_list");
  };

  const handleDeleteSet = async () => {
    if (window.confirm("Delete this entire set?")) {
      await sendApiRequest({ intent: "deleteSet", title: formTitle });
      showToast("Set Deleted!");
      setCurrentView("faq_list");
    }
  };

  const handleOpenProductPicker = useCallback(async (faqTitle) => {
    setAssigningFaqTitle(faqTitle);
    const currentMappings = mappings.filter(m => m.faqTitle === faqTitle);
    const initialSelectionIds = currentMappings.map(m => ({ id: m.productId }));

    try {
      const selected = await window.shopify.resourcePicker({
        type: "product",
        multiple: true,
        action: "select",
        selectionIds: initialSelectionIds,
      });

      if (selected) {
        const productIds = selected.map(p => p.id);
        await sendApiRequest({ intent: "saveProductMapping", faqTitle, productIds });
        showToast(productIds.length > 0 ? `Assigned ${productIds.length} product(s)` : `Removed all products`);
      }
    } catch (error) {
      console.error("Product picker error:", error);
    }
    setAssigningFaqTitle(null);
  }, [mappings]);

  const handleRemoveProduct = async (faqTitle, productId) => {
    await sendApiRequest({ intent: "removeProductMapping", faqTitle, productId });
    showToast("Product removed");
  };

  // ACTIONS (New Testimonials - Now using the Database APIs)
  const handleApplyTestiTheme = async () => {
    await sendApiRequest({ intent: "saveTestiSettings", ...testiDraftSettings });
    setTestiSettings(testiDraftSettings); 
    showToast("Testimonial Design Updated!");
    setCurrentView("dashboard");
  };

  const handleSaveTestimonials = async () => {
    if (!testiFormTitle.trim()) { showToast("Please enter a Testimonial Set Name"); return; }
    await sendApiRequest({ 
      intent: "saveTestimonialSet", 
      title: testiFormTitle, 
      testimonials: testiFormRows, 
      idsToDelete: testiDeletedIds 
    });
    showToast("Testimonial Set Saved!");
    setCurrentView("testi_list");
  };

  const handleDeleteTestiSet = async () => {
    if (window.confirm("Delete this entire Testimonial set?")) {
      await sendApiRequest({ intent: "deleteTestiSet", title: testiFormTitle });
      showToast("Testimonial Set Deleted!");
      setCurrentView("testi_list");
    }
  };

  const handleOpenTestiProductPicker = useCallback(async (testiTitle) => {
    setAssigningTestiTitle(testiTitle);
    const currentMappings = testiMappings.filter(m => m.testiTitle === testiTitle);
    const initialSelectionIds = currentMappings.map(m => ({ id: m.productId }));

    try {
      const selected = await window.shopify.resourcePicker({
        type: "product",
        multiple: true,
        action: "select",
        selectionIds: initialSelectionIds,
      });

      if (selected) {
        const productIds = selected.map(p => p.id);
        await sendApiRequest({ intent: "saveTestiProductMapping", testiTitle, productIds });
        showToast(productIds.length > 0 ? `Assigned ${productIds.length} product(s)` : `Removed all products`);
      }
    } catch (error) {
      console.error("Testimonial Product picker error:", error);
    }
    setAssigningTestiTitle(null);
  }, [testiMappings]);

  const handleRemoveTestiProduct = async (testiTitle, productId) => {
    await sendApiRequest({ intent: "removeTestiProductMapping", testiTitle, productId });
    showToast("Product removed");
  };

  if (isInitializing) return <div style={{ padding: "40px", textAlign: "center" }}>Loading App Data...</div>;

  // RENDER PREPARATION
  const groupedFaqs = faqs.reduce((acc, faq) => {
    const key = faq.title || "Untitled Set";
    if (!acc[key]) acc[key] = [];
    acc[key].push(faq);
    return acc;
  }, {});

  const groupedTestimonials = testimonials.reduce((acc, t) => {
    const key = t.title || "Untitled Set";
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  // VIEW: FAQ THEME EDITOR (Original)
  if (currentView === "theme_editor") {
    const previewFaqs = faqs.length > 0 ? faqs.slice(0, 3) : [{ id: 1, question: "Question?", answer: "Answer." }];
    return (
      <SPage heading="Customize Appearance" primaryAction={<SButton onClick={() => setCurrentView("dashboard")}>Cancel</SButton>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '20px' }}>
          <div>
            <SSection heading="1. Choose Layout">
              <div style={{ display: 'grid', gap: '10px' }}>
                {UI_STYLES.map(style => (
                  <div key={style.id} onClick={() => setDraftSettings({ ...draftSettings, style: style.id })}
                    style={{ padding: '12px', border: draftSettings.style === style.id ? '2px solid #005bd3' : '1px solid #e1e3e5', borderRadius: '8px', cursor: 'pointer', background: draftSettings.style === style.id ? '#f0f8ff' : 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid #ccc', background: draftSettings.style === style.id ? '#005bd3' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {draftSettings.style === style.id && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }} />}
                    </div>
                    <div><div style={{ fontWeight: '600', fontSize: '14px' }}>{style.label}</div><div style={{ fontSize: '12px', color: '#666' }}>{style.desc}</div></div>
                  </div>
                ))}
              </div>
            </SSection>
            <SSection heading="2. Styling">
              <div style={{ marginBottom: '15px' }}>
                <SLabel>Accent Color</SLabel>
                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                  <input type="color" value={draftSettings.color} onChange={(e) => setDraftSettings({ ...draftSettings, color: e.target.value })} style={{ width: '50px', height: '40px', border: '1px solid #ccc', padding: 0, borderRadius: '4px', cursor: 'pointer' }} />
                  <span style={{ padding: '10px', background: '#f4f4f4', borderRadius: '4px', fontSize: '14px', fontFamily: 'monospace' }}>{draftSettings.color}</span>
                </div>
              </div>
              <div><SLabel>Border Radius: {draftSettings.radius}px</SLabel><input type="range" min="0" max="24" value={draftSettings.radius} onChange={(e) => setDraftSettings({ ...draftSettings, radius: parseInt(e.target.value) })} style={{ width: '100%', cursor: 'pointer' }} /></div>
            </SSection>
            <div style={{ marginTop: '20px' }}><SButton variant="primary" onClick={handleApplyTheme} loading={isLoading}>Save & Publish</SButton></div>
          </div>
          <div>
            <div style={{ position: 'sticky', top: '20px', background: '#f1f2f3', border: '1px solid #dcdcdc', borderRadius: '12px', padding: '20px', minHeight: '500px' }}>
              <div style={{ marginBottom: '20px', textAlign: 'center', color: '#666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Live Preview</div>
              {draftSettings.style === 'accordion' && <AccordionTemplate faqs={previewFaqs} config={draftSettings} />}
              {draftSettings.style === 'grid' && <GridTemplate faqs={previewFaqs} config={draftSettings} />}
              {draftSettings.style === 'minimal' && <MinimalTemplate faqs={previewFaqs} config={draftSettings} />}
              {draftSettings.style === 'chat' && <ChatTemplate faqs={previewFaqs} config={draftSettings} />}
            </div>
          </div>
        </div>
      </SPage>
    );
  }

  // VIEW: TESTIMONIAL THEME EDITOR
  if (currentView === "testi_theme_editor") {
    // If empty, fall back to initial mock array just for visual previewing 
    const previewTesti = testimonials.length > 0 ? testimonials.slice(0, 3) : INITIAL_TESTIMONIALS;
    return (
      <SPage heading="Customize Testimonials" primaryAction={<SButton onClick={() => setCurrentView("dashboard")}>Cancel</SButton>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: '20px' }}>
          <div>
            <SSection heading="1. Choose Layout">
              <div style={{ display: 'grid', gap: '10px' }}>
                {TESTIMONIAL_UI_STYLES.map(style => (
                  <div key={style.id} onClick={() => setTestiDraftSettings({ ...testiDraftSettings, style: style.id })}
                    style={{ padding: '12px', border: testiDraftSettings.style === style.id ? '2px solid #005bd3' : '1px solid #e1e3e5', borderRadius: '8px', cursor: 'pointer', background: testiDraftSettings.style === style.id ? '#f0f8ff' : 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid #ccc', background: testiDraftSettings.style === style.id ? '#005bd3' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {testiDraftSettings.style === style.id && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }} />}
                    </div>
                    <div><div style={{ fontWeight: '600', fontSize: '14px' }}>{style.label}</div><div style={{ fontSize: '12px', color: '#666' }}>{style.desc}</div></div>
                  </div>
                ))}
              </div>
            </SSection>
            <SSection heading="2. Styling">
              <div style={{ marginBottom: '15px' }}>
                <SLabel>Accent Color (Stars)</SLabel>
                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                  <input type="color" value={testiDraftSettings.color} onChange={(e) => setTestiDraftSettings({ ...testiDraftSettings, color: e.target.value })} style={{ width: '50px', height: '40px', border: '1px solid #ccc', padding: 0, borderRadius: '4px', cursor: 'pointer' }} />
                  <span style={{ padding: '10px', background: '#f4f4f4', borderRadius: '4px', fontSize: '14px', fontFamily: 'monospace' }}>{testiDraftSettings.color}</span>
                </div>
              </div>
              <div><SLabel>Border Radius: {testiDraftSettings.radius}px</SLabel><input type="range" min="0" max="24" value={testiDraftSettings.radius} onChange={(e) => setTestiDraftSettings({ ...testiDraftSettings, radius: parseInt(e.target.value) })} style={{ width: '100%', cursor: 'pointer' }} /></div>
            </SSection>
            <div style={{ marginTop: '20px' }}><SButton variant="primary" onClick={handleApplyTestiTheme} loading={isLoading}>Save & Publish</SButton></div>
          </div>
          <div>
            <div style={{ position: 'sticky', top: '20px', background: '#f1f2f3', border: '1px solid #dcdcdc', borderRadius: '12px', padding: '20px', minHeight: '500px' }}>
              <div style={{ marginBottom: '20px', textAlign: 'center', color: '#666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Live Preview</div>
              {testiDraftSettings.style === 'grid' && <TestimonialGridTemplate testimonials={previewTesti} config={testiDraftSettings} />}
              {testiDraftSettings.style === 'list' && <TestimonialListTemplate testimonials={previewTesti} config={testiDraftSettings} />}
              {testiDraftSettings.style === 'minimal' && <TestimonialMinimalTemplate testimonials={previewTesti} config={testiDraftSettings} />}
              {testiDraftSettings.style === 'social' && <TestimonialSocialTemplate testimonials={previewTesti} config={testiDraftSettings} />}
            </div>
          </div>
        </div>
      </SPage>
    );
  }

  // VIEW: FAQ EDITOR (Original)
  if (currentView === "faq_editor") {
    const isEditing = formRows.some(row => row.id && !row.id.toString().includes("temp"));
    return (
      <SPage heading="Manage FAQ Set" primaryAction={<SButton onClick={() => setCurrentView("faq_list")}>Cancel</SButton>}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <SStack direction="block" gap="large">
            <SSection heading="Set Name">
              <SInput type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Size Guide" required />
            </SSection>
            {formRows.map((row, index) => (
              <SSection key={index} heading={`Question #${index + 1}`}>
                <div style={{ position: "relative" }}>
                  {formRows.length > 1 && (
                    <div style={{ position: "absolute", top: "-45px", right: "0" }}>
                      <SButton variant="plain" tone="critical" onClick={() => {
                        const r = formRows[index];
                        if (r.id) setDeletedIds([...deletedIds, r.id]);
                        setFormRows(formRows.filter((_, i) => i !== index));
                      }}>Remove</SButton>
                    </div>
                  )}
                  <SStack direction="block" gap="base">
                    <div><SLabel>Question</SLabel><SInput type="text" value={row.question} onChange={(e) => { const n = [...formRows]; n[index].question = e.target.value; setFormRows(n); }} /></div>
                    <div><SLabel>Answer</SLabel><STextArea value={row.answer} onChange={(e) => { const n = [...formRows]; n[index].answer = e.target.value; setFormRows(n); }} rows="4" /></div>
                  </SStack>
                </div>
              </SSection>
            ))}
            <SAddButton onClick={() => setFormRows([...formRows, { id: "temp_" + Date.now(), question: "", answer: "" }])} label="+ Add question" />
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
              <SButton variant="primary" onClick={handleSaveFaqs} loading={isLoading}>Save Set</SButton>
              {isEditing && <SButton variant="primary" tone="critical" onClick={(e) => { e.preventDefault(); handleDeleteSet(); }}>Delete Set</SButton>}
            </div>
          </SStack>
        </div>
      </SPage>
    );
  }

  // VIEW: TESTIMONIAL EDITOR
  if (currentView === "testi_editor") {
    const isEditing = testiFormRows.some(row => row.id && !row.id.toString().includes("temp"));
    return (
      <SPage heading="Manage Testimonials" primaryAction={<SButton onClick={() => setCurrentView("testi_list")}>Cancel</SButton>}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <SStack direction="block" gap="large">
            <SSection heading="Set Name">
              <SInput type="text" value={testiFormTitle} onChange={(e) => setTestiFormTitle(e.target.value)} placeholder="e.g. Homepage Reviews" required />
            </SSection>
            
            {testiFormRows.map((row, index) => (
              <SSection key={row.id || index} heading={`Testimonial #${index + 1}`}>
                <div style={{ position: "relative" }}>
                  {testiFormRows.length > 1 && (
                    <div style={{ position: "absolute", top: "-45px", right: "0" }}>
                        <SButton variant="plain" tone="critical" onClick={() => {
                          const r = testiFormRows[index];
                          if (r.id) setTestiDeletedIds([...testiDeletedIds, r.id]);
                          setTestiFormRows(testiFormRows.filter((_, i) => i !== index));
                        }}>Remove</SButton>
                    </div>
                  )}
                  <SStack direction="block" gap="base">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div>
                        <SLabel>Customer Name</SLabel>
                        <SInput type="text" value={row.author} placeholder="Sarah Jenkins" onChange={(e) => { const n = [...testiFormRows]; n[index].author = e.target.value; setTestiFormRows(n); }} />
                      </div>
                      <div>
                        <SLabel>Role / Location</SLabel>
                        <SInput type="text" value={row.subtitle} placeholder="Verified Buyer" onChange={(e) => { const n = [...testiFormRows]; n[index].subtitle = e.target.value; setTestiFormRows(n); }} />
                      </div>
                    </div>
                    <div>
                        <SLabel>Rating</SLabel>
                        <select style={{ width: "100%", padding: "10px 12px", border: "1px solid #babfc3", borderRadius: "4px" }} value={row.rating} onChange={(e) => { const n = [...testiFormRows]; n[index].rating = parseInt(e.target.value); setTestiFormRows(n); }}>
                          <option value={5}>5 Stars (Excellent)</option>
                          <option value={4}>4 Stars (Good)</option>
                          <option value={3}>3 Stars (Average)</option>
                          <option value={2}>2 Stars (Poor)</option>
                          <option value={1}>1 Star (Terrible)</option>
                        </select>
                    </div>
                    <div>
                        <SLabel>Review Content</SLabel>
                        <STextArea value={row.content} placeholder="This product is amazing..." onChange={(e) => { const n = [...testiFormRows]; n[index].content = e.target.value; setTestiFormRows(n); }} rows="4" />
                    </div>
                  </SStack>
                </div>
              </SSection>
            ))}
            
            <SAddButton onClick={() => setTestiFormRows([...testiFormRows, { id: "temp_" + Date.now(), author: "", subtitle: "", rating: 5, content: "" }])} label="+ Add Testimonial" />
            
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
              <SButton variant="primary" onClick={handleSaveTestimonials} loading={isLoading}>Save Set</SButton>
              {isEditing && <SButton variant="primary" tone="critical" onClick={(e) => { e.preventDefault(); handleDeleteTestiSet(); }}>Delete Set</SButton>}
            </div>
          </SStack>
        </div>
      </SPage>
    );
  }

  // VIEW: FAQ LIST (Original)
  if (currentView === "faq_list") {
    return (
      <SPage heading="FAQ Manager" primaryAction={<SButton onClick={() => setCurrentView("dashboard")}>Back to Dashboard</SButton>}>
        <SSection heading="Your FAQ Sets">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <p style={{ color: "#666", margin: 0, fontSize: "14px" }}>Manage groups of questions and assign them to products.</p>
            <SButton variant="primary" onClick={() => { setFormTitle(""); setFormRows([{ id: "temp_init", question: "", answer: "" }]); setDeletedIds([]); setCurrentView("faq_editor"); }}>+ Create New Set</SButton>
          </div>
          <SStack direction="block" gap="base">
            {Object.entries(groupedFaqs).map(([title, faqList]) => {
              const assignedProducts = mappings.filter(m => m.faqTitle === title);
              return (
                <div key={title} style={{ background: "#fff", border: "1px solid #e1e3e5", borderRadius: "8px", padding: "16px", display: "flex", flexDirection: "column", gap: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div><h3 style={{ margin: "0 0 5px 0", fontSize: "16px", fontWeight: "600" }}>{title}</h3><p style={{ margin: 0, color: "#666", fontSize: "14px" }}>{faqList.length} question{faqList.length !== 1 ? "s" : ""}</p></div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <SButton onClick={() => handleOpenProductPicker(title)} loading={assigningFaqTitle === title}>🔗 Choose Products</SButton>
                      <SButton onClick={() => { setFormTitle(title === "Untitled Set" ? "" : title); setFormRows(faqList.map(f => ({ ...f }))); setDeletedIds([]); setCurrentView("faq_editor"); }}>Edit</SButton>
                    </div>
                  </div>
                  {assignedProducts.length > 0 && (
                    <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e1e3e5" }}>
                      <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#666", textTransform: "uppercase", letterSpacing: "0.5px" }}>Assigned Products ({assignedProducts.length})</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {assignedProducts.map(mp => (
                          <SProductTag key={mp.id} label={mp.productId.replace("gid://shopify/Product/", "Product #")} onRemove={() => handleRemoveProduct(title, mp.productId)} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {Object.keys(groupedFaqs).length === 0 && <div style={{ textAlign: "center", padding: "40px", color: "#8c9196" }}>No sets found. Create your first FAQ set!</div>}
          </SStack>
        </SSection>
      </SPage>
    );
  }

  // VIEW: TESTIMONIAL LIST (Updated to include Product Picker functionality)
  if (currentView === "testi_list") {
    return (
      <SPage heading="Testimonials Manager" primaryAction={<SButton onClick={() => setCurrentView("dashboard")}>Back to Dashboard</SButton>}>
        <SSection heading="Your Testimonial Sets">
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <p style={{ color: "#666", margin: 0, fontSize: "14px" }}>Manage collections of reviews to display on your store.</p>
              <SButton variant="primary" onClick={() => { 
                setTestiFormTitle(""); 
                setTestiFormRows([{ id: "temp_init", author: "", subtitle: "", rating: 5, content: "" }]); 
                setTestiDeletedIds([]); 
                setCurrentView("testi_editor"); 
              }}>+ Create Testimonial Set</SButton>
           </div>
           
           <SStack direction="block" gap="base">
             {Object.entries(groupedTestimonials).map(([title, list]) => {
               // Filter mapped products for this specific testimonial set
               const assignedProducts = testiMappings.filter(m => m.testiTitle === title);
               
               return (
                 <div key={title} style={{ background: "#fff", border: "1px solid #e1e3e5", borderRadius: "8px", padding: "16px", display: "flex", flexDirection: "column", gap: "15px" }}>
                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                     <div>
                       <h3 style={{ margin: "0 0 5px 0", fontSize: "16px", fontWeight: "600" }}>{title}</h3>
                       <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>{list.length} review(s)</p>
                     </div>
                     <div style={{ display: "flex", gap: "10px" }}>
                       {/* Hooked up to the real product picker */}
                       <SButton onClick={() => handleOpenTestiProductPicker(title)} loading={assigningTestiTitle === title}>🔗 Choose Products</SButton>
                       <SButton onClick={() => { 
                         setTestiFormTitle(title === "Untitled Set" ? "" : title); 
                         setTestiFormRows(list.map(t => ({...t}))); 
                         setTestiDeletedIds([]); 
                         setCurrentView("testi_editor"); 
                       }}>Edit Set</SButton>
                     </div>
                   </div>
                   
                   {/* Product Tags rendering block for Testimonials */}
                   {assignedProducts.length > 0 && (
                    <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e1e3e5" }}>
                      <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#666", textTransform: "uppercase", letterSpacing: "0.5px" }}>Assigned Products ({assignedProducts.length})</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {assignedProducts.map(mp => (
                          <SProductTag key={mp.id} label={mp.productId.replace("gid://shopify/Product/", "Product #")} onRemove={() => handleRemoveTestiProduct(title, mp.productId)} />
                        ))}
                      </div>
                    </div>
                  )}

                 </div>
               )
             })}
             {Object.keys(groupedTestimonials).length === 0 && <div style={{ textAlign: "center", padding: "40px", color: "#8c9196" }}>No reviews found.</div>}
           </SStack>
        </SSection>
      </SPage>
    );
  }

  // VIEW: DASHBOARD (COMBINED)
  return (
    <>
      <SToast message={toastMessage} />
      <SPage heading="App Dashboard">
        <div style={{ background: "#f0f8ff", border: "1px solid #cce0ff", borderRadius: "8px", padding: "16px 20px", marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><h3 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "600", color: "#004085" }}>🚀 Enable on Storefront</h3><p style={{ margin: 0, color: "#004085", fontSize: "14px" }}>Turn on App Embed blocks in your theme settings to display FAQs and Testimonials.</p></div>
          <SButton onClick={() => window.open(`https://admin.shopify.com`, '_blank')}>Open Theme Editor</SButton>
        </div>
        
        {/* FAQs Section */}
        <div style={{ marginTop: '30px', marginBottom: '15px' }}>
          <SHeading>❓ Manage FAQs</SHeading>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          <SCard title="Content Manager" desc="Add, edit, or delete question sets and assign them to products." actionLabel="Edit FAQs" onAction={() => setCurrentView("faq_list")} />
          <SCard title="Customize Appearance" desc={`Current: ${settings.style.charAt(0).toUpperCase() + settings.style.slice(1)} style.`} actionLabel="Open Designer" onAction={() => { setDraftSettings(settings); setCurrentView("theme_editor"); }} />
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e1e3e5', margin: '30px 0' }} />

        {/* Testimonials Section (New) */}
        <div style={{ marginBottom: '15px' }}>
          <SHeading>💬 Manage Testimonials</SHeading>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          <SCard title="Content Manager" desc="Add, edit, or group customer testimonials into sets." actionLabel="Edit Testimonials" onAction={() => setCurrentView("testi_list")} />
          <SCard title="Customize Appearance" desc={`Current: ${testiSettings.style.charAt(0).toUpperCase() + testiSettings.style.slice(1)} style.`} actionLabel="Open Designer" onAction={() => { setTestiDraftSettings(testiSettings); setCurrentView("testi_theme_editor"); }} />
        </div>

      </SPage>
    </>
  );
}