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
  function connectGmail() {
  const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
  const SCOPES = 'https://www.googleapis.com/auth/gmail.send  https://www.googleapis.com/auth/gmail.readonly'; 

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?scope=${encodeURIComponent(SCOPES)}&response_type=token&redirect_uri=${encodeURIComponent('https://yourusername.github.io/speed-electric-agent/')}&client_id=${CLIENT_ID}`;

  window.open(authUrl, '_blank', 'width=600,height=400');
}
});
window.onload = () => {
  const hash = location.hash.substring(1);
  const params = new URLSearchParams(hash);

  if (params.has('access_token')) {
    const accessToken = params.get('access_token');
    localStorage.setItem('gmail_token', accessToken);
    alert("✅ Successfully connected to Gmail!");
  }
};
function generateProposal(template, data) {
  let result = template;

  for (const key in data) {
    const placeholder = `[${key}]`;
    const value = data[key];
    result = result.replaceAll(placeholder, value);
  }

  return result;
}
async function sendEmailGmail(subject, body) {
  const token = localStorage.getItem('gmail_token');
  if (!token) {
    alert("❌ Not connected to Gmail");
    return;
  }

  const rawMessage = [
    `From: me`,
    `To: customer@example.com`,
    `Subject: ${subject}`,
    ``,
    `${body}`
  ].join('\r\n');

  const encodedMessage = btoa(rawMessage).replace(/\+/g, '-').replace(/\//g, '_');

  const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send',  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw: encodedMessage
    })
  });

  if (response.ok) {
    alert("✅ Proposal sent successfully!");
  } else {
    alert("❌ Failed to send proposal.");
  }
}
document.getElementById("sendProposalBtn").addEventListener("click", async () => {
  const template = document.getElementById("proposalTemplate").value;
  const customerData = {
    "Project Name": "Warehouse Wiring",
    "Customer Name": "John Smith"
  };

  const filledProposal = generateProposal(template, customerData);

  document.getElementById("output").innerHTML = `<strong>Filled Proposal:</strong><br><br>${filledProposal}`;

  // Optional: Ask for confirmation
  if (confirm("Send this proposal via Gmail?")) {
    await sendEmailGmail("Electrical Bid Proposal", filledProposal);
  }
});
