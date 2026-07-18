const navLinks = [...document.querySelectorAll(".primary-nav a")];
const nav = document.querySelector(".primary-nav");
const toggle = document.querySelector(".nav-toggle");

toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});

const currentPage = location.pathname.split("/").pop() || "index.html";

navLinks.forEach((link) => {
  link.classList.toggle("active", link.getAttribute("href") === currentPage);
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  });
});

function initArticleLanguageSwitcher(root) {
  if (root.dataset.__multilingualInit === "true") {
    return;
  }
  root.dataset.__multilingualInit = "true";

  const langParam = root.dataset.langParam || "lang";
  const defaultLang = root.dataset.defaultLang || "en";
  const storageKey = root.dataset.storageKey || "article-language";
  let buttonsContainer = root.querySelector(".article-language-buttons");
  let contentContainer = root.querySelector(".article-language-content");
  const intro = root.querySelector(".article-language-intro");
  const metaDescription = document.querySelector("meta[name=description]");
  const ogTitle = document.querySelector("meta[property='og:title']");
  const ogDescription = document.querySelector("meta[property='og:description']");
  const labels = {
    en: "English",
    "zh-CN": "简体中文",
    ko: "한국어",
  };
  const titleSuffix = " | Yuki Jin Law";
  const animationDuration = 150;
  let currentLang = defaultLang;

  if (!buttonsContainer) {
    buttonsContainer = document.createElement("div");
    buttonsContainer.className = "article-language-buttons";
    buttonsContainer.setAttribute("role", "tablist");
    buttonsContainer.setAttribute("aria-label", "Select article language");
    if (intro) {
      intro.insertAdjacentElement("afterend", buttonsContainer);
    } else {
      root.prepend(buttonsContainer);
    }
  }

  if (!contentContainer) {
    contentContainer = document.createElement("div");
    contentContainer.className = "article-language-content";
    root.appendChild(contentContainer);
  }

  const templateNodes = Array.from(root.querySelectorAll("template[data-lang]"));
  templateNodes.forEach((template) => {
    const article = document.createElement("article");
    article.className = "blog-post language-content";
    Object.keys(template.dataset).forEach((key) => {
      article.dataset[key] = template.dataset[key];
    });
    article.innerHTML = template.innerHTML;
    contentContainer.appendChild(article);
    template.remove();
  });

  const contents = Array.from(contentContainer.querySelectorAll(".language-content"));
  if (contents.length === 0) {
    return;
  }

  const availableLangs = contents.map((content) => content.dataset.lang).filter(Boolean);
  if (availableLangs.length === 0) {
    return;
  }

  function getInitialLanguage() {
    const params = new URLSearchParams(location.search);
    const requested = params.get(langParam);
    if (availableLangs.includes(requested)) {
      return requested;
    }

    const saved = window.localStorage.getItem(storageKey);
    if (availableLangs.includes(saved)) {
      return saved;
    }

    return defaultLang;
  }

  function setButtonState(lang) {
    buttonsContainer.querySelectorAll("button").forEach((button) => {
      const active = button.dataset.lang === lang;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
  }

  function setContentState(lang) {
    contents.forEach((content) => {
      const isActive = content.dataset.lang === lang;
      content.classList.toggle("active", isActive);
      content.hidden = !isActive;
    });
  }

  function updateHeadForLanguage(lang) {
    const activeContent = contents.find((content) => content.dataset.lang === lang);
    if (!activeContent) return;

    if (metaDescription && activeContent.dataset.description) {
      metaDescription.content = activeContent.dataset.description;
    }

    if (ogDescription && activeContent.dataset.description) {
      ogDescription.content = activeContent.dataset.description;
    }

    if (activeContent.dataset.title) {
      document.title = `${activeContent.dataset.title}${titleSuffix}`;
      if (ogTitle) {
        ogTitle.content = `${activeContent.dataset.title}${titleSuffix}`;
      }
    }

    const htmlLang = activeContent.dataset.htmlLang || lang;
    document.documentElement.lang = htmlLang;
  }

  function updateLocation(lang) {
    const params = new URLSearchParams(location.search);
    if (lang === defaultLang) {
      params.delete(langParam);
    } else {
      params.set(langParam, lang);
    }

    const newSearch = params.toString() ? `?${params.toString()}` : "";
    history.replaceState(null, "", `${location.pathname}${newSearch}${location.hash}`);
  }

  function selectLanguage(lang, updateHistory = true) {
    if (lang === currentLang || !availableLangs.includes(lang)) {
      return;
    }

    currentLang = lang;
    setButtonState(lang);
    contentContainer.classList.add("fade-out");

    window.setTimeout(() => {
      setContentState(lang);
      updateHeadForLanguage(lang);
      if (storageKey) {
        window.localStorage.setItem(storageKey, lang);
      }
      if (updateHistory) {
        updateLocation(lang);
      }
      contentContainer.classList.remove("fade-out");
    }, animationDuration);
  }

  availableLangs.forEach((lang) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "language-pill";
    button.dataset.lang = lang;
    button.textContent = labels[lang] || lang;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", "false");
    button.addEventListener("click", () => selectLanguage(lang));
    buttonsContainer.appendChild(button);
  });

  const initialLanguage = getInitialLanguage();
  currentLang = availableLangs.includes(initialLanguage) ? initialLanguage : availableLangs[0];
  setButtonState(currentLang);
  setContentState(currentLang);
  updateHeadForLanguage(currentLang);
  updateLocation(currentLang);
}

class ArticleLanguageSwitcherElement extends HTMLElement {
  connectedCallback() {
    initArticleLanguageSwitcher(this);
  }
}

if (typeof customElements !== "undefined") {
  customElements.define("article-language-switcher", ArticleLanguageSwitcherElement);
}

document.querySelectorAll(".article-language-switcher, article-language-switcher").forEach((root) => initArticleLanguageSwitcher(root));
