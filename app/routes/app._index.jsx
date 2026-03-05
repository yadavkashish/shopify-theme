/*
This file manages the main application logic.
Templates and UI components are imported to keep the file clean.
No Remix dependencies are used.
*/
import React, { useState, useEffect, useCallback } from "react";

// ===========================================
// MOCK TEMPLATES & STYLES (FAQs)
// ===========================================
const UI_STYLES = [
  { id: 'accordion', label: 'Classic Accordion', desc: 'Standard expandable list' },
  { id: 'grid', label: 'Bento Grid', desc: 'Modern card layout' },
  { id: 'minimal', label: 'Minimalist', desc: 'Clean, simple text' }
];

const AccordionTemplate = ({ faqs, config }) => ( <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}> {faqs.map((faq) => ( <div key={faq.id} style={{ border: '1px solid #e1e3e5', borderRadius: `${config.radius}px`, padding: '15px', backgroundColor: 'white' }}> <div style={{ fontWeight: '600', color: '#333' }}>{faq.question || "Question?"}</div> <div style={{ marginTop: '5px', color: '#666', fontSize: '14px' }}>{faq.answer || "Answer goes here."}</div> </div> ))} </div> );
const GridTemplate = ({ faqs, config }) => ( <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}> {faqs.map((faq) => ( <div key={faq.id} style={{ padding: '20px', border: `1px solid ${config.color || '#e1e3e5'}`, borderRadius: `${config.radius}px`, backgroundColor: 'white', borderTop: `4px solid ${config.color}` }}> <h3 style={{ margin: '0 0 10px 0', fontSize: '15px' }}>{faq.question || "Question?"}</h3> <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>{faq.answer || "Answer goes here."}</p> </div> ))} </div> );
const MinimalTemplate = ({ faqs, config }) => ( <div> {faqs.map((faq) => ( <div key={faq.id} style={{ padding: '15px 0', borderBottom: '1px solid #e1e3e5' }}> <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{faq.question || "Question?"}</h3> <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{faq.answer || "Answer goes here."}</p> </div> ))} </div> );

// ===========================================
// MOCK TEMPLATES & STYLES (Hero UI)
// ===========================================
const HERO_STYLES = [
  { id: 'centered', label: 'Centered Focus', desc: 'Text centered over background' },
  { id: 'split', label: 'Split Screen', desc: 'Text on left, image on right' },
];

