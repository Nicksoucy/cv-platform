/**
 * Word-friendly export. Generates a Word-readable HTML document and
 * downloads it as a .doc file (MIME application/msword). Word and
 * LibreOffice both open it; most online job platforms accept .doc.
 *
 * We render from the structured CV data rather than reusing the
 * template HTML so the output is a simple single-column layout that
 * Word's renderer handles cleanly.
 */
(function (root) {
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function sectionMap(cvData) {
    const arr = Array.isArray(cvData.sections) ? cvData.sections : [];
    const map = {};
    arr.forEach((s) => (map[s.id] = s.visible !== false));
    ['resume', 'experience', 'education', 'certifications', 'competences', 'langues'].forEach((id) => {
      if (!(id in map)) map[id] = true;
    });
    return map;
  }

  function orderedSections(cvData) {
    const fallback = ['resume', 'experience', 'education', 'certifications', 'competences', 'langues'];
    const arr = Array.isArray(cvData.sections) && cvData.sections.length
      ? cvData.sections
      : fallback.map((id) => ({ id, visible: true }));
    return arr.filter((s) => s.visible !== false).map((s) => s.id);
  }

  function expHTML(cvData) {
    const arr = cvData.experiences;
    if (Array.isArray(arr) && arr.length) {
      return arr
        .map((item) => {
          const head = [item.type, item.employer].filter(Boolean).map(esc).join(' — ');
          const period = item.period ? ` <i>(${esc(item.period)})</i>` : '';
          const bullets = (item.bullets || []).length
            ? `<ul>${item.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`
            : '';
          return `<p style="margin:6pt 0 2pt 0;"><b>${head || 'Poste'}</b>${period}</p>${bullets}`;
        })
        .join('');
    }
    return cvData.experience ? `<p>${esc(cvData.experience).replace(/\n/g, '<br>')}</p>` : '';
  }

  function eduHTML(cvData) {
    const arr = cvData.educations;
    if (Array.isArray(arr) && arr.length) {
      return arr
        .map((item) => {
          const left = [item.type, item.domain ? 'en ' + item.domain : ''].filter(Boolean).join(' ');
          const right = [item.school, item.year ? '(' + item.year + ')' : ''].filter(Boolean).join(' ');
          const line = [left, right].filter(Boolean).join(' — ');
          return `<p style="margin:4pt 0;">${esc(line)}</p>`;
        })
        .join('');
    }
    return cvData.education ? `<p>${esc(cvData.education).replace(/\n/g, '<br>')}</p>` : '';
  }

  function sectionHTML(cvData, id, accent) {
    const heading = (label) => `<h2 style="font-size:13pt;color:${accent};margin:14pt 0 4pt 0;text-transform:uppercase;letter-spacing:0.5pt;">${label}</h2>`;
    switch (id) {
      case 'resume':
        return cvData.resume ? heading('Résumé professionnel') + `<p>${esc(cvData.resume)}</p>` : '';
      case 'experience': {
        const h = expHTML(cvData);
        return h ? heading('Expérience professionnelle') + h : '';
      }
      case 'education': {
        const h = eduHTML(cvData);
        return h ? heading('Éducation') + h : '';
      }
      case 'certifications':
        return cvData.certifications ? heading('Certifications') + `<p>${esc(cvData.certifications).replace(/\n/g, '<br>')}</p>` : '';
      case 'competences': {
        const list = (cvData.competences || '').split(',').map((s) => s.trim()).filter(Boolean);
        return list.length ? heading('Compétences') + `<p>${list.map(esc).join(' • ')}</p>` : '';
      }
      case 'langues': {
        const list = (cvData.langues || '').split(',').map((s) => s.trim()).filter(Boolean);
        return list.length ? heading('Langues') + `<p>${list.map(esc).join(' • ')}</p>` : '';
      }
      default:
        return '';
    }
  }

  function buildDocHTML(cv) {
    const data = cv.data || {};
    const accent = data.colorModerne || '#2563eb';
    const contactBits = [data.email, data.telephone, data.adresse, data.disponibilite].filter(Boolean).map(esc);
    const order = orderedSections(data);
    const visible = sectionMap(data);
    const photoHTML = data.photo
      ? `<img src="${data.photo}" style="width:84pt;height:84pt;border-radius:50%;float:right;margin-left:12pt;" alt="" />`
      : '';

    const body = order.filter((id) => visible[id]).map((id) => sectionHTML(data, id, accent)).join('');

    return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>${esc(data.nom || 'CV')}</title>
<!--[if gte mso 9]>
<xml>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
    <w:DoNotOptimizeForBrowser/>
  </w:WordDocument>
</xml>
<![endif]-->
<style>
  @page { size: 8.5in 11in; margin: 0.5in; }
  body { font-family: Calibri, sans-serif; font-size: 11pt; color: #1f2937; }
  h1 { font-size: 22pt; margin: 0 0 4pt 0; color: ${accent}; }
  h2 { font-size: 13pt; }
  p { margin: 4pt 0; line-height: 1.4; }
  ul { margin: 4pt 0 4pt 16pt; padding: 0; }
  li { margin-bottom: 2pt; }
  .contact { color: #4b5563; font-size: 10pt; margin-bottom: 10pt; border-bottom: 1pt solid #e5e7eb; padding-bottom: 6pt; }
</style>
</head>
<body>
${photoHTML}
<h1>${esc(data.nom || 'Votre Nom')}</h1>
<div class="contact">${contactBits.join(' &nbsp;•&nbsp; ')}</div>
${body}
</body>
</html>`;
  }

  function downloadDoc(cv) {
    const html = buildDocHTML(cv);
    // BOM + content; some Word versions read encoding from BOM.
    const blob = new Blob(['﻿' + html], { type: 'application/msword' });
    const safeName = String((cv.data && cv.data.nom) || cv.name || 'CV').trim().replace(/\s+/g, '_');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `CV_${safeName}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  root.DocxExport = { downloadDoc, buildDocHTML };
})(window);
