/**
 * Renders the CV into the specified container based on data and template.
 * Section order and visibility come from cvData.sections (set in the builder).
 * All user-supplied content is HTML-escaped before being injected.
 */
function renderCV(containerId, cvData, selectedTemplate) {
  const container = document.getElementById(containerId);
  if (!container) return;
  cvData = cvData || {};

  const sectionMap = makeSectionMap(cvData);
  const mainOrder = orderedVisibleSections(cvData);

  const photoHTML = cvData.photo ? `<img class="cv-photo" alt="Photo" src="${cvData.photo}" />` : '';
  const compsList = (cvData.competences || '').split(',').map((s) => s.trim()).filter(Boolean);
  const langsList = (cvData.langues || '').split(',').map((s) => s.trim()).filter(Boolean);

  let cvHTML = '';

  switch (selectedTemplate) {
    case 'classique':
      cvHTML = `
        <div class="template-classique">
          <div class="sidebar">
            ${photoHTML ? `<div class="cv-photo-wrap sidebar-photo">${photoHTML}</div>` : ''}
            <h2>Coordonnées</h2>
            <p><strong>Courriel :</strong><br>${esc(cvData.email || 'email@exemple.com')}</p>
            <p><strong>Tél. :</strong><br>${esc(cvData.telephone || '555-555-5555')}</p>
            ${cvData.adresse ? `<p><strong>Adresse :</strong><br>${esc(cvData.adresse)}</p>` : ''}
            ${cvData.disponibilite ? `<p><strong>Disponibilité :</strong><br>${esc(cvData.disponibilite)}</p>` : ''}
            ${sectionMap.langues && langsList.length ? `<h2>Langues</h2><p>${langsList.map(esc).join('<br>')}</p>` : ''}
            ${sectionMap.competences && compsList.length ? `<h2>Compétences</h2><p>${compsList.map(esc).join('<br>')}</p>` : ''}
          </div>
          <div class="main">
            <h1>${esc(cvData.nom || 'Votre Nom')}</h1>
            ${renderMainSections(cvData, mainOrder, ['resume', 'experience', 'education', 'certifications'])}
          </div>
        </div>
      `;
      break;

    case 'minimal':
      cvHTML = `
        <div class="template-minimal">
          <div class="minimal-head">
            ${photoHTML ? `<div class="cv-photo-wrap minimal-photo">${photoHTML}</div>` : ''}
            <div class="minimal-head-text">
              <h1>${esc(cvData.nom || 'Votre Nom')}</h1>
              <div class="contact-line">
                ${esc(cvData.email || 'email@exemple.com')} • ${esc(cvData.telephone || '555-555-5555')}
                ${cvData.adresse ? ' • ' + esc(cvData.adresse) : ''}
                ${cvData.disponibilite ? ' • Disponibilité : ' + esc(cvData.disponibilite) : ''}
              </div>
            </div>
          </div>
          ${renderMainSections(cvData, mainOrder, ['resume', 'experience', 'education', 'certifications', 'competences', 'langues'])}
        </div>
      `;
      break;

    case 'securite':
      cvHTML = `
        <div class="template-securite">
          <div class="sidebar">
            ${photoHTML
              ? `<div class="cv-photo-wrap securite-photo">${photoHTML}</div>`
              : `<div class="agent-icon"><span>👮</span></div>`}
            <h2>Contact</h2>
            <p>${esc(cvData.email || 'email@exemple.com')}</p>
            <p>${esc(cvData.telephone || '555-555-5555')}</p>
            ${cvData.adresse ? `<p>${esc(cvData.adresse)}</p>` : ''}
            ${cvData.disponibilite ? `<p>Disponibilité : ${esc(cvData.disponibilite)}</p>` : ''}
            ${sectionMap.certifications && cvData.certifications ? `<h2>Certifications</h2><p>${escMultiline(cvData.certifications)}</p>` : ''}
            ${sectionMap.langues && langsList.length ? `<h2>Langues</h2><p>${langsList.map(esc).join('<br>')}</p>` : ''}
            ${sectionMap.competences && compsList.length ? `<h2>Compétences</h2><p>${compsList.map(esc).join('<br>')}</p>` : ''}
          </div>
          <div class="main">
            <h1>${esc(cvData.nom || 'Votre Nom')}</h1>
            <div class="title">Agent de Sécurité Professionnel</div>
            ${renderMainSections(cvData, mainOrder, ['resume', 'experience', 'education'])}
          </div>
        </div>
      `;
      break;

    case 'moderne':
    default:
      cvHTML = `
        <div class="template-moderne">
          <div class="header">
            ${photoHTML ? `<div class="cv-photo-wrap moderne-photo">${photoHTML}</div>` : ''}
            <div class="header-text">
              <h1>${esc(cvData.nom || 'Votre Nom')}</h1>
              <div class="contact-info">
                <span>${esc(cvData.email || 'email@exemple.com')}</span>
                <span>${esc(cvData.telephone || '555-555-5555')}</span>
                ${cvData.adresse ? `<span>${esc(cvData.adresse)}</span>` : ''}
                ${cvData.disponibilite ? `<span>${esc(cvData.disponibilite)}</span>` : ''}
              </div>
            </div>
          </div>
          <div class="content">
            ${renderMainSections(cvData, mainOrder, ['resume', 'experience', 'education', 'certifications'])}
            <div class="modern-grid-section">
              ${sectionMap.competences && compsList.length ? `<div class="section"><h2>Compétences</h2><p>${compsList.map(esc).join('<br>')}</p></div>` : ''}
              ${sectionMap.langues && langsList.length ? `<div class="section"><h2>Langues</h2><p>${langsList.map(esc).join('<br>')}</p></div>` : ''}
            </div>
          </div>
        </div>
      `;
      break;
  }

  container.innerHTML = cvHTML;
  applyCustomColors(container, cvData, selectedTemplate);
  applyFont(container, cvData);
}

