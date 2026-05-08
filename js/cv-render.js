/**
 * Renders the CV into the specified container based on data and template.
 * Handles structured `experiences`/`educations` arrays first, falling back
 * to legacy string fields when the structured data is missing.
 */
function renderCV(containerId, cvData, selectedTemplate) {
  const container = document.getElementById(containerId);
  if (!container) return;
  cvData = cvData || {};

  const expHTML = renderExperiencesHTML(cvData);
  const eduHTML = renderEducationsHTML(cvData);
  const certsHTML = renderMultilineHTML(cvData.certifications);
  const compsList = (cvData.competences || '').split(',').map((s) => s.trim()).filter(Boolean);
  const langsList = (cvData.langues || '').split(',').map((s) => s.trim()).filter(Boolean);

  let cvHTML = '';

  switch (selectedTemplate) {
    case 'classique':
      cvHTML = `
        <div class="template-classique">
          <div class="sidebar">
            <h2>Coordonnées</h2>
            <p><strong>Courriel :</strong><br>${esc(cvData.email || 'email@exemple.com')}</p>
            <p><strong>Tél. :</strong><br>${esc(cvData.telephone || '555-555-5555')}</p>
            ${cvData.adresse ? `<p><strong>Adresse :</strong><br>${esc(cvData.adresse)}</p>` : ''}
            ${cvData.disponibilite ? `<p><strong>Disponibilité :</strong><br>${esc(cvData.disponibilite)}</p>` : ''}
            ${langsList.length ? `<h2>Langues</h2><p>${langsList.map(esc).join('<br>')}</p>` : ''}
            ${compsList.length ? `<h2>Compétences</h2><p>${compsList.map(esc).join('<br>')}</p>` : ''}
          </div>
          <div class="main">
            <h1>${esc(cvData.nom || 'Votre Nom')}</h1>
            ${cvData.resume ? `<div class="section"><h2>Résumé professionnel</h2><p>${esc(cvData.resume)}</p></div>` : ''}
            ${expHTML ? `<div class="section"><h2>Expérience professionnelle</h2>${expHTML}</div>` : ''}
            ${eduHTML ? `<div class="section"><h2>Éducation</h2>${eduHTML}</div>` : ''}
            ${certsHTML ? `<div class="section"><h2>Certifications</h2><p>${certsHTML}</p></div>` : ''}
          </div>
        </div>
      `;
      break;

    case 'minimal':
      cvHTML = `
        <div class="template-minimal">
          <h1>${esc(cvData.nom || 'Votre Nom')}</h1>
          <div class="contact-line">
            ${esc(cvData.email || 'email@exemple.com')} • ${esc(cvData.telephone || '555-555-5555')}
            ${cvData.adresse ? ' • ' + esc(cvData.adresse) : ''}
            ${cvData.disponibilite ? ' • Disponibilité : ' + esc(cvData.disponibilite) : ''}
          </div>
          ${cvData.resume ? `<div class="section"><h2>Résumé</h2><p>${esc(cvData.resume)}</p></div>` : ''}
          ${expHTML ? `<div class="section"><h2>Expérience</h2>${expHTML}</div>` : ''}
          ${eduHTML ? `<div class="section"><h2>Éducation</h2>${eduHTML}</div>` : ''}
          ${certsHTML ? `<div class="section"><h2>Certifications</h2><p>${certsHTML}</p></div>` : ''}
          ${compsList.length ? `<div class="section"><h2>Compétences</h2><p>${compsList.map(esc).join(', ')}</p></div>` : ''}
          ${langsList.length ? `<div class="section"><h2>Langues</h2><p>${langsList.map(esc).join(', ')}</p></div>` : ''}
        </div>
      `;
      break;

    case 'securite':
      cvHTML = `
        <div class="template-securite">
          <div class="sidebar">
            <div class="agent-icon"><span>👮</span></div>
            <h2>Contact</h2>
            <p>${esc(cvData.email || 'email@exemple.com')}</p>
            <p>${esc(cvData.telephone || '555-555-5555')}</p>
            ${cvData.adresse ? `<p>${esc(cvData.adresse)}</p>` : ''}
            ${cvData.disponibilite ? `<p>Disponibilité : ${esc(cvData.disponibilite)}</p>` : ''}
            ${certsHTML ? `<h2>Certifications</h2><p>${certsHTML}</p>` : ''}
            ${langsList.length ? `<h2>Langues</h2><p>${langsList.map(esc).join('<br>')}</p>` : ''}
            ${compsList.length ? `<h2>Compétences</h2><p>${compsList.map(esc).join('<br>')}</p>` : ''}
          </div>
          <div class="main">
            <h1>${esc(cvData.nom || 'Votre Nom')}</h1>
            <div class="title">Agent de Sécurité Professionnel</div>
            ${cvData.resume ? `<div class="section"><h2>Profil</h2><p>${esc(cvData.resume)}</p></div>` : ''}
            ${expHTML ? `<div class="section"><h2>Expérience en Sécurité</h2>${expHTML}</div>` : ''}
            ${eduHTML ? `<div class="section"><h2>Formation</h2>${eduHTML}</div>` : ''}
          </div>
        </div>
      `;
      break;

    case 'moderne':
    default:
      cvHTML = `
        <div class="template-moderne">
          <div class="header">
            <h1>${esc(cvData.nom || 'Votre Nom')}</h1>
            <div class="contact-info">
              <span>${esc(cvData.email || 'email@exemple.com')}</span>
              <span>${esc(cvData.telephone || '555-555-5555')}</span>
              ${cvData.adresse ? `<span>${esc(cvData.adresse)}</span>` : ''}
              ${cvData.disponibilite ? `<span>${esc(cvData.disponibilite)}</span>` : ''}
            </div>
          </div>
          <div class="content">
            ${cvData.resume ? `<div class="section"><h2>Résumé professionnel</h2><p>${esc(cvData.resume)}</p></div>` : ''}
            ${expHTML ? `<div class="section"><h2>Expérience professionnelle</h2>${expHTML}</div>` : ''}
            ${eduHTML ? `<div class="section"><h2>Éducation</h2>${eduHTML}</div>` : ''}
            ${certsHTML ? `<div class="section"><h2>Certifications</h2><p>${certsHTML}</p></div>` : ''}
            <div class="modern-grid-section">
              ${compsList.length ? `<div class="section"><h2>Compétences</h2><p>${compsList.map(esc).join('<br>')}</p></div>` : ''}
              ${langsList.length ? `<div class="section"><h2>Langues</h2><p>${langsList.map(esc).join('<br>')}</p></div>` : ''}
            </div>
          </div>
        </div>
      `;
      break;
  }

  container.innerHTML = cvHTML;
  applyCustomColors(container, cvData, selectedTemplate);
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

function renderMultilineHTML(s) {
  return s ? escMultiline(s) : '';
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function escMultiline(s) {
  return esc(s).replace(/\n/g, '<br>');
}

function applyCustomColors(container, cvData, selectedTemplate) {
  if (!cvData) return;

  if (cvData.colorModerne && selectedTemplate === 'moderne') {
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
    const h2s = container.querySelectorAll('.template-moderne h2');
    h2s.forEach((h2) => {
      h2.style.color = cvData.colorModerne;
    });
  }

  if (cvData.colorClassique && selectedTemplate === 'classique') {
    const sidebar = container.querySelector('.template-classique .sidebar');
    if (sidebar) sidebar.style.backgroundColor = cvData.colorClassique;
  }

  if (cvData.colorSecurite && selectedTemplate === 'securite') {
    const sidebar = container.querySelector('.template-securite .sidebar');
    if (sidebar) sidebar.style.backgroundColor = cvData.colorSecurite;
  }

  if (cvData.colorMinimal && selectedTemplate === 'minimal') {
    const h2s = container.querySelectorAll('.template-minimal h2');
    h2s.forEach((h2) => {
      h2.style.color = cvData.colorMinimal;
    });
    const existingStyle = container.querySelector('style.minimal-custom');
    if (existingStyle) existingStyle.remove();
    const style = document.createElement('style');
    style.className = 'minimal-custom';
    style.textContent = `.template-minimal h2:before { background: ${cvData.colorMinimal} !important; }`;
    container.appendChild(style);
  }
}
