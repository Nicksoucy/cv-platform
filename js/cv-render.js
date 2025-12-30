/**
 * Renders the CV into the specified container based on data and template.
 * @param {string} containerId - The ID of the container element.
 * @param {object} cvData - The data object containing CV info.
 * @param {string} selectedTemplate - The template name (moderne, classique, minimal, securite).
 */
function renderCV(containerId, cvData, selectedTemplate) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let cvHTML = "";

  switch (selectedTemplate) {
    case "moderne":
      cvHTML = `
        <div class="template-moderne">
          <div class="header">
            <h1>${cvData.nom || 'Votre Nom'}</h1>
              <div class="contact-info">
                <span>${cvData.email || 'email@exemple.com'}</span>
                <span>${cvData.telephone || '555-555-5555'}</span>
                ${cvData.adresse ? `<span>${cvData.adresse}</span>` : ""}
                ${cvData.disponibilite
          ? `<span>${cvData.disponibilite}</span>`
          : ""
        }
              </div>
          </div>
          <div class="content">
            ${cvData.resume
          ? `<div class="section"><h2>Résumé professionnel</h2><p>${cvData.resume}</p></div>`
          : ""
        }
            ${cvData.experience
          ? `<div class="section"><h2>Expérience professionnelle</h2><p>${cvData.experience.replace(
            /\n/g,
            "<br>"
          )}</p></div>`
          : ""
        }
            ${cvData.education
          ? `<div class="section"><h2>Éducation</h2><p>${cvData.education.replace(
            /\n/g,
            "<br>"
          )}</p></div>`
          : ""
        }
            ${cvData.certifications
          ? `<div class="section"><h2>Certifications</h2><p>${cvData.certifications.replace(
            /\n/g,
            "<br>"
          )}</p></div>`
          : ""
        }
            
            <div class="modern-grid-section">
                ${cvData.competences
          ? `<div class="section"><h2>Compétences</h2><p>${cvData.competences.replace(/, /g, '<br>')}</p></div>`
          : ""
        }
                ${cvData.langues
          ? `<div class="section"><h2>Langues</h2><p>${cvData.langues.replace(/, /g, '<br>')}</p></div>`
          : ""
        }
            </div>
          </div>
        </div>
      `;
      break;

    case "classique":
      cvHTML = `
        <div class="template-classique">
          <div class="sidebar">
            <h2>Coordonnées</h2>
            <p><strong>Courriel :</strong><br>${cvData.email || 'email@exemple.com'}</p>
            <p><strong>Tél. :</strong><br>${cvData.telephone || '555-555-5555'}</p>
            ${cvData.adresse
          ? `<p><strong>Adresse :</strong><br>${cvData.adresse}</p>`
          : ""
        }
            ${cvData.disponibilite
          ? `<p><strong>Disponibilité :</strong><br>${cvData.disponibilite}</p>`
          : ""
        }
  
            ${cvData.langues
          ? `<h2>Langues</h2><p>${cvData.langues}</p>`
          : ""
        }
            ${cvData.competences
          ? `<h2>Compétences</h2><p>${cvData.competences.replace(
            /,/g,
            "<br>"
          )}</p>`
          : ""
        }
          </div>
          <div class="main">
            <h1>${cvData.nom || 'Votre Nom'}</h1>
            ${cvData.resume
          ? `<div class="section"><h2>Résumé professionnel</h2><p>${cvData.resume}</p></div>`
          : ""
        }
            ${cvData.experience
          ? `<div class="section"><h2>Expérience professionnelle</h2><p>${cvData.experience.replace(
            /\n/g,
            "<br>"
          )}</p></div>`
          : ""
        }
            ${cvData.education
          ? `<div class="section"><h2>Éducation</h2><p>${cvData.education.replace(
            /\n/g,
            "<br>"
          )}</p></div>`
          : ""
        }
            ${cvData.certifications
          ? `<div class="section"><h2>Certifications</h2><p>${cvData.certifications.replace(
            /\n/g,
            "<br>"
          )}</p></div>`
          : ""
        }
          </div>
        </div>
      `;
      break;

    case "minimal":
      cvHTML = `
        <div class="template-minimal">
          <h1>${cvData.nom || 'Votre Nom'}</h1>
            <div class="contact-line">
              ${cvData.email || 'email@exemple.com'} • ${cvData.telephone || '555-555-5555'}
              ${cvData.adresse ? " • " + cvData.adresse : ""}
           ${cvData.disponibilite
          ? " • Disponibilité : " + cvData.disponibilite
          : ""
        }
            </div>
          ${cvData.resume
          ? `<div class="section"><h2>Résumé</h2><p>${cvData.resume}</p></div>`
          : ""
        }
          ${cvData.experience
          ? `<div class="section"><h2>Expérience</h2><p>${cvData.experience.replace(
            /\n/g,
            "<br>"
          )}</p></div>`
          : ""
        }
          ${cvData.education
          ? `<div class="section"><h2>Éducation</h2><p>${cvData.education.replace(
            /\n/g,
            "<br>"
          )}</p></div>`
          : ""
        }
          ${cvData.certifications
          ? `<div class="section"><h2>Certifications</h2><p>${cvData.certifications.replace(
            /\n/g,
            "<br>"
          )}</p></div>`
          : ""
        }
          ${cvData.competences
          ? `<div class="section"><h2>Compétences</h2><p>${cvData.competences}</p></div>`
          : ""
        }
          ${cvData.langues
          ? `<div class="section"><h2>Langues</h2><p>${cvData.langues}</p></div>`
          : ""
        }
        </div>
      `;
      break;

    case "securite":
      cvHTML = `
        <div class="template-securite">
          <div class="sidebar">
            <div class="agent-icon">
              <span>👮</span>
            </div>
            
            <h2>Contact</h2>
            <p>${cvData.email || 'email@exemple.com'}</p>
            <p>${cvData.telephone || '555-555-5555'}</p>
            ${cvData.adresse ? `<p>${cvData.adresse}</p>` : ""}
        ${cvData.disponibilite
          ? `<p>Disponibilité : ${cvData.disponibilite}</p>`
          : ""
        }
  
  
            ${cvData.certifications
          ? `<h2>Certifications</h2><p>${cvData.certifications.replace(
            /\n/g,
            "<br>"
          )}</p>`
          : ""
        }
            ${cvData.langues
          ? `<h2>Langues</h2><p>${cvData.langues}</p>`
          : ""
        }
            ${cvData.competences
          ? `<h2>Compétences</h2><p>${cvData.competences.replace(
            /,/g,
            "<br>"
          )}</p>`
          : ""
        }
          </div>
          <div class="main">
            <h1>${cvData.nom || 'Votre Nom'}</h1>
            <div class="title">Agent de Sécurité Professionnel</div>
            
            ${cvData.resume
          ? `<div class="section"><h2>Profil</h2><p>${cvData.resume}</p></div>`
          : ""
        }
            ${cvData.experience
          ? `<div class="section"><h2>Expérience en Sécurité</h2><p>${cvData.experience.replace(
            /\n/g,
            "<br>"
          )}</p></div>`
          : ""
        }
            ${cvData.education
          ? `<div class="section"><h2>Formation</h2><p>${cvData.education.replace(
            /\n/g,
            "<br>"
          )}</p></div>`
          : ""
        }
          </div>
        </div>
      `;
      break;
  }

  container.innerHTML = cvHTML;
  applyCustomColors(container, cvData, selectedTemplate);
}

