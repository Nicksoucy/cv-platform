/**
 * Shared storage layer for the CV platform.
 *
 * Data model (localStorage):
 *   "cv-list"      → CV[]
 *   "active-cv-id" → string (id of the currently active CV)
 *
 * Each CV:
 *   { id, name, template, updatedAt, data: { … fields … } }
 *
 * Structured fields live on `data`:
 *   experiences: [{ id, type, employer, period, bullets: string[] }]
 *   educations:  [{ id, type, domain, school, year }]
 *
 * Legacy string fields (`experience`, `education`) are kept for back-compat
 * with content the renderer used to consume directly. When the structured
 * arrays exist they take precedence in the renderer.
 */
(function (root) {
  const KEYS = {
    LIST: 'cv-list',
    ACTIVE: 'active-cv-id',
    LEGACY_DATA: 'cvData',
    LEGACY_TEMPLATE: 'selectedTemplate',
  };

  const TEMPLATE_LABELS = {
    moderne: 'Moderne',
    classique: 'Classique',
    minimal: 'Minimal',
    securite: 'Sécurité',
  };

  function uid(prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function emptyData() {
    return {
      nom: '',
      email: '',
      telephone: '',
      adresse: '',
      disponibilite: '',
      resume: '',
      experiences: [],
      educations: [],
      experience: '',
      education: '',
      certifications: '',
      competences: '',
      langues: '',
      colorModerne: '#2563eb',
      colorClassique: '#f3f4f6',
      colorSecurite: '#1e3a8a',
      colorMinimal: '#333333',
    };
  }

  function emptyCV(template, name) {
    return {
      id: uid('cv'),
      name: name || 'Nouveau CV',
      template: template || 'moderne',
      updatedAt: Date.now(),
      data: emptyData(),
    };
  }

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function migrateLegacy() {
    if (localStorage.getItem(KEYS.LIST)) return;
    const legacyData = readJSON(KEYS.LEGACY_DATA, null);
    const legacyTpl = localStorage.getItem(KEYS.LEGACY_TEMPLATE) || 'moderne';
    const list = [];
    if (legacyData && (legacyData.nom || legacyData.email)) {
      const cv = emptyCV(legacyTpl, (legacyData.nom || 'Mon CV') + ' (importé)');
      cv.data = Object.assign(emptyData(), legacyData);
      // Ensure new structured fields exist even if legacy data didn't have them.
      if (!Array.isArray(cv.data.experiences)) cv.data.experiences = [];
      if (!Array.isArray(cv.data.educations)) cv.data.educations = [];
      list.push(cv);
      localStorage.setItem(KEYS.ACTIVE, cv.id);
    }
    localStorage.setItem(KEYS.LIST, JSON.stringify(list));
  }

  function loadList() {
    migrateLegacy();
    const list = readJSON(KEYS.LIST, []);
    return Array.isArray(list) ? list : [];
  }

  function saveList(list) {
    localStorage.setItem(KEYS.LIST, JSON.stringify(list));
  }

  function getActive() {
    const list = loadList();
    let id = localStorage.getItem(KEYS.ACTIVE);
    let cv = list.find((c) => c.id === id);
    if (!cv && list.length) cv = list[0];
    if (!cv) {
      cv = emptyCV();
      list.push(cv);
      saveList(list);
    }
    localStorage.setItem(KEYS.ACTIVE, cv.id);
    return { cv, list };
  }

  function setActive(id) {
    localStorage.setItem(KEYS.ACTIVE, id);
  }

  function updateActive(patch) {
    const { cv, list } = getActive();
    if (patch.data) {
      cv.data = Object.assign({}, cv.data, patch.data);
      delete patch.data;
    }
    Object.assign(cv, patch);
    cv.updatedAt = Date.now();
    saveList(list);
    return cv;
  }

  function createCV(template, name) {
    const list = loadList();
    const cv = emptyCV(template, name);
    list.push(cv);
    saveList(list);
    setActive(cv.id);
    return cv;
  }

  function duplicateCV(id) {
    const list = loadList();
    const src = list.find((c) => c.id === id);
    if (!src) return null;
    const copy = JSON.parse(JSON.stringify(src));
    copy.id = uid('cv');
    copy.name = src.name + ' (copie)';
    copy.updatedAt = Date.now();
    list.push(copy);
    saveList(list);
    setActive(copy.id);
    return copy;
  }

  function deleteCV(id) {
    const list = loadList().filter((c) => c.id !== id);
    saveList(list);
    if (localStorage.getItem(KEYS.ACTIVE) === id) {
      if (list.length) setActive(list[0].id);
      else localStorage.removeItem(KEYS.ACTIVE);
    }
    return list;
  }

  function renameCV(id, name) {
    const list = loadList();
    const cv = list.find((c) => c.id === id);
    if (cv) {
      cv.name = name;
      cv.updatedAt = Date.now();
      saveList(list);
    }
    return cv;
  }

  function buildSampleCV() {
    const cv = emptyCV('moderne', 'Exemple — Agent de sécurité');
    cv.data = Object.assign(emptyData(), {
      nom: 'Jean Tremblay',
      email: 'jean.tremblay@example.com',
      telephone: '514-555-0123',
      adresse: 'Montréal, QC',
      disponibilite: 'Temps plein, Soir, Fin de semaine',
      resume:
        "Agent de sécurité bilingue avec 4 ans d'expérience en milieu commercial et événementiel. Reconnu pour ma vigilance, ma capacité à désamorcer les conflits et la qualité de mes rapports d'incident.",
      experiences: [
        {
          id: uid('exp'),
          type: 'Sécurité',
          employer: 'GardaWorld',
          period: '2022-2024',
          bullets: [
            "Surveillance et patrouilles d'un site commercial de 80 000 pi²",
            "Rédaction de 15+ rapports d'incident par mois",
            'Désescalade et gestion de conflits avec la clientèle',
          ],
        },
        {
          id: uid('exp'),
          type: 'Service à la clientèle',
          employer: 'Métro inc.',
          period: '2019-2022',
          bullets: [
            'Accueil et orientation de la clientèle',
            "Travail d'équipe en environnement à fort débit",
          ],
        },
      ],
      educations: [
        { id: uid('edu'), type: 'AEP', domain: 'Sécurité privée', school: 'Académie de sécurité', year: '2022' },
        { id: uid('edu'), type: 'DES', domain: '', school: 'École secondaire X', year: '2018' },
      ],
      certifications:
        'Permis BSP - 2022\nFormation 54h obligatoire - 2022\nFormation secourisme RCR/DEA - 2023',
      competences:
        'Surveillance, Contrôle d\'accès, Rédaction de rapports, Désescalade, Service à la clientèle',
      langues: 'Français - Natif, Anglais - Avancé',
    });
    return cv;
  }

  function loadSample() {
    const list = loadList();
    const cv = buildSampleCV();
    list.push(cv);
    saveList(list);
    setActive(cv.id);
    return cv;
  }

  root.CVStore = {
    KEYS: KEYS,
    TEMPLATE_LABELS: TEMPLATE_LABELS,
    uid: uid,
    emptyCV: emptyCV,
    emptyData: emptyData,
    loadList: loadList,
    saveList: saveList,
    getActive: getActive,
    setActive: setActive,
    updateActive: updateActive,
    createCV: createCV,
    duplicateCV: duplicateCV,
    deleteCV: deleteCV,
    renameCV: renameCV,
    loadSample: loadSample,
  };
})(window);
