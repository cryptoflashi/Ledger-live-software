document.addEventListener("DOMContentLoaded", () => {
    // Smooth scroll for internal links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
            const targetId = anchor.getAttribute("href").slice(1);
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                event.preventDefault();
                targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    // FAQ accordion
    document.querySelectorAll(".faq-item").forEach((item) => {
        const trigger = item.querySelector(".faq-question");
        trigger.addEventListener("click", () => {
            item.classList.toggle("active");
        });
    });

    // --- Simple i18n loader ---
    const canonical = (lang) => {
        const l = (lang || "es").toLowerCase();
        if (l.startsWith("pt-br")) return "pt-BR";
        if (l.startsWith("pt")) return "pt-PT";
        if (l.startsWith("en")) return "en";
        return "es";
    };

    const setLangAttr = (lang) => {
        document.documentElement.lang = lang;
    };

    const readInlineDict = (lang) => {
        const el = document.getElementById(`i18n-${lang}`);
        if (!el) return null;
        try {
            return JSON.parse(el.textContent.trim());
        } catch (e) {
            console.warn("Invalid inline i18n JSON for", lang);
            return null;
        }
    };

    const loadTranslations = async (lang) => {
        // Prefer fetch when served over http(s)
        const isFile = location.protocol === "file:";
        if (!isFile) {
            try {
                const res = await fetch(`assets/i18n/${lang}.json`);
                if (!res.ok) throw new Error("No translations");
                return await res.json();
            } catch (e) {
                console.warn("i18n fetch failed, trying inline", e.message);
            }
        }
        // Inline fallback (works even when opened as a local file)
        const inline = readInlineDict(lang) || readInlineDict("es");
        if (inline) return inline;
        // Last resort: attempt fetch for ES
        try {
            const res = await fetch(`assets/i18n/es.json`);
            return await res.json();
        } catch (e) {
            console.warn("i18n ultimate fallback -> empty", e.message);
            return {};
        }
    };

    const applyTranslations = (dict) => {
        document.querySelectorAll("[data-i18n]").forEach((el) => {
            const key = el.getAttribute("data-i18n");
            if (dict[key]) el.textContent = dict[key];
        });
    };

    const initLang = async () => {
        const stored = localStorage.getItem("lang") || navigator.language || "es";
        const lang = canonical(stored);
        setLangAttr(lang);
        const dict = await loadTranslations(lang);
        applyTranslations(dict);
        const sel = document.getElementById("langSelect");
        if (sel) {
            sel.value = lang;
            sel.addEventListener("change", async () => {
                const newLang = canonical(sel.value);
                localStorage.setItem("lang", newLang);
                setLangAttr(newLang);
                const d2 = await loadTranslations(newLang);
                applyTranslations(d2);
            });
        }
    };

    initLang();
});
