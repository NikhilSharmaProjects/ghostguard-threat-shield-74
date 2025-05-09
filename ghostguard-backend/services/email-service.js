const Imap = require('node-imap');
const { simpleParser } = require('mailparser');

const connections = new Map();

const connect = async (email, password) => {
  let provider, imapConfig;
  if (email.includes('gmail')) {
    provider = 'Gmail';
    imapConfig = {
      user: email,
      password,
      host: 'imap.gmail.com',
      port: 993,
      tls: true
    };
  } else if (email.includes('outlook') || email.includes('hotmail')) {
    provider = 'Outlook';
    imapConfig = {
      user: email,
      password,
      host: 'outlook.office365.com',
      port: 993,
      tls: true
    };
  } else if (email.includes('yahoo')) {
    provider = 'Yahoo';
    imapConfig = {
      user: email,
      password,
      host: 'imap.mail.yahoo.com',
      port: 993,
      tls: true
    };
  } else {
    throw new Error('Unsupported email provider');
  }

  try {
    const imap = new Imap(imapConfig);
    await new Promise((resolve, reject) => {
      imap.once('ready', resolve);
      imap.once('error', reject);
      imap.connect();
    });
    connections.set(email, { imap, provider, lastSyncTime: new Date() });
    return { connected: true, email, provider, lastSyncTime: new Date() };
  } catch (error) {
    throw new Error(`Failed to connect to ${provider}: ${error.message}`);
  }
};

const getEmails = async (email, folder = 'INBOX', limit = 20) => {
  const connection = connections.get(email);
  if (!connection) throw new Error('Not connected to email');
  const { imap } = connection;

  await new Promise((resolve, reject) => {
    imap.openBox(folder, true, (err, box) => {
      if (err) reject(err);
      else resolve(box);
    });
  });

  const results = await new Promise((resolve, reject) => {
    imap.search(['ALL'], (err, uids) => {
      if (err) reject(err);
      else resolve(uids);
    });
  });

  const uids = results.sort((a, b) => b - a).slice(0, limit);
  if (uids.length === 0) return [];

  return await new Promise((resolve, reject) => {
    const messages = [];
    const fetch = imap.fetch(uids, { bodies: '' });
    fetch.on('message', (msg) => {
      let buffer = '';
      msg.on('body', (stream) => {
        stream.on('data', (chunk) => buffer += chunk.toString('utf8'));
      });
      msg.once('end', async () => {
        const parsed = await simpleParser(buffer);
        messages.push({
          id: parsed.messageId,
          subject: parsed.subject,
          from: parsed.from.text,
          to: parsed.to.text,
          date: parsed.date,
          text: parsed.text,
          html: parsed.html
        });
      });
    });
    fetch.once('error', reject);
    fetch.once('end', () => resolve(messages));
  });
};

const disconnect = async (email) => {
  const connection = connections.get(email);
  if (connection) {
    connection.imap.end();
    connections.delete(email);
  }
};

const scanEmail = async (email, folder, emailId) => {
  // Implement scanning logic here
  return { scanned: true, emailId };
};

const scanAllEmails = async (email, folder) => {
  // Implement scanning logic here
  return { scanned: true, folder };
};

module.exports = {
  connect,
  getEmails,
  disconnect,
  scanEmail,
  scanAllEmails
};