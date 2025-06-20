import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { toast } from 'react-hot-toast';
import { 
  CogIcon, 
  ServerIcon, 
  GlobeAltIcon, 
  FolderIcon,
  KeyIcon,
  UsersIcon,
  MapIcon,
  CheckIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import type { ServerConfig } from '@/types/server';

interface ServerConfigEditorProps {
  server: ServerConfig;
  onConfigUpdate: (updatedConfig: Partial<ServerConfig>) => void;
  onCancel?: () => void;
  modal?: boolean;
}

interface EditableField {
  key: keyof ServerConfig;
  label: string;
  type: 'text' | 'number' | 'password' | 'textarea';
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const EDITABLE_FIELDS: EditableField[] = [
  {
    key: 'name',
    label: 'Server Name',
    type: 'text',
    required: true,
    placeholder: 'Enter server name',
    description: 'Display name for the server',
    icon: ServerIcon
  },
  {
    key: 'map',
    label: 'Map',
    type: 'text',
    required: true,
    placeholder: 'e.g., TheIsland, TheCenter, or custom mod map',
    description: 'Map to load (official or modded)',
    icon: MapIcon
  },
  {
    key: 'executablePath',
    label: 'Executable Path',
    type: 'text',
    required: true,
    placeholder: 'Path to ShooterGameServer.exe',
    description: 'Full path to the ARK server executable',
    icon: CogIcon
  },
  {
    key: 'configDirectory',
    label: 'Config Directory',
    type: 'text',
    required: true,
    placeholder: 'Path to config directory',
    description: 'Directory containing server configuration files',
    icon: FolderIcon
  },
  {
    key: 'serverDirectory',
    label: 'Server Directory',
    type: 'text',
    required: true,
    placeholder: 'Path to server installation directory',
    description: 'Main server installation directory',
    icon: FolderIcon
  },
  {
    key: 'maxPlayers',
    label: 'Max Players',
    type: 'number',
    required: true,
    min: 1,
    max: 255,
    description: 'Maximum number of concurrent players',
    icon: UsersIcon
  }
];

// Separate port fields for grouped display
const PORT_FIELDS: EditableField[] = [
  {
    key: 'port',
    label: 'Game Port',
    type: 'number',
    required: true,
    min: 1,
    max: 65535,
    description: 'Port for game connections',
    icon: GlobeAltIcon
  },
  {
    key: 'queryPort',
    label: 'Query Port',
    type: 'number',
    required: true,
    min: 1,
    max: 65535,
    description: 'Port for server queries',
    icon: GlobeAltIcon
  },
  {
    key: 'rconPort',
    label: 'RCON Port',
    type: 'number',
    required: true,
    min: 1,
    max: 65535,
    description: 'Port for RCON administration',
    icon: GlobeAltIcon
  }
];

// Separate password fields for grouped display
const PASSWORD_FIELDS: EditableField[] = [
  {
    key: 'adminPassword',
    label: 'Admin Password',
    type: 'password',
    required: true,
    placeholder: 'Admin password',
    description: 'Password for admin access',
    icon: KeyIcon
  },
  {
    key: 'rconPassword',
    label: 'RCON Password',
    type: 'password',
    required: true,
    placeholder: 'RCON password',
    description: 'Password for RCON access',
    icon: KeyIcon
  },
  {
    key: 'serverPassword',
    label: 'Server Password',
    type: 'password',
    placeholder: 'Server password (optional)',
    description: 'Password required to join the server',
    icon: KeyIcon
  }
];

export const ServerConfigEditor: React.FC<ServerConfigEditorProps> = ({ 
  server, 
  onConfigUpdate, 
  onCancel,
  modal = false
}) => {
  const [editingField, setEditingField] = useState<keyof ServerConfig | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleEditStart = (field: keyof ServerConfig) => {
    setEditingField(field);
    setEditValue(String(server[field] || ''));
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleEditSave = async () => {
    if (!editingField) return;

    const field = EDITABLE_FIELDS.find(f => f.key === editingField);
    if (!field) return;

    // Validation
    if (field.required && !editValue.trim()) {
      toast.error(`${field.label} is required`);
      return;
    }

    if (field.type === 'number') {
      const numValue = Number(editValue);
      if (isNaN(numValue)) {
        toast.error(`${field.label} must be a valid number`);
        return;
      }
      if (field.min !== undefined && numValue < field.min) {
        toast.error(`${field.label} must be at least ${field.min}`);
        return;
      }
      if (field.max !== undefined && numValue > field.max) {
        toast.error(`${field.label} must be at most ${field.max}`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const updatedValue = field.type === 'number' ? Number(editValue) : editValue;
      await onConfigUpdate({ [editingField]: updatedValue });
      setEditingField(null);
      setEditValue('');
      setHasChanges(true);
      toast.success(`${field.label} updated successfully`);
    } catch (error) {
      console.error('Failed to update config:', error);
      toast.error('Failed to update configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const renderFieldValue = (field: EditableField) => {
    const value = server[field.key];
    
    if (field.type === 'password') {
      return value ? '••••••••' : 'Not set';
    }
    
    if (field.type === 'textarea' && typeof value === 'string') {
      return value || 'No description';
    }
    
    // Handle different value types safely
    if (value === null || value === undefined) {
      return 'Not set';
    }
    
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }
    
    // For complex objects like LaunchOptionsConfig, show a placeholder
    return 'Complex configuration';
  };

  const renderEditInput = (field: EditableField) => {
    const commonClasses = "input input-bordered w-full bg-base-100/80 border-primary/30 focus:border-primary text-primary-content placeholder-primary-content/50 font-mono transition-all duration-300 shadow-inner";
    
    if (field.type === 'textarea') {
      return (
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={field.placeholder}
          className={`${commonClasses} textarea textarea-bordered min-h-[100px] resize-none`}
          autoFocus
        />
      );
    }
    
    return (
      <input
        type={field.type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder={field.placeholder}
        min={field.min}
        max={field.max}
        className={commonClasses}
        autoFocus
      />
    );
  };

  return (
    <div className={`${modal ? 'bg-transparent' : 'bg-base-200/50 rounded-2xl shadow-lg overflow-hidden border border-base-300/30'}`}>
      <div className={`${modal ? 'p-6' : 'p-8'}`}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-primary font-display tracking-wide">
              Server Configuration
            </h2>
            <p className="text-primary/70 font-mono mt-2">
              Edit server settings and configuration
            </p>
          </div>
          {hasChanges && (
            <div className="badge badge-success gap-2 px-3 py-2 rounded-xl">
              <CheckIcon className="h-4 w-4" />
              Changes Saved
            </div>
          )}
        </div>

        {/* Configuration Fields */}
        <div className="space-y-6">
          {/* Basic Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {EDITABLE_FIELDS.map((field) => (
              <div key={field.key} className="bg-base-200/50 rounded-xl p-6 border border-primary/20 shadow-inner">
                <div className="flex items-center gap-3 mb-4">
                  <field.icon className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold text-primary font-display">
                      {field.label}
                      {field.required && <span className="text-error ml-1">*</span>}
                    </h3>
                    <p className="text-sm text-primary/70 font-mono">{field.description}</p>
                  </div>
                </div>
                
                {editingField === field.key ? (
                  <div className="space-y-3">
                    {renderEditInput(field)}
                    <div className="flex gap-2">
                      <button
                        onClick={handleEditSave}
                        disabled={isSaving}
                        className="btn btn-primary btn-sm rounded-lg font-mono"
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="btn btn-outline btn-sm rounded-lg font-mono"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-base-100/60 rounded-lg p-4 border border-primary/20 shadow-inner">
                    <div className="text-base font-mono text-primary-content break-words">
                      {renderFieldValue(field)}
                    </div>
                  </div>
                )}
                
                {editingField !== field.key && (
                  <button
                    onClick={() => handleEditStart(field.key)}
                    className="btn btn-ghost btn-sm mt-3 text-primary hover:bg-primary/10 rounded-lg font-mono"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Port Configuration - Grouped */}
          <div className="bg-base-200/50 rounded-xl p-6 border border-primary/20 shadow-inner">
            <div className="flex items-center gap-3 mb-6">
              <GlobeAltIcon className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-xl font-semibold text-primary font-display">Port Configuration</h3>
                <p className="text-sm text-primary/70 font-mono">Network ports for server communication</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PORT_FIELDS.map((field) => (
                <div key={field.key} className="bg-base-100/60 rounded-lg p-4 border border-primary/20">
                  <div className="flex items-center gap-2 mb-3">
                    <field.icon className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold text-primary font-display">
                      {field.label}
                      {field.required && <span className="text-error ml-1">*</span>}
                    </h4>
                  </div>
                  
                  {editingField === field.key ? (
                    <div className="space-y-2">
                      {renderEditInput(field)}
                      <div className="flex gap-2">
                        <button
                          onClick={handleEditSave}
                          disabled={isSaving}
                          className="btn btn-primary btn-xs rounded-lg font-mono"
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="btn btn-outline btn-xs rounded-lg font-mono"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-base-200/60 rounded p-3 border border-primary/10">
                      <div className="text-sm font-mono text-primary-content">
                        {renderFieldValue(field)}
                      </div>
                    </div>
                  )}
                  
                  {editingField !== field.key && (
                    <button
                      onClick={() => handleEditStart(field.key)}
                      className="btn btn-ghost btn-xs mt-2 text-primary hover:bg-primary/10 rounded-lg font-mono w-full"
                    >
                      <PencilIcon className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Password Configuration - Grouped */}
          <div className="bg-base-200/50 rounded-xl p-6 border border-primary/20 shadow-inner">
            <div className="flex items-center gap-3 mb-6">
              <KeyIcon className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-xl font-semibold text-primary font-display">Password Configuration</h3>
                <p className="text-sm text-primary/70 font-mono">Authentication and access passwords</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PASSWORD_FIELDS.map((field) => (
                <div key={field.key} className="bg-base-100/60 rounded-lg p-4 border border-primary/20">
                  <div className="flex items-center gap-2 mb-3">
                    <field.icon className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold text-primary font-display">
                      {field.label}
                      {field.required && <span className="text-error ml-1">*</span>}
                    </h4>
                  </div>
                  
                  {editingField === field.key ? (
                    <div className="space-y-2">
                      {renderEditInput(field)}
                      <div className="flex gap-2">
                        <button
                          onClick={handleEditSave}
                          disabled={isSaving}
                          className="btn btn-primary btn-xs rounded-lg font-mono"
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="btn btn-outline btn-xs rounded-lg font-mono"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-base-200/60 rounded p-3 border border-primary/10">
                      <div className="text-sm font-mono text-primary-content">
                        {renderFieldValue(field)}
                      </div>
                    </div>
                  )}
                  
                  {editingField !== field.key && (
                    <button
                      onClick={() => handleEditStart(field.key)}
                      className="btn btn-ghost btn-xs mt-2 text-primary hover:bg-primary/10 rounded-lg font-mono w-full"
                    >
                      <PencilIcon className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {onCancel && (
          <div className="flex justify-end mt-8 pt-6 border-t border-primary/20">
            <button
              onClick={onCancel}
              className="btn btn-outline rounded-xl hover:bg-primary/10 hover:border-primary transition-all duration-300"
            >
              Close Editor
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const ServerConfigModal: React.FC<Omit<ServerConfigEditorProps, 'modal'>> = (props) => {
  // Use a portal to render the modal at the end of the body
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 py-8 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
          onClick={props.onCancel}
          aria-hidden="true"
        />
        <div className="inline-block transform overflow-hidden rounded-2xl bg-base-100 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-5xl sm:align-middle border border-primary/30">
          <div className="bg-gradient-to-br from-base-100 to-base-200/50">
            <ServerConfigEditor {...props} modal={true} />
          </div>
        </div>
      </div>
    </div>,
    typeof window !== 'undefined' ? document.body : (null as any)
  );
}; 