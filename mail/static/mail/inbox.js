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
        const message = document.createElement('a');
        message.setAttribute('href', '#');
        message.classList.add('list-group-item', 'list-group-item-action', 'container');
        const shortDate = email.timestamp.split(' ').slice(0, 2).join(' ');
        if (mailbox === 'sent') {
          message.style.color = 'black';
          message.innerHTML = `<div class="row"><div class="col-5">To: ${email.recipients.join(', ')}</div><div class="col">${email.subject}</div><div class="col-1">${shortDate}</div></div>`;
        } else {
          if (email.read) message.classList.add('list-group-item-secondary');
          else {
            message.style.color = 'black';
            message.classList.add('font-weight-bold');
          }
          message.innerHTML = `<div class="row"><div class="col-5">From: ${email.sender}</div><div class="col">${email.subject}</div><div class="col-1">${shortDate}</div></div>`;
        }
        message.addEventListener('click', () => load_message(email.id, mailbox));
        container.append(message);
      })
    })
    .catch(error => console.log('Error: ' + error));
}

function load_message(messageId, mailbox) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#message-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  //Get message
  fetch(`/emails/${messageId}`)
    .then(response => response.json())
    .then(email => {
      document.querySelector('#message-subject').innerHTML = email.subject;
      document.querySelector('#message-from').innerHTML = `From: ${email.sender}`;
      document.querySelector('#message-to').innerHTML = `To: ${email.recipients.join(', ')}`;
      document.querySelector('#message-time').innerHTML = email.timestamp;
      document.querySelector('#message-body').innerHTML = mailbox === 'sent' && format_message(email.body) || `${format_message(email.body)}<hr/><button type="button" class="btn btn-warning my-1" id="reply-button">Reply</button>`;
      const buttonContainer = document.querySelector('#message-buttons');
      while (buttonContainer.firstChild) buttonContainer.removeChild(buttonContainer.firstChild); //clear any buttons from the message
      if (mailbox !== 'sent') {
        document.querySelector('#reply-button').addEventListener('click', () => reply(email));
        if (email.archived) {
          const unarchiveButton = document.createElement('button');
          unarchiveButton.innerHTML = 'UnArchive Message';
          unarchiveButton.setAttribute('type', 'button');
          unarchiveButton.classList.add('btn', 'btn-outline-warning');
          unarchiveButton.addEventListener('click', () => unarchive_message(messageId));
          buttonContainer.append(unarchiveButton);
        } else {
          const archiveButton = document.createElement('button');
          archiveButton.innerHTML = 'Archive Message';
          archiveButton.setAttribute('type', 'button');
          archiveButton.classList.add('btn', 'btn-outline-warning');
          archiveButton.addEventListener('click', () => archive_message(messageId));
          buttonContainer.append(archiveButton);
        }

      }
      fetch(`/emails/${messageId}`, { //Mark message as read
        method: 'PUT',
        body: JSON.stringify({
          read: true,
        })
      })
    })
    .catch(error => console.log('Error: ' + error));
}

function archive_message(messageId) {
  fetch(`/emails/${messageId}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true,
    })
  })
    .then(res => {
      alert('Message Archived');
      load_mailbox('inbox');
    })
  return false;
}

function unarchive_message(messageId) {
  fetch(`/emails/${messageId}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false,
    })
  })
    .then(res => {
      alert('Message UnArchived');
      load_mailbox('archive');
    })

  return false;
}

function reply(email) {
  compose_email();
  document.querySelector('#compose-recipients').value = email.sender;
  document.querySelector('#compose-subject').value = email.subject.startsWith('Re:') && email.subject || `Re: ${email.subject}`;
  document.querySelector('#compose-body').value =
    `
    
On ${email.timestamp} ${email.sender} wrote:

${email.body}`

  return false;
}

const format_message = body => body.split('\n').map(line => `<p>${line}</p>`).join('\n');