function applyCustomColors(container, cvData, selectedTemplate) {
  if (!cvData) return;

  // Appliquer les couleurs personnalisées selon le template
  if (cvData.colorModerne && selectedTemplate === "moderne") {
    const header = container.querySelector(".template-moderne .header");
    if (header) {
      header.style.backgroundColor = cvData.colorModerne;
      // Ensure text remains white for contrast on colored backgrounds
      header.style.color = "white";
      header.style.borderBottom = "none";
    }
    const h1 = container.querySelector(".template-moderne .header h1");
    if (h1) h1.style.color = "white";

    // Update contact info text color to white
    const contactInfo = container.querySelector(".template-moderne .contact-info");
    if (contactInfo) contactInfo.style.color = "rgba(255, 255, 255, 0.9)";

    const h2s = container.querySelectorAll(".template-moderne h2");
    h2s.forEach(h2 => {
      h2.style.color = cvData.colorModerne;
    });
  }

  if (cvData.colorClassique && selectedTemplate === "classique") {
    const sidebar = container.querySelector(".template-classique .sidebar");
    if (sidebar) {
      sidebar.style.backgroundColor = cvData.colorClassique;
    }
  }

  if (cvData.colorSecurite && selectedTemplate === "securite") {
    const sidebar = container.querySelector(".template-securite .sidebar");
    if (sidebar) {
      sidebar.style.backgroundColor = cvData.colorSecurite;
    }
  }

  if (cvData.colorMinimal && selectedTemplate === "minimal") {
    const h2s = container.querySelectorAll(".template-minimal h2");
    h2s.forEach(h2 => {
      h2.style.color = cvData.colorMinimal;
    });
    // Note: pseudo-elements are hard to style via inline JS. 
    // For live preview, we might skip the 'before' dots color or inject a style tag scoped to container.
    // Doing a simple style injection:
    const existingStyle = container.querySelector('style.minimal-custom');
    if (existingStyle) existingStyle.remove();

    const style = document.createElement("style");
    style.className = 'minimal-custom';
    // We need to be specific to this container to avoid global pollution if possible, 
    // but pseudo-elements require real CSS rules.
    // Trying to scope it with container ID logic might be complex if containerId varies.
    // For now, simpler approach:
    style.textContent = `.template-minimal h2:before { background: ${cvData.colorMinimal} !important; }`;
    container.appendChild(style);
  }
}
