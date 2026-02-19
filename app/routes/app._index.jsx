import React, { useState, useEffect } from "react";

// --- UI DATA & TEMPLATES ---
const UI_STYLES = [
  { id: 'accordion', label: 'Classic Accordion', desc: 'Standard expandable list' },
  { id: 'grid', label: 'Bento Grid', desc: 'Modern card layout' },
  { id: 'minimal', label: 'Minimalist', desc: 'Clean, simple text' },
  { id: 'chat', label: 'Support Bot', desc: 'Conversational style' },
];

const AccordionTemplate = ({ faqs, config }) => {
  const [openId, setOpenId] = useState(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div key={faq.id} style={{ border: '1px solid #e1e3e5', borderRadius: `${config.radius}px`, overflow: 'hidden', backgroundColor: 'white' }}>
            <button onClick={() => setOpenId(isOpen ? null : faq.id)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ fontWeight: '600', color: '#333' }}>{faq.question}</span>
              <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: config.color }}>▼</span>
            </button>
            {isOpen && <div style={{ padding: '0 15px 15px 15px', color: '#555', lineHeight: '1.5' }}>{faq.answer}</div>}
          </div>
        );
      })}
    </div>
  );
};

const GridTemplate = ({ faqs, config }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
    {faqs.map((faq) => (
      <div key={faq.id} style={{ padding: '20px', border: '1px solid #e1e3e5', borderRadius: `${config.radius}px`, backgroundColor: 'white', borderTop: `4px solid ${config.color}`, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: 'bold' }}>{faq.question}</h3>
        <p style={{ margin: 0, color: '#666', fontSize: '13px', lineHeight: '1.4' }}>{faq.answer}</p>
      </div>
    ))}
  </div>
);

const MinimalTemplate = ({ faqs, config }) => (
  <div style={{ borderTop: '1px solid #e1e3e5' }}>
    {faqs.map((faq) => (
      <div key={faq.id} style={{ padding: '15px 0', borderBottom: '1px solid #e1e3e5' }}>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#202223' }}>{faq.question}</h3>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{faq.answer}</p>
        <div style={{ marginTop: '5px', fontSize: '20px', color: config.color, lineHeight: 0 }}>+</div>
      </div>
    ))}
  </div>
);

