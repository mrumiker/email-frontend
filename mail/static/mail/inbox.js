document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#message-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Add Event Listener to Compose Form
  document.querySelector("#compose-form").onsubmit = function () {
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients,
        subject,
        body,
      })
    })
      .then(response => response.json())
      .then(result => {
        alert(result.message || result.error);
        if (result.message) load_mailbox('sent'); //if successful, load Sent view. Otherwise, stay on Compose.  
      })
      .catch(error => console.log('Error:', error));
    return false;
  };
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#message-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  const container = document.querySelector('#emails-view');
  // Get emails
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      emails.forEach(email => {
        let div = document.createElement('div');
        if (mailbox === 'sent') {
          div.innerHTML = `To ${email.recipients}    Subject: ${email.subject}`;
        } else div.innerHTML = `From ${email.sender}    Subject: ${email.subject}`;
        div.addEventListener('click', () => alert('You clicked email ' + email.id));
        container.append(div);
      })
    })
    .catch(error => console.log('Error: ' + error));
}
