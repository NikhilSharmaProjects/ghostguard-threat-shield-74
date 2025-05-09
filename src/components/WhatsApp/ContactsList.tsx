
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Contact } from './types';

interface ContactsListProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  setSelectedContact: (contact: Contact) => void;
  allowedContacts: string[];
  isLoading?: boolean;
}

const ContactsList: React.FC<ContactsListProps> = ({
  contacts,
  selectedContact,
  setSelectedContact,
  allowedContacts,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card className="md:col-span-1">
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Contacts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex items-center justify-center py-10">
            <div className="animate-pulse flex flex-col space-y-2 w-full px-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-muted rounded w-full"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="md:col-span-1">
      <CardHeader className="p-4">
        <CardTitle className="text-lg">Contacts</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {contacts.length > 0 ? (
            contacts.map(contact => (
              <div 
                key={contact.id}
                className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-muted/50 ${
                  selectedContact?.id === contact.id ? 'bg-ghost-400/10 border-l-4 border-ghost-400' : ''
                }`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium truncate">{contact.name}</div>
                    {!allowedContacts.includes(contact.name) && (
                      <Badge variant="outline" className="text-xs">Restricted</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate max-w-40">
                    {contact.lastMessage}
                  </div>
                </div>
                {contact.unreadCount ? (
                  <div className="bg-ghost-400 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-2">
                    {contact.unreadCount}
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-muted-foreground">
              No contacts available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactsList;
