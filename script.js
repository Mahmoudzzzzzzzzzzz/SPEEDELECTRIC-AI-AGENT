// Replace with your actual GroqCloud API key
const GROQ_API_KEY = "YOUR_GROQ_API_KEY_HERE";

// Gmail OAuth connection
function connectGmail() {
  const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
  const SCOPES = 'https://www.googleapis.com/auth/gmail.send  https://www.googleapis.com/auth/gmail.readonly'; 

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?scope=${encodeURIComponent(SCOPES)}&response_type=token&redirect_uri=${encodeURIComponent('https://yourusername.github.io/speed-electric-agent/')}&client_id=${CLIENT_ID}`;

  window.open(authUrl, '_blank', 'width=600,height=400');
}

// Run on page load to check for token
window.onload = () => {
  const hash = location.hash.substring(1);
  const params = new URLSearchParams(hash);

  if (params.has('access_token')) {
    const accessToken = params.get('access_token');
    localStorage.setItem('gmail_token', accessToken);
    alert("✅ Successfully connected to Gmail!");
  }
};

// Function to generate proposal using AI
document.getElementById("sendProposalBtn").addEventListener("click", async () => {
  const output = document.getElementById("output");
  output.innerText = "Generating proposal...";

  const template = document.getElementById("proposalTemplate").value;

  if (!template.trim()) {
    alert("Please paste a proposal template first.");
    return;
  }

  const prompt = `
    You are an AI assistant helping Speed Electric write professional electrical bid proposals.
    Use this template:\n\n${template}\n\n
    Write a personalized email proposal for a customer asking about an electrical job.
  `;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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

    output.innerHTML = `<strong>Generated Proposal:</strong>\n\n${proposal}`;
  } catch (error) {
    console.error(error);
    output.innerText = "Error generating proposal.";
  }
});
