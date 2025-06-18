// Replace these with your own values
const GROQ_API_KEY = "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";
const CLIENT_ID = "1077849381122-ksll30feg3qn1chq5cg9jf3afpsiu3k9.apps.googleusercontent.com";
const REDIRECT_URI = "https://mahmoudzzzzzzzzzzz.github.io/SPEEDELECTRIC-AI-AGENT/"; 

function connectGmail() {
  const SCOPES = 'https://www.googleapis.com/auth/gmail.send  https://www.googleapis.com/auth/gmail.readonly'; 
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?scope=${encodeURIComponent(SCOPES)}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_id=${CLIENT_ID}`;
  window.open(authUrl, '_blank', 'width=600,height=400');
}

window.onload = () => {
  const hash = location.hash.substring(1);
  const params = new URLSearchParams(hash);

  if (params.has('access_token')) {
    const accessToken = params.get('access_token');
    localStorage.setItem('gmail_token', accessToken);
    alert("✅ Successfully connected to Gmail!");
  }
};

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

async function sendEmail(subject, body, recipient = "customer@example.com") {
  const token = localStorage.getItem('gmail_token');

  if (!token) {
    alert("❌ Not connected to Gmail");
    return false;
  }

  const rawMessage = [
    `To: ${recipient}`,
    `Subject: ${subject}`,
    ``,
    `${body}`
  ].join('\r\n');

  const encodedMessage = btoa(rawMessage).replace(/\+/g, '-').replace(/\//g, '_');

  const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: encodedMessage })
  });

  return response.ok;
}

document.getElementById("sendProposalBtn").addEventListener("click", async () => {
  const output = document.getElementById("output");
  const template = document.getElementById("proposalTemplate").value;

  if (!template.trim()) {
    alert("Please paste a proposal template.");
    return;
  }

  output.innerText = "🧠 Generating proposal...";
  const customerName = "John Doe";
  const projectName = "Warehouse Electrical Upgrade";

  try {
    const proposal = await generateProposal(template, customerName, projectName);
    output.innerHTML = `<strong>Generated Proposal:</strong>\n\n${proposal}`;

    if (confirm("Send this proposal via Gmail?")) {
      const sent = await sendEmail(`Electrical Bid - ${projectName}`, proposal, "john@example.com");

      if (sent) {
        output.innerHTML += "\n\n✅ Proposal sent successfully!";
        alert("✅ Proposal sent successfully!");
      } else {
        output.innerHTML += "\n\n❌ Failed to send.";
        alert("❌ Failed to send email.");
      }
    }
  } catch (error) {
    console.error(error);
    output.innerText = "❌ Error generating or sending proposal.";
  }
});

document.getElementById("extractSentBtn").addEventListener("click", async () => {
  const token = localStorage.getItem('gmail_token');
  const customerList = document.getElementById("customerList");
  customerList.innerHTML = "";

  if (!token) {
    alert("❌ Not connected to Gmail");
    return;
  }

  try {
    const res = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages?q=label:sent', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await res.json();
    const messages = data.messages || [];

    if (messages.length === 0) {
      customerList.innerHTML = "<p>No sent emails found.</p>";
      return;
    }

    customerList.innerHTML = "<h3>📬 Recent Sent Emails:</h3>";

    for (const msg of messages.slice(0, 5)) {
      const emailRes = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      const email = await emailRes.json();
      const headers = email.payload.headers;
      const to = headers.find(h => h.name === 'To')?.value || '';
      const subject = headers.find(h => h.name === 'Subject')?.value || '';

      // Try to extract name from To field
      const recipientMatch = to.match(/([^<]+)/);
      const recipientName = recipientMatch ? recipientMatch[1].trim() : to;

      customerList.innerHTML += `
        <div style="margin: 1rem 0; border-bottom: 1px solid #ccc; padding-bottom: 0.5rem;"> 
          <strong>${recipientName}</strong><br/>
          <em>${subject}</em><br/>
          <small>Sent on: ${new Date(parseInt(email.internalDate)).toLocaleString()}</small>
        </div>
      `;
    }
  } catch (error) {
    console.error("Error fetching sent emails:", error);
    alert("❌ Failed to fetch sent emails.");
  }
});
async function generateFollowUp(template, customerName, projectName) {
  const prompt = `
    Write a professional follow-up email to ${customerName} about "${projectName}".
    Use this template:\n\n${template}\n\n
    Keep it formal and polite.
  `;

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
  return data.choices[0].message.content;
}
document.getElementById("generateFollowUpBtn").addEventListener("click", async () => {
  const output = document.getElementById("output");
  const template = document.getElementById("followUpTemplate").value;

  if (!template.trim()) {
    alert("Please paste a follow-up template.");
    return;
  }

  output.innerText = "🧠 Generating follow-up...";
  const customerName = "John Doe";
  const projectName = "Warehouse Electrical Upgrade";

  try {
    const followUp = await generateFollowUp(template, customerName, projectName);
    output.innerHTML = `<strong>Generated Follow-Up:</strong>\n\n${followUp}`;

    if (confirm("Send this follow-up via Gmail?")) {
      const sent = await sendEmail(`Re: ${projectName}`, followUp, "john@example.com");

      if (sent) {
        output.innerHTML += "\n\n✅ Follow-up sent successfully!";
        alert("✅ Follow-up sent successfully!");
      } else {
        output.innerHTML += "\n\n❌ Failed to send.";
        alert("❌ Failed to send follow-up.");
      }
    }
  } catch (error) {
    console.error(error);
    output.innerText = "❌ Error generating or sending follow-up.";
  }
});
customerList.innerHTML += `
  <div style="margin: 1rem 0; border-bottom: 1px solid #ccc; padding-bottom: 0.5rem;">
    <strong>${recipientName}</strong><br/>
    <em>${subject}</em><br/>
    <small>Sent on: ${new Date(parseInt(email.internalDate)).toLocaleString()}</small><br/>
    <button onclick='sendAutoFollowUp("${to}", "${subject}")'>🔁 Send Follow Up</button>
  </div>
`;
async function sendAutoFollowUp(recipient, previousSubject) {
  const template = document.getElementById("followUpTemplate").value;

  const prompt = `
    Write a follow-up email to a customer.
    Previous subject: ${previousSubject}
    Recipient: ${recipient}

    Template:
    ${template}
  `;

  const aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions',  {
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

  const aiData = await aiResponse.json();
  const followUpEmail = aiData.choices[0].message.content;

  if (confirm("Send this follow-up?\n\n" + followUpEmail)) {
    const rawMessage = [
      `To: ${recipient}`,
      `Subject: Re: ${previousSubject}`,
      ``,
      `${followUpEmail}`
    ].join('\r\n');

    const encodedMessage = btoa(rawMessage).replace(/\+/g, '-').replace(/\//g, '_');

    const sendRes = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send',  {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('gmail_token'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: encodedMessage
      })
    });

    if (sendRes.ok) {
      alert("✅ Follow-up sent!");
    } else {
      alert("❌ Failed to send.");
    }
  }
}