function makeSectionMap(cvData) {
  const arr = Array.isArray(cvData.sections) ? cvData.sections : [];
  const map = {};
  arr.forEach((s) => {
    map[s.id] = s.visible !== false;
  });
  // Default to visible if not in list (e.g. legacy CV).
  ['resume', 'experience', 'education', 'certifications', 'competences', 'langues'].forEach((id) => {
    if (!(id in map)) map[id] = true;
  });
  return map;
}

function orderedVisibleSections(cvData) {
  const arr = Array.isArray(cvData.sections) && cvData.sections.length
    ? cvData.sections
    : [
        { id: 'resume', visible: true },
        { id: 'experience', visible: true },
        { id: 'education', visible: true },
        { id: 'certifications', visible: true },
        { id: 'competences', visible: true },
        { id: 'langues', visible: true },
      ];
  return arr.filter((s) => s.visible !== false).map((s) => s.id);
}

function renderMainSections(cvData, order, allowed) {
  const set = new Set(allowed);
  return order
    .filter((id) => set.has(id))
    .map((id) => renderSectionById(cvData, id))
    .filter(Boolean)
    .join('');
}

function renderSectionById(cvData, id) {
  switch (id) {
    case 'resume':
      return cvData.resume
        ? `<div class="section"><h2>Résumé professionnel</h2><p>${esc(cvData.resume)}</p></div>`
        : '';
    case 'experience': {
      const html = renderExperiencesHTML(cvData);
      return html ? `<div class="section"><h2>Expérience professionnelle</h2>${html}</div>` : '';
    }
    case 'education': {
      const html = renderEducationsHTML(cvData);
      return html ? `<div class="section"><h2>Éducation</h2>${html}</div>` : '';
    }
    case 'certifications':
      return cvData.certifications
        ? `<div class="section"><h2>Certifications</h2><p>${escMultiline(cvData.certifications)}</p></div>`
        : '';
    case 'competences': {
      const comps = (cvData.competences || '').split(',').map((s) => s.trim()).filter(Boolean);
      return comps.length
        ? `<div class="section"><h2>Compétences</h2><p>${comps.map(esc).join(', ')}</p></div>`
        : '';
    }
    case 'langues': {
      const langs = (cvData.langues || '').split(',').map((s) => s.trim()).filter(Boolean);
      return langs.length
        ? `<div class="section"><h2>Langues</h2><p>${langs.map(esc).join(', ')}</p></div>`
        : '';
    }
    default:
      return '';
  }
}