const ChatTemplate = ({ faqs, config }) => (
  <div style={{ border: '1px solid #e1e3e5', borderRadius: `${config.radius}px`, backgroundColor: '#f9fafb', height: '400px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
    <div style={{ padding: '15px', background: 'white', borderBottom: '1px solid #e1e3e5', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: config.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>AI</div>
      <span style={{ fontWeight: '600', fontSize: '14px' }}>Support Bot</span>
    </div>
    <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ alignSelf: 'flex-start', background: 'white', padding: '10px 15px', borderRadius: '0 15px 15px 15px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '13px' }}>How can I help you today?</div>
      {faqs.map(faq => (
        <div key={faq.id} style={{ alignSelf: 'flex-end', border: `1px solid ${config.color}`, color: config.color, padding: '8px 15px', borderRadius: '15px 15px 0 15px', fontSize: '13px', cursor: 'pointer', background: 'rgba(255,255,255,0.5)' }}>{faq.question}</div>
      ))}
    </div>
  </div>
);

// --- HELPER COMPONENTS ---
const SPage = ({ children, heading, primaryAction }) => (
  <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px", fontFamily: "-apple-system, BlinkMacSystemFont, 'San Francisco', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#202223", margin: 0 }}>{heading}</h1>
      {primaryAction}
    </div>
    {children}
  </div>
);
const SButton = ({ children, onClick, variant = "default", tone, loading }) => {
  let bg = "#fff", color = "#202223", border = "1px solid #babfc3";
  if (variant === "primary") { bg = tone === "critical" ? "#d82c0d" : "#008060"; color = "#fff"; border = "none"; }
  else if (variant === "plain") { bg = "transparent"; border = "none"; color = tone === "critical" ? "#d82c0d" : "#005bd3"; }
  return (
    <button onClick={onClick} disabled={loading} style={{ background: bg, color, border, padding: "8px 16px", borderRadius: "4px", cursor: loading ? "wait" : "pointer", fontWeight: "500", fontSize: "14px", boxShadow: variant === "primary" ? "0 1px 0 rgba(0,0,0,0.05)" : "none", opacity: loading ? 0.7 : 1 }}>
      {loading ? "Processing..." : children}
    </button>
  );
};
const SSection = ({ heading, children }) => (
  <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e1e3e5", padding: "20px", marginBottom: "20px", boxShadow: "0 0 0 1px rgba(63, 63, 68, 0.05), 0 1px 3px 0 rgba(63, 63, 68, 0.15)" }}>
    {heading && <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "15px", marginTop: 0 }}>{heading}</h3>}
    {children}
  </div>
);
const SStack = ({ children, direction = "row", gap = "10px" }) => <div style={{ display: "flex", flexDirection: direction === "block" ? "column" : "row", gap: gap === "large" ? "20px" : gap === "base" ? "10px" : "5px" }}>{children}</div>;
const SHeading = ({ children }) => <h2 style={{ fontSize: "16px", fontWeight: "600", margin: 0, color: "#202223" }}>{children}</h2>;

// --- MAIN COMPONENT ---
export default function Index() {
  // State
  const [faqs, setFaqs] = useState([]);
  const [settings, setSettings] = useState({ style: "accordion", color: "#008060", radius: 8 });
  const [draftSettings, setDraftSettings] = useState(null); 
  
  // Navigation & UI State
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
  const [formTitle, setFormTitle] = useState(""); 
  const [formRows, setFormRows] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]); 

  // Fetch initial data (Replaces useLoaderData)
  const fetchInitialData = async () => {
    try {
      const res = await fetch('/api/faqs');
      const data = await res.json();
      setFaqs(data.faqs || []);
      setSettings(data.settings || { style: "accordion", color: "#008060", radius: 8 });
      setDraftSettings(data.settings || { style: "accordion", color: "#008060", radius: 8 });
    } catch (error) {
      console.error("Failed to fetch data:", error);
      showToast("Error loading data");
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const groupedFaqs = faqs.reduce((acc, faq) => {
    const key = faq.title || "Untitled Set";
    if (!acc[key]) acc[key] = [];
    acc[key].push(faq);
    return acc;
  }, {});

  // --- HANDLERS (Replaces useSubmit) ---
  const sendApiRequest = async (payload) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await fetchInitialData(); // Re-sync data after mutation
      return await res.json();
    } catch (error) {
      console.error("API Error:", error);
      showToast("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Save Theme Settings
  const handleApplyTheme = async () => {
    await sendApiRequest({
      intent: "saveSettings",
      style: draftSettings.style,
      color: draftSettings.color,
      radius: draftSettings.radius
    });
    setSettings(draftSettings);
    showToast("Storefront Design Updated!");
    setCurrentView("dashboard");
  };

  // 2. Save FAQ Set
  const handleSaveFaqs = async () => {
    if (!formTitle.trim()) {
      showToast("Please enter a Group Title");
      return;
    }
    await sendApiRequest({
      intent: "saveFaqSet",
      title: formTitle,
      questions: formRows, // Sending raw array, let JSON stringify handle it
      idsToDelete: deletedIds
    });
    showToast("FAQ Set Saved!");
    setCurrentView("faq_list");
  };

  // 3. Delete FAQ Set
  const handleDeleteSet = async () => {
    if (window.confirm("Delete this entire set?")) {
      await sendApiRequest({
        intent: "deleteSet",
        title: formTitle
      });
      showToast("Set Deleted!");
      setCurrentView("faq_list");
    }
  };

  if (isInitializing) return <div style={{ padding: "40px", textAlign: "center" }}>Loading App Data...</div>;

  // --- RENDER VIEWS ---

  // VIEW 1: THEME EDITOR
  if (currentView === "theme_editor") {
    const previewFaqs = faqs.length > 0 ? faqs.slice(0,3) : [
       { id: 1, question: "Example Question?", answer: "This is how your answer will look." },
       { id: 2, question: "Is this customizable?", answer: "Yes! Change colors and styles on the left." }
    ];

    return (
      <SPage heading="Customize Appearance" primaryAction={<SButton onClick={() => setCurrentView("dashboard")}>Cancel</SButton>}>
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Left Column: Controls */}
            <div>
              <SSection heading="1. Choose Layout">
                 <div style={{ display: 'grid', gap: '10px' }}>
                    {UI_STYLES.map(style => (
                      <div key={style.id} onClick={() => setDraftSettings({...draftSettings, style: style.id})} style={{ padding: '12px', border: draftSettings.style === style.id ? '2px solid #005bd3' : '1px solid #e1e3e5', borderRadius: '8px', cursor: 'pointer', background: draftSettings.style === style.id ? '#f0f8ff' : 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid #ccc', background: draftSettings.style === style.id ? '#005bd3' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             {draftSettings.style === style.id && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }} />}
                          </div>
                          <div>
                             <div style={{ fontWeight: '600', fontSize: '14px' }}>{style.label}</div>
                             <div style={{ fontSize: '12px', color: '#666' }}>{style.desc}</div>
                          </div>
                      </div>
                    ))}
                 </div>
              </SSection>
              <SSection heading="2. Styling">
                 <div style={{ marginBottom: '15px' }}>
                    <label style={labelStyle}>Accent Color</label>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                       <input type="color" value={draftSettings.color} onChange={(e) => setDraftSettings({...draftSettings, color: e.target.value})} style={{ width: '50px', height: '40px', border: '1px solid #ccc', padding: 0, borderRadius: '4px', cursor: 'pointer' }} />
                       <span style={{ padding: '10px', background: '#f4f4f4', borderRadius: '4px', fontSize: '14px', fontFamily: 'monospace' }}>{draftSettings.color}</span>
                    </div>
                 </div>
                 <div>
                    <label style={labelStyle}>Border Radius: {draftSettings.radius}px</label>
                    <input type="range" min="0" max="24" value={draftSettings.radius} onChange={(e) => setDraftSettings({...draftSettings, radius: parseInt(e.target.value)})} style={{ width: '100%', cursor: 'pointer' }} />
                 </div>
              </SSection>
              <div style={{ marginTop: '20px' }}>
                 <SButton variant="primary" onClick={handleApplyTheme} loading={isLoading}>Save & Publish</SButton>
              </div>
            </div>
            {/* Right Column: Live Preview */}
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
              <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Size Guide" style={inputStyle} required />
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
                    <div><label style={labelStyle}>Question</label><input type="text" value={row.question} onChange={(e) => { const n = [...formRows]; n[index].question = e.target.value; setFormRows(n); }} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Answer</label><textarea value={row.answer} onChange={(e) => { const n = [...formRows]; n[index].answer = e.target.value; setFormRows(n); }} rows="4" style={{...inputStyle, resize: "vertical"}} /></div>
                  </SStack>
                </div>
              </SSection>
            ))}
            <div style={addButtonStyle} onClick={() => setFormRows([...formRows, { id: "temp_" + Date.now(), question: "", answer: "" }])}>
               <span style={{ fontWeight: "600", color: "#005bd3" }}>+ Add question</span>
            </div>
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
              <p style={{ color: "#666", margin: 0, fontSize: "14px" }}>Manage groups of questions.</p>
              <SButton variant="primary" onClick={() => { setFormTitle(""); setFormRows([{ id: "temp_init", question: "", answer: "" }]); setDeletedIds([]); setCurrentView("faq_editor"); }}>+ Create New Set</SButton>
           </div>
           <SStack direction="block" gap="base">
             {Object.entries(groupedFaqs).map(([title, faqList]) => (
               <div key={title} style={listItemStyle}>
                 <div><h3 style={{ margin: "0 0 5px 0", fontSize: "16px", fontWeight: "600" }}>{title}</h3><p style={{ margin: 0, color: "#666", fontSize: "14px" }}>{faqList.length} questions</p></div>
                 <div style={{ display: "flex", gap: "10px" }}>
                   <SButton onClick={() => { 
                      if(window.confirm(`To assign this set, please use the 'ProductFAQMapping' logic or simply manage content here.`)) showToast("Info only"); 
                   }}>Assign</SButton>
                   <SButton onClick={() => { setFormTitle(title === "Untitled Set" ? "" : title); setFormRows(faqList.map(f => ({...f}))); setDeletedIds([]); setCurrentView("faq_editor"); }}>Edit</SButton>
                 </div>
               </div>
             ))}
             {Object.keys(groupedFaqs).length === 0 && <div style={{ textAlign: "center", padding: "40px", color: "#8c9196" }}>No sets found.</div>}
           </SStack>
        </SSection>
      </SPage>
    );
  }

  // VIEW 4: DASHBOARD
  return (
    <>
      {toastMessage && <div style={toastStyle}>{toastMessage}</div>}
      <SPage heading="App Dashboard">
        <div style={{ background: "#f0f8ff", border: "1px solid #cce0ff", borderRadius: "8px", padding: "16px 20px", marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><h3 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "600", color: "#004085" }}>🚀 Enable on Storefront</h3><p style={{ margin: 0, color: "#004085", fontSize: "14px" }}>Turn on App Embed.</p></div>
          <SButton onClick={() => window.open(`https://admin.shopify.com`, '_blank')}>Open Theme Editor</SButton>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginTop: "20px" }}>
          <div style={cardStyle}><div><SHeading>❓ Manage FAQs</SHeading><p style={cardTextStyle}>Add, edit, or delete question sets.</p></div><SButton onClick={() => setCurrentView("faq_list")}>Edit Content</SButton></div>
          <div style={cardStyle}><div><SHeading>🎨 Customize Look</SHeading><p style={cardTextStyle}>Current: {settings.style.charAt(0).toUpperCase() + settings.style.slice(1)} style.</p></div><SButton onClick={() => { setDraftSettings(settings); setCurrentView("theme_editor"); }}>Open Designer</SButton></div>
          <div style={cardStyle}><div><SHeading>📊 Analytics</SHeading><p style={cardTextStyle}>View engagement stats.</p></div><SButton variant="plain" onClick={() => showToast("Coming soon!")}>View Reports</SButton></div>
        </div>
      </SPage>
    </>
  );
}

// --- STYLES ---
const cardStyle = { background: "#fff", border: "1px solid #e1e3e5", borderRadius: "8px", padding: "20px", boxShadow: "0px 1px 3px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-start", minHeight: "160px" };
const cardTextStyle = { margin: "10px 0", color: "#666", fontSize: "14px", lineHeight: "1.5" };
const listItemStyle = { background: "#fff", border: "1px solid #e1e3e5", borderRadius: "8px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "15px" };
const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #8c9196", borderRadius: "4px", fontSize: "14px", outline: "none", marginTop: "4px", boxSizing: "border-box", fontFamily: "inherit" };
const labelStyle = { display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "13px", color: "#303030" };
const addButtonStyle = { textAlign: "center", padding: "15px", border: "1px dashed #babfc3", borderRadius: "4px", cursor: "pointer", backgroundColor: "#f9fafb", transition: "background 0.2s", marginTop: "10px" };
const toastStyle = { position: "fixed", bottom: "30px", left: "50%", transform: "translateX(-50%)", background: "#202223", color: "white", padding: "10px 20px", borderRadius: "4px", zIndex: 1000, fontSize: "14px", fontWeight: "500", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" };