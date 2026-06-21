/**
 * Anthropic API helper for inline writing assistance.
 *
 * Keys are stored locally (CVStore.getApiKey) and the request is made
 * directly from the browser using anthropic-dangerous-direct-browser-access.
 * For production use you should put a tiny proxy in front of this call so
 * the key isn't exposed to other scripts running on the same origin.
 */
(function (root) {
  const MODEL = 'claude-haiku-4-5-20251001';
  const API_URL = 'https://api.anthropic.com/v1/messages';

  async function callClaude(prompt, opts) {
    const apiKey = (root.CVStore && root.CVStore.getApiKey()) || '';
    if (!apiKey) {
      throw new Error('NO_API_KEY');
    }
    const r = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: (opts && opts.maxTokens) || 600,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      throw new Error('API_ERROR_' + r.status + ': ' + txt.slice(0, 200));
    }
    const data = await r.json();
    const block = data && data.content && data.content[0];
    if (!block || !block.text) throw new Error('NO_TEXT');
    return block.text.trim();
  }

  function improveResume(text) {
    return callClaude(
      `Tu améliores un résumé professionnel pour un CV d'agent de sécurité au Québec.\n` +
        `Garde environ la même longueur. Utilise un français professionnel et neutre. ` +
        `Rends-le plus percutant en gardant les faits identiques.\n\n` +
        `Réponds UNIQUEMENT avec le texte amélioré, sans guillemets ni commentaire.\n\n` +
        `Texte à améliorer :\n${text}`
    );
  }

  function improveBullet(text) {
    return callClaude(
      `Tu améliores une seule responsabilité ou réalisation pour un CV.\n` +
        `Commence par un verbe d'action fort. Garde une seule ligne, sans puce.\n` +
        `Garde les faits identiques (chiffres, lieux, durées). Français professionnel.\n\n` +
        `Réponds UNIQUEMENT avec la ligne améliorée.\n\n` +
        `Texte : ${text}`,
      { maxTokens: 200 }
    );
  }

  function translateToEnglish(text) {
    return callClaude(
      `Translate the following French text to clear, natural English suitable for a Canadian résumé.\n` +
        `Reply ONLY with the translation, no quotes, no commentary.\n\nText:\n${text}`
    );
  }

  async function generateCoverLetterBody(cv, target) {
    const data = cv.data || {};
    const expSummary = (data.experiences || [])
      .slice(0, 5)
      .map((e) => `- ${e.type || ''} chez ${e.employer || ''} (${e.period || ''})`)
      .join('\n');
    const eduSummary = (data.educations || [])
      .slice(0, 5)
      .map((e) => `- ${e.type || ''} ${e.domain || ''} - ${e.school || ''} (${e.year || ''})`)
      .join('\n');

    const prompt =
      `Rédige le corps d'une lettre de motivation en français pour le poste suivant.\n` +
      `Trois paragraphes courts, ton professionnel mais chaleureux, axé sur la valeur pour l'employeur.\n` +
      `N'invente pas d'expériences absentes. N'inclus PAS l'en-tête, la date, la salutation ni la formule de politesse — ` +
      `uniquement les paragraphes du corps. Réponds UNIQUEMENT avec le texte.\n\n` +
      `Entreprise : ${target.company || '(non spécifiée)'}\n` +
      `Poste : ${target.role || '(non spécifié)'}\n` +
      `Points à mettre en avant : ${target.highlights || '(libre)'}\n\n` +
      `Candidat : ${data.nom || ''}\n` +
      `Résumé : ${data.resume || ''}\n\n` +
      `Expériences :\n${expSummary || '(aucune)'}\n\n` +
      `Formation :\n${eduSummary || '(aucune)'}\n\n` +
      `Compétences : ${data.competences || ''}\n` +
      `Certifications : ${data.certifications || ''}`;

    return callClaude(prompt, { maxTokens: 900 });
  }

  root.AI = {
    callClaude,
    improveResume,
    improveBullet,
    translateToEnglish,
    generateCoverLetterBody,
  };
})(window);
