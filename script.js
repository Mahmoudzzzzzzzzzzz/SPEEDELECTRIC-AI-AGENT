// Replace these with your own values
const GROQ_API_KEY = "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";
const CLIENT_ID = "1077849381122-ksll30feg3qn1chq5cg9jf3afpsiu3k9.apps.googleusercontent.com";
const REDIRECT_URI = "https://mahmoudzzzzzzzzzzz.github.io/speed-electric-agent/"; 

// Function to open Gmail OAuth popup
function connectGmail() {
  const SCOPES = 'https://www.googleapis.com/auth/gmail.send  https://www.googleapis.com/auth/gmail.readonly'; 

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?scope=${encodeURIComponent(SCOPES)}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_id=${CLIENT_ID}`;

  window.open(authUrl, '_blank', 'width=600,height=400');
}

// On load, check if we got an access token from Google
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
async function generateProposal(template, customerName, projectName) {
  const prompt = `
    Write a professional electrical bid proposal for ${customerName} about "${projectName}".
    Use this template:\n\n${template}\n\n
    Keep it formal, professional, and ready to send.
  `;

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
  return data.choices[0].message.content;
}

// Function to send email using Gmail API
async function sendEmail(subject, body, recipient = "customer@example.com") {
  const token = localStorage.getItem('gmail_token');

  if (!token) {
    alert("❌ Not connected to Gmail");
    return false;
  }

  // Create raw email format
  const rawMessage = [
    `To: ${recipient}`,
    `Subject: ${subject}`,
    ``,
    `${body}`
  ].join('\r\n');

  // Encode to Base64
  const encodedMessage = btoa(rawMessage).replace(/\+/g, '-').replace(/\//g, '_');

  // Send email
  const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw: encodedMessage
    })
  });

  return response.ok;
}

// Event listener for sending proposal
document.getElementById("sendProposalBtn").addEventListener("click", async () => {
  const output = document.getElementById("output");
  const template = document.getElementById("proposalTemplate").value;

  if (!template.trim()) {
    alert("Please paste a proposal template.");
    return;
  }

  output.innerText = "🧠 Generating proposal...";

  // Example customer name and project
  const customerName = "John Doe";
  const projectName = "Warehouse Electrical Upgrade";

  // Generate email content using AI
  const proposal = await generateProposal(template, customerName, projectName);
  output.innerHTML = `<strong>Generated Proposal:</strong>\n\n${proposal}`;

  // Ask user to confirm before sending
  if (confirm("Send this proposal via Gmail?")) {
    const sent = await sendEmail(`Electrical Bid Proposal - ${projectName}`, proposal);
    if (sent) {
      output.innerHTML += "\n\n✅ Proposal sent successfully!";
      alert("✅ Proposal sent successfully!");
    } else {
      output.innerHTML += "\n\n❌ Failed to send proposal.";
      alert("❌ Failed to send email.");
    }
  }
});
