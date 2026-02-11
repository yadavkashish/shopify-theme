import { useEffect, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import db from "../db.server"; 

export const loader = async ({ request }) => {
  // Grab the session so we know which store we are currently logged into
  const { session } = await authenticate.admin(request);
  
  // --- FETCH REAL DATA FROM YOUR NEON DB ---
  const faqs = await db.fAQ.findMany({
    orderBy: { createdAt: 'desc' }
  });
  
  // Return the faqs and the shop domain (for our theme editor deep link)
  return { faqs, shop: session.shop };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  // --- BULK SAVE ACTION (REAL DB) ---
  if (intent === "bulk_save") {
    const title = formData.get("title");
    const entries = JSON.parse(formData.get("entries"));
    const deletedIds = JSON.parse(formData.get("deletedIds") || "[]");

    const transactions = [];

    if (deletedIds.length > 0) {
      transactions.push(
        db.fAQ.deleteMany({
          where: { id: { in: deletedIds } }
        })
      );
    }

    entries.forEach((entry) => {
      if (entry.id) {
        transactions.push(
          db.fAQ.update({
            where: { id: entry.id },
            data: { title: title, question: entry.question, answer: entry.answer },
          })
        );
      } else {
        transactions.push(
          db.fAQ.create({
            data: { title: title, question: entry.question, answer: entry.answer },
          })
        );
      }
    });

    await db.$transaction(transactions);
    return { status: "success", message: "FAQ Set Saved Successfully!" };
  }

  // --- ASSIGN TO PRODUCT ACTION ---
  if (intent === "assign_products") {
    const title = formData.get("title");
    const productIds = JSON.parse(formData.get("productIds") || "[]");

    if (productIds.length > 0) {
      const transactions = productIds.map(pId => 
        db.productFAQMapping.upsert({
          where: { faqTitle_productId: { faqTitle: title, productId: pId } },
          create: { faqTitle: title, productId: pId },
          update: {} 
        })
      );
      await db.$transaction(transactions);
    }
    
    return { status: "success", message: "FAQ Set assigned to products!" };
  }

  // --- DELETE ENTIRE SET ACTION ---
  if (intent === "delete_set") {
    const title = formData.get("title");
    
    await db.fAQ.deleteMany({
      where: { title: title }
    });
    
    await db.productFAQMapping.deleteMany({
      where: { faqTitle: title }
    });
    
    return { status: "success", message: "FAQ Set Deleted!" };
  }

  return null;
};

export default function Index() {
  const { faqs, shop } = useLoaderData(); // Now grabbing the shop domain
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  
  const [currentView, setCurrentView] = useState("dashboard");
  
  const [formTitle, setFormTitle] = useState(""); 
  const [formRows, setFormRows] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]); 

  const isLoading = fetcher.state === "submitting";

  const groupedFaqs = faqs.reduce((acc, faq) => {
    const key = faq.title || "Untitled Set";
    if (!acc[key]) acc[key] = [];
    acc[key].push(faq);
    return acc;
  }, {});

  useEffect(() => {
    if (fetcher.data?.status === "success" && fetcher.state === "idle") {
      shopify.toast.show(fetcher.data.message);
      setCurrentView("faq_list"); 
    }
  }, [fetcher.data, fetcher.state, shopify]);

  const handleSave = () => {
    if (!formTitle.trim()) {
      shopify.toast.show("Please enter a Group Title");
      return;
    }

    fetcher.submit(
      {
        intent: "bulk_save",
        title: formTitle,
        entries: JSON.stringify(formRows),
        deletedIds: JSON.stringify(deletedIds)
      },
      { method: "POST" }
    );
  };

  const handleAssignToProduct = async (title) => {
    const selection = await shopify.resourcePicker({ type: 'product', multiple: true });
    
    if (selection && selection.length > 0) {
      const productIds = selection.map(product => product.id);
      
      fetcher.submit(
        { 
          intent: "assign_products", 
          title: title, 
          productIds: JSON.stringify(productIds) 
        },
        { method: "POST" }
      );
    }
  };

  const startCreating = () => {
    setFormTitle(""); 
    setFormRows([{ question: "", answer: "" }]); 
    setDeletedIds([]);
    setCurrentView("faq_editor");
  };

  const startEditing = (titleKey, faqList) => {
    setFormTitle(titleKey === "Untitled Set" ? "" : titleKey); 
    setFormRows(faqList); 
    setDeletedIds([]);
    setCurrentView("faq_editor");
  };

  const handleInputChange = (index, field, value) => {
    const newRows = [...formRows];
    newRows[index][field] = value;
    setFormRows(newRows);
  };

  const addRow = () => {
    setFormRows([...formRows, { question: "", answer: "" }]);
  };

  const removeRow = (index) => {
    const rowToRemove = formRows[index];
    if (rowToRemove.id) {
      setDeletedIds([...deletedIds, rowToRemove.id]);
    }
    const newRows = formRows.filter((_, i) => i !== index);
    setFormRows(newRows);
  };

  // --- VIEW: DYNAMIC FAQ EDITOR ---
  if (currentView === "faq_editor") {
    const isEditingExistingSet = formRows.some(row => row.id);

    return (
      <s-page heading="Manage FAQ Set">
        <s-button slot="primary-action" onClick={() => setCurrentView("faq_list")}>
          Cancel
        </s-button>
        
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
              <s-stack direction="block" gap="large">
                
                <s-section heading="Set Name">
                  <p style={{marginBottom: "10px", color: "#666"}}>
                    Identify this group of FAQs (e.g. "Winter Jacket Model X").
                  </p>
                  <div>
                     <input 
                       type="text"
                       name="title"
                       value={formTitle}
                       onChange={(e) => setFormTitle(e.target.value)}
                       placeholder="e.g. Product Specific FAQs"
                       style={inputStyle}
                       required
                     />
                  </div>
                </s-section>

                {formRows.map((row, index) => (
                  <s-section key={index} heading={`Question #${index + 1}`}>
                    <div style={{ position: "relative" }}>
                      
                      {formRows.length > 1 && (
                        <div style={{ position: "absolute", top: "-45px", right: "0" }}>
                           <s-button variant="plain" tone="critical" onClick={() => removeRow(index)}>
                             Remove
                           </s-button>
                        </div>
                      )}

                      <s-stack direction="block" gap="base">
                        <div>
                          <label style={labelStyle}>Question</label>
                          <input 
                            type="text" 
                            value={row.question}
                            onChange={(e) => handleInputChange(index, "question", e.target.value)}
                            placeholder="e.g. Is this waterproof?"
                            style={inputStyle} 
                            required
                          />
                        </div>

                        <div>
                          <label style={labelStyle}>Answer</label>
                          <textarea 
                            value={row.answer}
                            onChange={(e) => handleInputChange(index, "answer", e.target.value)}
                            rows="4" 
                            placeholder="e.g. Yes, it has a DWR coating..."
                            style={{...inputStyle, resize: "vertical"}} 
                            required
                          />
                        </div>
                      </s-stack>
                    </div>
                  </s-section>
                ))}

                <div style={addButtonStyle} onClick={addRow}>
                  <span style={{ fontWeight: "600", color: "#005bd3" }}>+ Add another question</span>
                </div>

                <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <s-button 
                    onClick={handleSave} 
                    {...(isLoading ? { loading: true } : {})}
                  >
                    Save FAQ Set
                  </s-button>
                  
                  {isEditingExistingSet && (
                     <s-button 
                       variant="primary" 
                       tone="critical"
                       onClick={(e) => {
                         e.preventDefault();
                         if (confirm("Are you sure you want to delete this entire set of FAQs?")) {
                           fetcher.submit({ intent: "delete_set", title: formTitle }, { method: "POST" });
                         }
                       }}
                    >
                      Delete Entire Set
                    </s-button>
                  )}
                </div>

              </s-stack>
        </div>
      </s-page>
    );
  }

  // --- VIEW: FAQ LIST ---
  if (currentView === "faq_list") {
    return (
      <s-page heading="FAQ Manager">
        <s-button slot="primary-action" onClick={() => setCurrentView("dashboard")}>
          Back to Dashboard
        </s-button>

        <s-section heading="Your FAQ Sets">
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <p style={{ color: "#666", margin: 0 }}>Manage groups of questions assigned to your products.</p>
              <s-button variant="primary" onClick={startCreating}>
                + Create New Set
              </s-button>
           </div>

           <s-stack direction="block" gap="base">
             {Object.entries(groupedFaqs).map(([title, faqList]) => (
               <div key={title} style={listItemStyle}>
                 <div style={{ flex: 1 }}>
                   <h3 style={{ margin: "0 0 5px 0", fontSize: "16px", fontWeight: "600" }}>
                     {title}
                   </h3>
                   <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                     Contains {faqList.length} question(s)
                   </p>
                 </div>
                 
                 <div style={{ display: "flex", gap: "10px" }}>
                   <s-button onClick={() => handleAssignToProduct(title)}>
                     Assign to Product
                   </s-button>
                   <s-button onClick={() => startEditing(title, faqList)}>
                     Edit Set
                   </s-button>
                 </div>
               </div>
             ))}
             
             {Object.keys(groupedFaqs).length === 0 && (
               <div style={{ textAlign: "center", padding: "40px", color: "#8c9196" }}>
                 No FAQ sets found. Click "Create New Set" to begin.
               </div>
             )}
           </s-stack>
        </s-section>
      </s-page>
    );
  }

  // --- VIEW: DASHBOARD ---
  return (
    <s-page heading="App Dashboard">
      
      {/* --- NEW ENABLE APP EMBED BANNER --- */}
      <div style={{ 
        background: "#f0f8ff", 
        border: "1px solid #cce0ff", 
        borderRadius: "12px", 
        padding: "20px", 
        marginTop: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <h3 style={{ margin: "0 0 5px 0", fontSize: "16px" }}>🚀 Enable FAQs on your Storefront</h3>
          <p style={{ margin: 0, color: "#555" }}>Turn on the App Embed in your theme editor to automatically inject assigned FAQs on product pages.</p>
        </div>
        <s-button 
          variant="primary" 
          onClick={() => window.open(`https://${shop}/admin/themes/current/editor?context=apps`, '_blank')}
        >
          Open Theme Editor
        </s-button>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
        gap: "20px",
        marginTop: "20px"
      }}>
        <div style={cardStyle}>
          <s-heading>❓ FAQ Manager</s-heading>
          <p style={{ margin: "10px 0", color: "#666" }}>Manage sets of questions for your store.</p>
          <s-button onClick={() => setCurrentView("faq_list")}>Manage FAQs</s-button>
        </div>
        
        <div style={cardStyle}>
          <s-heading>⭐ Testimonials</s-heading>
          <p style={{ margin: "10px 0", color: "#666" }}>View customer reviews.</p>
          <s-button onClick={() => shopify.toast.show("Coming soon")}>View Testimonials</s-button>
        </div>

        <div style={cardStyle}>
          <s-heading>📊 Analytics</s-heading>
          <p style={{ margin: "10px 0", color: "#666" }}>Check performance.</p>
          <s-button variant="tertiary">View Reports</s-button>
        </div>
      </div>
    </s-page>
  );
}

// --- STYLES ---
const cardStyle = {
  background: "#fff",
  border: "1px solid #e1e3e5",
  borderRadius: "12px",
  padding: "24px",
  boxShadow: "0px 2px 5px rgba(0,0,0,0.05)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "flex-start",
  minHeight: "160px"
};

const listItemStyle = {
  background: "#fff",
  border: "1px solid #e1e3e5",
  borderRadius: "8px",
  padding: "16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px"
};

const inputStyle = {
  width: "100%", 
  padding: "10px 12px", 
  border: "1px solid #8c9196", 
  borderRadius: "8px", 
  fontSize: "14px",
  outline: "none",
  marginTop: "4px",
  boxSizing: "border-box"
};

const labelStyle = {
  display: "block", 
  marginBottom: "4px", 
  fontWeight: "600",
  fontSize: "13px",
  color: "#303030"
};

const addButtonStyle = {
  textAlign: "center", 
  padding: "15px", 
  border: "1px dashed #ccc", 
  borderRadius: "8px", 
  cursor: "pointer",
  backgroundColor: "#f9fafb",
  transition: "background 0.2s",
};

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};