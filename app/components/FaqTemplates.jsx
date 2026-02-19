
import { useState } from "react";

export const UI_STYLES = [
    { id: 'accordion', label: 'Classic Accordion', desc: 'Standard expandable list' },
    { id: 'grid', label: 'Bento Grid', desc: 'Modern card layout' },
    { id: 'minimal', label: 'Minimalist', desc: 'Clean, simple text' },
    { id: 'chat', label: 'Support Bot', desc: 'Conversational style' },
];

export const AccordionTemplate = ({ faqs, config }) => {
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

export const GridTemplate = ({ faqs, config }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
        {faqs.map((faq) => (
            <div key={faq.id} style={{ padding: '20px', border: '1px solid #e1e3e5', borderRadius: `${config.radius}px`, backgroundColor: 'white', borderTop: `4px solid ${config.color}`, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: 'bold' }}>{faq.question}</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '13px', lineHeight: '1.4' }}>{faq.answer}</p>
            </div>
        ))}
    </div>
);

export const MinimalTemplate = ({ faqs, config }) => (
    <div style={{ borderTop: '1px solid #e1e3e5' }}>
        {faqs.map((faq) => (
            <div key={faq.id} style={{ padding: '15px 0', borderBottom: '1px solid #e1e3e5' }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#202223' }}>{faq.question}</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{faq.answer}</p>
            </div>
        ))}
    </div>
);

export const ChatTemplate = ({ faqs, config }) => (
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