const HeroCenteredTemplate = ({ content, config }) => (
  <div style={{ background: config.color, color: 'white', padding: '60px 20px', textAlign: 'center', borderRadius: '8px', backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${content.imageUrl || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1000&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
    <h1 style={{ fontSize: '32px', margin: '0 0 10px 0' }}>{content.heading || 'Welcome'}</h1>
    <p style={{ fontSize: '16px', margin: '0 0 20px 0' }}>{content.subheading || 'Subheading'}</p>
    <button style={{ background: 'white', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>{content.buttonText || 'Shop Now'}</button>
  </div>
);

const HeroSplitTemplate = ({ content, config }) => (
  <div style={{ display: 'flex', background: config.color, color: 'white', borderRadius: '8px', overflow: 'hidden' }}>
    <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h1 style={{ fontSize: '28px', margin: '0 0 10px 0' }}>{content.heading || 'Welcome'}</h1>
      <p style={{ fontSize: '14px', margin: '0 0 20px 0' }}>{content.subheading || 'Subheading'}</p>
      <div><button style={{ background: 'white', color: 'black', padding: '10px 20px', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>{content.buttonText || 'Shop Now'}</button></div>
    </div>
    <div style={{ flex: 1, backgroundImage: `url(${content.imageUrl || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1000&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '250px' }}></div>
  </div>
);

// ===========================================
// REUSABLE UI COMPONENTS
// ===========================================
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

// ===========================================
// MAIN COMPONENT
// ===========================================
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

  // STATE: Hero UI
  const [heroContent, setHeroContent] = useState({ heading: "Welcome to Our Store", subheading: "Discover the best products.", buttonText: "Shop Now", buttonUrl: "/collections/all", imageUrl: "" });
  const [heroSettings, setHeroSettings] = useState({ style: "centered", color: "#000000" });
  const [heroDraftSettings, setHeroDraftSettings] = useState(null);

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

      // Load Hero Data
      if (data.heroContent) setHeroContent(data.heroContent);
      setHeroSettings(data.heroSettings || { style: "centered", color: "#000000" });
      setHeroDraftSettings(data.heroSettings || { style: "centered", color: "#000000" });

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

  // ACTIONS (FAQs)
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

  // ACTIONS (Hero UI)
  const handleApplyHeroTheme = async () => {
    await sendApiRequest({ intent: "saveHeroSettings", ...heroDraftSettings });
    setHeroSettings(heroDraftSettings); 
    showToast("Hero Layout Updated!");
    setCurrentView("dashboard");
  };

  const handleSaveHeroContent = async () => {
    await sendApiRequest({ intent: "saveHeroContent", ...heroContent });
    showToast("Hero Content Saved!");
    setCurrentView("dashboard");
  };

  // INITIAL RENDER BLOCK
  if (isInitializing) return <div style={{ padding: "40px", textAlign: "center" }}>Loading App Data...</div>;

  const groupedFaqs = faqs.reduce((acc, faq) => {
    const key = faq.title || "Untitled Set";
    if (!acc[key]) acc[key] = [];
    acc[key].push(faq);
    return acc;
  }, {});

  // VIEW: HERO CONTENT EDITOR
  if (currentView === "hero_editor") {
    return (
      <SPage heading="Manage Hero Content" primaryAction={<SButton onClick={() => setCurrentView("dashboard")}>Cancel</SButton>}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <SStack direction="block" gap="large">
            <SSection heading="Hero Text & Media">
              <SStack direction="block" gap="base">
                <div>
                  <SLabel>Heading</SLabel>
                  <SInput type="text" value={heroContent.heading} onChange={e => setHeroContent({...heroContent, heading: e.target.value})} placeholder="e.g. Welcome to Our Store" />
                </div>
                <div>
                  <SLabel>Subheading</SLabel>
                  <STextArea value={heroContent.subheading} onChange={e => setHeroContent({...heroContent, subheading: e.target.value})} rows="2" placeholder="e.g. Discover the best products." />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <SLabel>Button Text</SLabel>
                    <SInput type="text" value={heroContent.buttonText} onChange={e => setHeroContent({...heroContent, buttonText: e.target.value})} placeholder="Shop Now" />
                  </div>
                  <div>
                    <SLabel>Button URL</SLabel>
                    <SInput type="text" value={heroContent.buttonUrl} onChange={e => setHeroContent({...heroContent, buttonUrl: e.target.value})} placeholder="/collections/all" />
                  </div>
                </div>
                <div>
                  <SLabel>Background Image URL</SLabel>
                  <SInput type="text" value={heroContent.imageUrl} onChange={e => setHeroContent({...heroContent, imageUrl: e.target.value})} placeholder="https://..." />
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Paste a link to an image.</p>
                </div>
              </SStack>
            </SSection>
            <SButton variant="primary" onClick={handleSaveHeroContent} loading={isLoading}>Save Content</SButton>
          </SStack>
        </div>
      </SPage>
    );
  }

  // VIEW: HERO THEME EDITOR
  if (currentView === "hero_theme_editor") {
    return (
      <SPage heading="Customize Hero Layout" primaryAction={<SButton onClick={() => setCurrentView("dashboard")}>Cancel</SButton>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: '20px' }}>
          <div>
            <SSection heading="1. Choose Layout">
              <div style={{ display: 'grid', gap: '10px' }}>
                {HERO_STYLES.map(style => (
                  <div key={style.id} onClick={() => setHeroDraftSettings({ ...heroDraftSettings, style: style.id })}
                    style={{ padding: '12px', border: heroDraftSettings.style === style.id ? '2px solid #005bd3' : '1px solid #e1e3e5', borderRadius: '8px', cursor: 'pointer', background: heroDraftSettings.style === style.id ? '#f0f8ff' : 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid #ccc', background: heroDraftSettings.style === style.id ? '#005bd3' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {heroDraftSettings.style === style.id && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }} />}
                    </div>
                    <div><div style={{ fontWeight: '600', fontSize: '14px' }}>{style.label}</div><div style={{ fontSize: '12px', color: '#666' }}>{style.desc}</div></div>
                  </div>
                ))}
              </div>
            </SSection>
            <SSection heading="2. Background Color">
              <div style={{ marginBottom: '15px' }}>
                <SLabel>Solid Color Overlay / Background</SLabel>
                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                  <input type="color" value={heroDraftSettings.color} onChange={(e) => setHeroDraftSettings({ ...heroDraftSettings, color: e.target.value })} style={{ width: '50px', height: '40px', border: '1px solid #ccc', padding: 0, borderRadius: '4px', cursor: 'pointer' }} />
                  <span style={{ padding: '10px', background: '#f4f4f4', borderRadius: '4px', fontSize: '14px', fontFamily: 'monospace' }}>{heroDraftSettings.color}</span>
                </div>
              </div>
            </SSection>
            <div style={{ marginTop: '20px' }}><SButton variant="primary" onClick={handleApplyHeroTheme} loading={isLoading}>Save & Publish</SButton></div>
          </div>
          <div>
            <div style={{ position: 'sticky', top: '20px', background: '#f1f2f3', border: '1px solid #dcdcdc', borderRadius: '12px', padding: '20px', minHeight: '500px' }}>
              <div style={{ marginBottom: '20px', textAlign: 'center', color: '#666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Live Preview</div>
              {heroDraftSettings.style === 'centered' && <HeroCenteredTemplate content={heroContent} config={heroDraftSettings} />}
              {heroDraftSettings.style === 'split' && <HeroSplitTemplate content={heroContent} config={heroDraftSettings} />}
            </div>
          </div>
        </div>
      </SPage>
    );
  }

  // VIEW: FAQ THEME EDITOR 
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
            </div>
          </div>
        </div>
      </SPage>
    );
  }

  // VIEW: FAQ EDITOR
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

  // VIEW: FAQ LIST 
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

  // VIEW: DASHBOARD (COMBINED)
  return (
    <>
      <SToast message={toastMessage} />
      <SPage heading="App Dashboard">
       

        {/* Hero Section (New) */}
        <div style={{ marginTop: '30px', marginBottom: '15px' }}>
          <SHeading>🖼️ Manage Homepage Hero</SHeading>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          <SCard title="Hero Content" desc="Update your main heading, subheading, and background image." actionLabel="Edit Content" onAction={() => setCurrentView("hero_editor")} />
          <SCard title="Hero Layout" desc={`Current: ${heroSettings.style.charAt(0).toUpperCase() + heroSettings.style.slice(1)} style.`} actionLabel="Change Layout" onAction={() => { setHeroDraftSettings(heroSettings); setCurrentView("hero_theme_editor"); }} />
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e1e3e5', margin: '30px 0' }} />
        
        {/* FAQs Section */}
        <div style={{ marginBottom: '15px' }}>
          <SHeading>❓ Manage FAQs</SHeading>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          <SCard title="Content Manager" desc="Add, edit, or delete question sets and assign them to products." actionLabel="Edit FAQs" onAction={() => setCurrentView("faq_list")} />
          <SCard title="Customize Appearance" desc={`Current: ${settings.style.charAt(0).toUpperCase() + settings.style.slice(1)} style.`} actionLabel="Open Designer" onAction={() => { setDraftSettings(settings); setCurrentView("theme_editor"); }} />
        </div>

      </SPage>
    </>
  );
}