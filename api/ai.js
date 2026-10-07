/**
 * Vercel Serverless Function — AI proxy for CV Platform.
 *
 * The browser calls POST /api/ai with { prompt, maxTokens } and receives
 * { text }. The Anthropic API key lives in the ANTHROPIC_API_KEY
 * environment variable and never reaches the browser.
 *
 * Deploy: push this repo to Vercel, then set ANTHROPIC_API_KEY in the
 * project settings (Environment Variables).
 */
const MODEL = 'claude-haiku-4-5-20251001';
const MAX_PROMPT_CHARS = 12000;
const MAX_TOKENS = 2000;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'missing_api_key' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (_) {
      body = {};
    }
  }
  body = body || {};

  const prompt = body.prompt;
  if (!prompt || typeof prompt !== 'string' || prompt.length > MAX_PROMPT_CHARS) {
    res.status(400).json({ error: 'bad_prompt' });
    return;
  }
  const maxTokens = Math.min(
    Math.max(parseInt(body.maxTokens, 10) || 600, 1),
    MAX_TOKENS
  );

  let r;
  try {
    r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } catch (e) {
    res.status(502).json({ error: 'upstream_unreachable' });
    return;
  }

  if (!r.ok) {
    res.status(502).json({ error: 'upstream_error', status: r.status });
    return;
  }

  const data = await r.json();
  const block = data && data.content && data.content[0];
  res.status(200).json({ text: (block && block.text ? String(block.text) : '').trim() });
};
