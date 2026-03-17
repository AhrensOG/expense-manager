'use client';

export const TabBar = ({ activeTab, onTabChange, isMobile = false }) => {
  const tabs = [
    { id: 'quotidien', label: 'Quotidien' },
    { id: 'mensuel', label: 'Mensuel' },
    { id: 'resume', label: 'Résumé' },
  ];
  
  const fontSize = isMobile ? "15px" : "16px";

  return (
    <div
      style={{
        // position: "sticky",
        display: "flex",
        justifyContent: isMobile ? "center" : "flex-start",
        borderBottom: "1px solid var(--border)",
        backgroundColor: "var(--card-bg)",
        padding: "0 16px",
        overflowX: "auto",
        zIndex: 30,
      }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            position: "relative",
            padding: "16px 20px",
            fontSize,
            fontWeight: activeTab === tab.id ? "600" : "400",
            color:
              activeTab === tab.id
                ? "var(--accent)"
                : "var(--text-secondary)",
            minHeight: "48px",
            whiteSpace: "nowrap",
          }}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: '16px',
              right: '16px',
              height: '3px',
              backgroundColor: 'var(--accent)',
              borderRadius: '2px 2px 0 0',
            }} />
          )}
        </button>
      ))}
    </div>
  );
};
