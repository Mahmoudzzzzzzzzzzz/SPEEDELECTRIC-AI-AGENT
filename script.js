const GROQ_API_KEY = "YOUR_GROQ_API_KEY_HERE";

document.getElementById("connectGmailBtn").addEventListener("click", () => {
  alert("Connecting to Gmail...");
});

document.getElementById("sendProposalBtn").addEventListener("click", async () => {
  const output = document.getElementById("output");
  output.innerText = "Generating proposal...";

  const prompt = `
    Write a professional electrical bid proposal for a customer.
    Include project scope, pricing, and contact info.
  `;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions',  {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const proposal = data.choices[0].message.content;

    output.innerHTML = `<strong>Generated Proposal:</strong><br><br>${proposal}`;
  } catch (error) {
    console.error(error);
    output.innerText = "Error generating proposal.";
  }
});
