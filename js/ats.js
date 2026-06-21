/**
 * Lightweight ATS-style keyword check. Compares the text of a target job
 * description against the active CV and reports which significant terms
 * appear and which are missing.
 *
 * The algorithm is intentionally simple: lowercase + accent-strip + tokenise,
 * drop stopwords and short tokens, intersect with the CV's term set. It is
 * meant as a writing hint, not a real ATS simulation.
 */
(function (root) {
  const STOPWORDS = new Set([
    // French
    'le','la','les','un','une','des','de','du','et','ou','mais','ou','a','au','aux','dans','par','pour','sur','sous','avec','sans','ce','cet','cette','ces','mon','ma','mes','ton','ta','tes','son','sa','ses','notre','nos','votre','vos','leur','leurs','nous','vous','ils','elles','je','tu','il','elle','on','est','sont','etre','avoir','ete','fait','faire','plus','tres','bien','tous','toutes','tout','toute','qui','que','quoi','dont','comme','si','oui','non','peu','beaucoup','encore','deja','ici','la','vers','entre','sera','seront','etait','etaient','plusieurs','chaque','aussi','meme','memes','contre','selon','depuis','pendant','apres','avant','autre','autres','votre','notre','nos','vos','toi','moi','soit','soit','soient','dont','quel','quels','quelle','quelles',
    // English
    'the','a','an','and','or','but','if','then','when','where','while','of','in','on','at','to','for','with','without','by','from','into','onto','off','over','under','this','that','these','those','my','your','his','her','our','their','is','are','was','were','be','been','have','has','had','do','does','did','will','would','could','should','may','might','can','all','any','some','more','less','most','least','only','also','such','than','very','must','about','as','it','its','they','them','we','i','you','he','she',
    // CV filler
    'experience','annee','annees','ans','poste','postes','equipe','equipes','client','clients','clientele','responsable','responsabilite','responsabilites','niveau','base','utilisation','utiliser','permettre','assurer','mettre','prendre','effectuer','travail','travailler','travaille'
  ]);

  // Domain-specific synonyms — counting either side as a match for the other.
  const SYNONYMS = [
    ['bsp', 'bureau de la securite privee'],
    ['rcr', 'reanimation cardio-respiratoire', 'secourisme'],
    ['dea', 'defibrillateur'],
    ['54h', 'formation 54h', 'formation 54 heures'],
    ['cpi', 'crisis prevention'],
    ['controle d acces', 'controle access', 'access control'],
    ['patrouille', 'patrouilles', 'rondes', 'ronde'],
    ['rapport', 'rapports', 'rapport d incident'],
    ['desescalade', 'de-escalation', 'desescalader'],
    ['bilingue', 'bilingual'],
  ];

  function normalise(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // strip accents
      .replace(/[^a-z0-9\s']/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tokenize(s) {
    return normalise(s).split(' ').filter((w) => w.length >= 4 && !STOPWORDS.has(w));
  }

  function cvCorpus(cvData) {
    const data = cvData || {};
    const parts = [];
    parts.push(data.nom, data.adresse, data.disponibilite, data.resume, data.certifications, data.competences, data.langues, data.experience, data.education);
    (data.experiences || []).forEach((e) => {
      parts.push(e.type, e.employer, (e.bullets || []).join(' '));
    });
    (data.educations || []).forEach((e) => {
      parts.push(e.type, e.domain, e.school, e.year);
    });
    return normalise(parts.filter(Boolean).join(' '));
  }

  function matchToken(token, corpus) {
    if (corpus.indexOf(token) !== -1) return true;
    for (const group of SYNONYMS) {
      if (group.includes(token) && group.some((alt) => corpus.indexOf(normalise(alt)) !== -1)) return true;
    }
    return false;
  }

  function analyse(jobDescription, cvData) {
    const corpus = cvCorpus(cvData);
    const tokens = tokenize(jobDescription);
    const uniq = Array.from(new Set(tokens));
    const matched = [];
    const missing = [];
    uniq.forEach((t) => {
      if (matchToken(t, corpus)) matched.push(t);
      else missing.push(t);
    });
    const score = uniq.length ? Math.round((matched.length / uniq.length) * 100) : 0;
    return { score, matched, missing, total: uniq.length };
  }

  root.ATS = { analyse, normalise, tokenize, cvCorpus };
})(window);
