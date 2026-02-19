/*
This file manages the main application logic.
Templates and UI components are imported to keep the file clean.
*/
import { useState, useEffect, useCallback } from "react";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { AccordionTemplate, GridTemplate, MinimalTemplate, ChatTemplate, UI_STYLES } from "../components/FaqTemplates";
import {
  SPage, SButton, SSection, SStack, SHeading, SInput, STextArea, SLabel,
  SCard, SToast, SProductTag, SAddButton
} from "../components/AppComponents";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  return { shop: session.shop };
};

export default function Index() {
  const { shop } = useLoaderData();

  // --- STATE ---
  const [faqs, setFaqs] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [settings, setSettings] = useState({ style: "accordion", color: "#008060", radius: 8 });
  const [draftSettings, setDraftSettings] = useState(null);

  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const [toastMessage, setToastMessage] = useState(null);

  const [formTitle, setFormTitle] = useState("");
  const [formRows, setFormRows] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);
  const [assigningFaqTitle, setAssigningFaqTitle] = useState(null);

  // --- DATA FETCHING ---
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchInitialData = async () => {
    try {
      const res = await fetch(`/api/faqs?shop=${shop}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setFaqs(data.faqs || []);
      setMappings(data.mappings || []);
      setSettings(data.settings || { style: "accordion", color: "#008060", radius: 8 });
      setDraftSettings(data.settings || { style: "accordion", color: "#008060", radius: 8 });
    } catch (error) {
      console.error("Failed to fetch data:", error);
      showToast("Error loading data");
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => { fetchInitialData(); }, [shop]);

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

  // --- ACTIONS ---
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
      const selected = await shopify.resourcePicker({
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

  if (isInitializing) return <div style={{ padding: "40px", textAlign: "center" }}>Loading App Data...</div>;

  // --- RENDER ---
  const groupedFaqs = faqs.reduce((acc, faq) => {
    const key = faq.title || "Untitled Set";
    if (!acc[key]) acc[key] = [];
    acc[key].push(faq);
    return acc;
  }, {});

  // VIEW 1: THEME EDITOR
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

  // VIEW 2: FAQ EDITOR
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

  // VIEW 3: FAQ LIST
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

  // VIEW 4: DASHBOARD
  return (
    <>
      <SToast message={toastMessage} />
      <SPage heading="App Dashboard">
        <div style={{ background: "#f0f8ff", border: "1px solid #cce0ff", borderRadius: "8px", padding: "16px 20px", marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><h3 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "600", color: "#004085" }}>🚀 Enable on Storefront</h3><p style={{ margin: 0, color: "#004085", fontSize: "14px" }}>Turn on App Embed in your theme settings to display FAQs on product pages.</p></div>
          <SButton onClick={() => window.open(`https://admin.shopify.com`, '_blank')}>Open Theme Editor</SButton>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginTop: "20px" }}>
          <SCard title="❓ Manage FAQs" desc="Add, edit, or delete question sets and assign them to products." actionLabel="Edit Content" onAction={() => setCurrentView("faq_list")} />
          <SCard title="🎨 Customize Look" desc={`Current: ${settings.style.charAt(0).toUpperCase() + settings.style.slice(1)} style.`} actionLabel="Open Designer" onAction={() => { setDraftSettings(settings); setCurrentView("theme_editor"); }} />
          <SCard title="📊 Analytics" desc="View engagement stats." actionLabel="View Reports" onAction={() => showToast("Coming soon!")} variant="plain" />
        </div>
      </SPage>
    </>
  );
}