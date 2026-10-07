/**
 * AI writing assistance for CV Platform.
 *
 * The browser never holds an API key and never talks to api.anthropic.com
 * directly. All requests go to the platform's server-side proxy
 * (see /api/ai.js for the Vercel reference implementation), which adds
 * the Anthropic key from its own environment.
 *
 * Override the endpoint with window.CV_PLATFORM_AI_PROXY before this
 * script loads, e.g.:
 *   <script>window.CV_PLATFORM_AI_PROXY = 'https://example.com/api/ai';</script>
 */
(function (root) {
  var PROXY_URL = root.CV_PLATFORM_AI_PROXY || '/api/ai';

  async function callClaude(prompt, opts) {
    var r;
    try {
      r = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          maxTokens: (opts && opts.maxTokens) || 600,
        }),
      });
    } catch (e) {
      throw new Error('PROXY_UNREACHABLE');
    }
    if (r.status === 404) throw new Error('PROXY_NOT_CONFIGURED');
    if (!r.ok) {
      var txt = await r.text().catch(function () { return ''; });
      throw new Error('API_ERROR_' + r.status + ': ' + txt.slice(0, 200));
    }
    var data = await r.json();
    if (!data || typeof data.text !== 'string' || !data.text.trim()) {
      throw new Error('NO_TEXT');
    }
    return data.text.trim();
  }

  /** User-facing French message for an AI failure. */
  function describeError(err) {
    var m = (err && err.message) || '';
    if (m === 'PROXY_NOT_CONFIGURED' || m === 'PROXY_UNREACHABLE') {
      return "L'assistant IA n'est pas disponible pour le moment. Réessayez plus tard.";
    }
    return 'Erreur IA : ' + m;
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
    describeError,
    improveResume,
    improveBullet,
    translateToEnglish,
    generateCoverLetterBody,
  };
})(window);