function renderExperiencesHTML(cvData) {
  const arr = cvData && cvData.experiences;
  if (Array.isArray(arr) && arr.length) {
    return arr
      .map((item) => {
        const head = [item.type, item.employer]
          .map((s) => (s ? esc(s) : ''))
          .filter(Boolean)
          .join(' — ');
        const period = item.period ? ` <span class="exp-period">(${esc(item.period)})</span>` : '';
        const bullets =
          Array.isArray(item.bullets) && item.bullets.length
            ? `<ul class="exp-bullets">${item.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`
            : '';
        return `<div class="exp-item"><div class="exp-head"><strong>${head || 'Poste'}</strong>${period}</div>${bullets}</div>`;
      })
      .join('');
  }
  return cvData && cvData.experience ? `<p>${escMultiline(cvData.experience)}</p>` : '';
}

function renderEducationsHTML(cvData) {
  const arr = cvData && cvData.educations;
  if (Array.isArray(arr) && arr.length) {
    return arr
      .map((item) => {
        const left = [
          item.type,
          item.domain ? 'en ' + item.domain : '',
        ]
          .filter(Boolean)
          .join(' ');
        const right = [item.school, item.year ? '(' + item.year + ')' : '']
          .filter(Boolean)
          .join(' ');
        const line = [left, right].filter(Boolean).join(' — ');
        return `<div class="edu-item">${esc(line)}</div>`;
      })
      .join('');
  }
  return cvData && cvData.education ? `<p>${escMultiline(cvData.education)}</p>` : '';
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function escMultiline(s) {
  return esc(s).replace(/\n/g, '<br>');
}

function applyFont(container, cvData) {
  if (!cvData || !cvData.font || cvData.font === 'default') return;
  const choices = (typeof CVStore !== 'undefined' && CVStore.FONT_CHOICES) || [];
  const pick = choices.find((c) => c.value === cvData.font);
  if (!pick || !pick.stack) return;
  const root = container.firstElementChild;
  if (root) root.style.fontFamily = pick.stack;
}

function applyCustomColors(container, cvData, selectedTemplate) {
  if (!cvData) return;

  if (selectedTemplate === 'moderne') {
    if (cvData.colorModerne) {
      const header = container.querySelector('.template-moderne .header');
      if (header) {
        header.style.backgroundColor = cvData.colorModerne;
        header.style.color = 'white';
        header.style.borderBottom = 'none';
      }
      const h1 = container.querySelector('.template-moderne .header h1');
      if (h1) h1.style.color = 'white';
      const contactInfo = container.querySelector('.template-moderne .contact-info');
      if (contactInfo) contactInfo.style.color = 'rgba(255, 255, 255, 0.9)';
      container.querySelectorAll('.template-moderne h2').forEach((h2) => {
        h2.style.color = cvData.colorModerne;
      });
    }
    if (cvData.accentModerne) {
      container.querySelectorAll('.template-moderne strong').forEach((el) => {
        el.style.color = cvData.accentModerne;
      });
    }
  }

  if (selectedTemplate === 'classique') {
    if (cvData.colorClassique) {
      const sidebar = container.querySelector('.template-classique .sidebar');
      if (sidebar) sidebar.style.backgroundColor = cvData.colorClassique;
    }
    if (cvData.accentClassique) {
      container.querySelectorAll('.template-classique h1, .template-classique .main h2').forEach((el) => {
        el.style.color = cvData.accentClassique;
      });
    }
  }

  if (selectedTemplate === 'securite') {
    if (cvData.colorSecurite) {
      const sidebar = container.querySelector('.template-securite .sidebar');
      if (sidebar) sidebar.style.backgroundColor = cvData.colorSecurite;
    }
    if (cvData.accentSecurite) {
      container.querySelectorAll('.template-securite .main h1, .template-securite .main h2, .template-securite .section').forEach((el) => {
        if (el.tagName === 'DIV') el.style.borderLeftColor = cvData.accentSecurite;
        else el.style.color = cvData.accentSecurite;
      });
    }
  }

  if (selectedTemplate === 'minimal') {
    if (cvData.colorMinimal) {
      container.querySelectorAll('.template-minimal h2').forEach((h2) => {
        h2.style.color = cvData.colorMinimal;
      });
      const existing = container.querySelector('style.minimal-custom');
      if (existing) existing.remove();
      const style = document.createElement('style');
      style.className = 'minimal-custom';
      style.textContent = `.template-minimal h2:before { background: ${cvData.colorMinimal} !important; }`;
      container.appendChild(style);
    }
    if (cvData.accentMinimal) {
      container.querySelectorAll('.template-minimal .contact-line').forEach((el) => {
        el.style.color = cvData.accentMinimal;
      });
    }
  }
}
