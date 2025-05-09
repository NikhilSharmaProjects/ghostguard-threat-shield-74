
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Contact {
  id: string;
  name: string;
  lastMessage?: string;
  lastSeen?: Date;
  unreadCount?: number;
}

interface ContactsListProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  setSelectedContact: (contact: Contact) => void;
  allowedContacts: string[];
}

const ContactsList: React.FC<ContactsListProps> = ({
  contacts,
  selectedContact,
  setSelectedContact,
  allowedContacts
}) => {
  return (
    <Card className="md:col-span-1">
      <CardHeader className="p-4">
        <CardTitle className="text-lg">Contacts</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {contacts.map(contact => (
            <div 
              key={contact.id}
              className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-muted/50 ${
                selectedContact?.id === contact.id ? 'bg-ghost-400/10 border-l-4 border-ghost-400' : ''
              }`}
              onClick={() => setSelectedContact(contact)}
            >
              <div>
                <div className="font-medium">{contact.name}</div>
                <div className="text-xs text-muted-foreground truncate max-w-40">
                  {contact.lastMessage}
                </div>
              </div>
              {contact.unreadCount ? (
                <div className="bg-ghost-400 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {contact.unreadCount}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactsList;
