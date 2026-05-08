import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "es", label: "ES" },
  { code: "ca", label: "CA" },
  { code: "en", label: "EN" },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const current = i18n.language?.slice(0, 2);

  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        justifyContent: "center",
        padding: "8px 0",
      }}
    >
      {LANGUAGES.map((lang) => {
        const isActive = current === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            style={{
              padding: "4px 10px",
              borderRadius: 8,
              border: "none",
              backgroundColor: isActive ? "var(--color-white)" : "transparent",
              color: isActive ? "var(--color-purple)" : "rgba(255,255,255,0.6)",
              fontWeight: isActive ? 700 : 400,
              fontSize: 12,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.6)";
            }}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}
