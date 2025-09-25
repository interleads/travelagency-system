import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useClients, Client } from '@/hooks/useClients';
import ClientRegistrationModal from './ClientRegistrationModal';
import { Check, ChevronDown, Plus, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientSelectorProps {
  selectedClient: Client | null;
  onClientSelect: (client: Client | null) => void;
}

export default function ClientSelector({ selectedClient, onClientSelect }: ClientSelectorProps) {
  const [open, setOpen] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const { clients, isLoading } = useClients();

  const handleClientCreated = (newClient: Client) => {
    onClientSelect(newClient);
  };

  return (
    <>
      <div className="space-y-2">
        <Label>Cliente *</Label>
        <div className="flex gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="flex-1 justify-between"
              >
                {selectedClient ? (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="truncate">{selectedClient.name}</span>
                    {selectedClient.phone && (
                      <span className="text-muted-foreground text-sm">
                        • {selectedClient.phone}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Selecione um cliente...</span>
                )}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput placeholder="Buscar cliente..." />
                <CommandEmpty>
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Nenhum cliente encontrado
                    </p>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setOpen(false);
                        setShowRegistrationModal(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Cadastrar Novo Cliente
                    </Button>
                  </div>
                </CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {!isLoading && clients.map((client) => (
                      <CommandItem
                        key={client.id}
                        value={`${client.name} ${client.phone || ''} ${client.email || ''}`}
                        onSelect={() => {
                          onClientSelect(client.id === selectedClient?.id ? null : client);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedClient?.id === client.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{client.name}</span>
                          <div className="flex gap-2 text-sm text-muted-foreground">
                            {client.phone && <span>{client.phone}</span>}
                            {client.email && <span>{client.email}</span>}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowRegistrationModal(true)}
            title="Cadastrar novo cliente"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {selectedClient && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">{selectedClient.name}</span>
            </div>
            {(selectedClient.phone || selectedClient.email) && (
              <div className="mt-1 flex gap-4">
                {selectedClient.phone && <span>{selectedClient.phone}</span>}
                {selectedClient.email && <span>{selectedClient.email}</span>}
              </div>
            )}
          </div>
        )}
      </div>

      <ClientRegistrationModal
        open={showRegistrationModal}
        onOpenChange={setShowRegistrationModal}
        onClientCreated={handleClientCreated}
      />
    </>
  );
}