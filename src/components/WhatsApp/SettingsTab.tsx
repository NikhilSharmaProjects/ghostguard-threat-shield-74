
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SettingsTabProps {
  allowedContacts: string[];
  newAllowedContact: string;
  setNewAllowedContact: (contact: string) => void;
  handleAddAllowedContact: () => void;
  handleRemoveAllowedContact: (contact: string) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  allowedContacts,
  newAllowedContact,
  setNewAllowedContact,
  handleAddAllowedContact,
  handleRemoveAllowedContact
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Protection Settings</CardTitle>
        <CardDescription>
          Configure which contacts are protected by GhostGuard's real-time scanning
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Allowed Contacts</h3>
          <p className="text-sm text-muted-foreground mb-4">
            GhostGuard will automatically scan messages from these contacts
          </p>
          
          <div className="flex gap-2 mb-4">
            <Input 
              value={newAllowedContact}
              onChange={(e) => setNewAllowedContact(e.target.value)}
              placeholder="Add contact name"
            />
            <Button onClick={handleAddAllowedContact}>
              Add
            </Button>
          </div>
          
          <div className="space-y-2">
            {allowedContacts.map(contact => (
              <div key={contact} className="flex justify-between items-center bg-secondary p-2 rounded-md">
                <span>{contact}</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => handleRemoveAllowedContact(contact)}
                >
                  Remove
                </Button>
              </div>
            ))}
            
            {allowedContacts.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No allowed contacts yet. Add contacts to enable protection.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsTab;
