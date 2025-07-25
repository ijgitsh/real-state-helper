
function extractListingDetails() {
  const pageText = document.body.innerText;
  const price = (pageText.match(/\$[\d,]+/g) || []).shift() || 'Unknown';

  const titleEl = document.querySelector('h1, h2, .property-title, .listing-title');
  const title = titleEl?.innerText.trim() || 'Unknown address/title';

  const lotSizeMatch = pageText.match(/(?:Lot Size|Size):?\s*([\d.,]+\s*(?:acres?|ha|sq ft))/i)
    || pageText.match(/[\d.,]+\s*(?:acres?|ha|sq ft)/i);
  const lotSize = lotSizeMatch ? lotSizeMatch[1] : 'Unknown';

  const zoningMatch = pageText.match(/Zoning:?[\s\n]*([A-Za-z0-9\- ]+)/i);
  const zoning = zoningMatch ? zoningMatch[1].trim() : 'Unknown';

  const descEl = document.querySelector('.description, .property-description, #description, .remarks');
  const description = descEl ? descEl.innerText.trim() : '';

  const type = pageText.match(/\b(Land|House|Lot|Building)\b/i)?.[0] || 'Unknown type';

  return {
    price,
    title,
    lotSize,
    zoning,
    type,
    description,
    url: window.location.href
  };
}

async function getAIAdvice(data) {
  const prompt = `You are a real estate investment advisor. Here’s a new listing with details: 
- Title: ${data.title}
- Price: ${data.price}
- Lot Size: ${data.lotSize}
- Zoning: ${data.zoning}
- Type: ${data.type}
- Description: ${data.description ? data.description.substring(0, 300) + '...' : 'None'}
- URL: ${data.url}

Analyze how this could be profitable. Include:
1. Flip potential (as-is)
2. Build-to-sell or build-to-rent strategy
3. Hold as long-term or seasonal asset

Provide ROI estimates, pros/cons, and recommend a top investment route.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_OPENAI_API_KEY"
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    })
  });

  const result = await response.json();
  return result.choices?.[0]?.message?.content || "No response.";
}

async function injectFloatingWidget() {
  const widget = document.createElement("div");
  widget.id = "real-estate-ai-widget";
  widget.style.position = "fixed";
  widget.style.bottom = "20px";
  widget.style.right = "20px";
  widget.style.width = "360px";
  widget.style.maxHeight = "400px";
  widget.style.overflowY = "auto";
  widget.style.background = "#fffffff2";
  widget.style.border = "1px solid #ccc";
  widget.style.borderRadius = "12px";
  widget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.2)";
  widget.style.padding = "16px";
  widget.style.fontFamily = "Segoe UI, sans-serif";
  widget.style.fontSize = "14px";
  widget.style.color = "#333";
  widget.style.zIndex = "9999";
  widget.innerHTML = `
    <div style="font-weight:bold; margin-bottom: 10px; font-size: 16px;">💡 AI Investment Insight</div>
    <div id="real-estate-ai-text">Analyzing property...</div>
  `;
  document.body.appendChild(widget);

  const data = extractListingDetails();
  const suggestion = await getAIAdvice(data);
  document.getElementById("real-estate-ai-text").innerText = suggestion;
}

injectFloatingWidget();
