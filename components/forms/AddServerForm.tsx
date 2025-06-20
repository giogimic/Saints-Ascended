import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ServerIcon, FolderIcon, MapIcon, CogIcon, CheckIcon, XMarkIcon, XCircleIcon } from '@heroicons/react/24/outline';
import type { CreateServerFormData } from '@/types/server';
import { ErrorHandler, ErrorType, ErrorSeverity } from '@/lib/error-handler';

interface AddServerFormProps {
  onSuccess: (serverId: string) => void;
  onClose: () => void;
}

export function AddServerForm({ onSuccess, onClose }: AddServerFormProps) {
  const [formData, setFormData] = useState<CreateServerFormData>({
    name: '',
    executablePath: '',
    configDirectory: '',
    serverDirectory: '',
    map: 'TheIsland_WP',
    port: 7777,
    queryPort: 27015,
    rconPort: 32330,
    rconPassword: '',
    adminPassword: '',
    serverPassword: '',
    maxPlayers: 70,
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CreateServerFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.name.trim()) {
      newErrors.name = 'Server name is required';
    }

    if (!formData.executablePath.trim()) {
      newErrors.executablePath = 'Executable path is required';
    }

    if (!formData.configDirectory.trim()) {
      newErrors.configDirectory = 'Config directory is required';
    }

    if (!formData.serverDirectory.trim()) {
      newErrors.serverDirectory = 'Server directory is required';
    }

    // Port validation
    if (formData.port < 1 || formData.port > 65535) {
      newErrors.port = 'Port must be between 1 and 65535';
    }

    if (formData.queryPort < 1 || formData.queryPort > 65535) {
      newErrors.queryPort = 'Query port must be between 1 and 65535';
    }

    if (formData.rconPort < 1 || formData.rconPort > 65535) {
      newErrors.rconPort = 'RCON port must be between 1 and 65535';
    }

    // Player count validation
    if (formData.maxPlayers < 1 || formData.maxPlayers > 255) {
      newErrors.maxPlayers = 'Max players must be between 1 and 255';
    }

    // Password validation
    if (formData.adminPassword.trim() && formData.adminPassword.length < 6) {
      newErrors.adminPassword = 'Admin password must be at least 6 characters';
    }

    if (formData.rconPassword.trim() && formData.rconPassword.length < 6) {
      newErrors.rconPassword = 'RCON password must be at least 6 characters';
    }

    // Path validation
    if (formData.executablePath.trim() && !formData.executablePath.endsWith('.exe')) {
      newErrors.executablePath = 'Executable path must end with .exe';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const result = await ErrorHandler.handleAsync(
      async () => {
        setLoading(true);
        
        const response = await fetch('/api/servers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create server');
        }

        const result = await response.json();
        return result.data.id;
      },
      { component: 'AddServerForm', action: 'createServer' }
    );

    if (result.success) {
      onSuccess(result.data);
    }
    
    setLoading(false);
  };

  const mapOptions = [
    { value: 'TheIsland_WP', label: 'The Island' },
    { value: 'TheCenter_WP', label: 'The Center' },
    { value: 'ScorchedEarth_WP', label: 'Scorched Earth' },
    { value: 'Ragnarok_WP', label: 'Ragnarok' },
    { value: 'Aberration_WP', label: 'Aberration' },
    { value: 'Extinction_WP', label: 'Extinction' },
    { value: 'Valguero_WP', label: 'Valguero' },
    { value: 'Genesis_WP', label: 'Genesis' },
    { value: 'CrystalIsles_WP', label: 'Crystal Isles' },
    { value: 'Genesis2_WP', label: 'Genesis 2' },
    { value: 'LostIsland_WP', label: 'Lost Island' },
    { value: 'Fjordur_WP', label: 'Fjordur' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Improved backdrop with proper z-index and blur */}
        <div 
          className="fixed inset-0 bg-base-300/75 backdrop-blur-sm transition-opacity" 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-hidden="true"
        />

        {/* Modal panel */}
        <div className="inline-block transform overflow-hidden rounded-lg bg-base-100 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:align-middle">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium leading-6">Add New Server</h3>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 hover:bg-base-200 transition-colors"
                    aria-label="Close dialog"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Server Name *</span>
                      </label>
                      <input
                        type="text"
                        className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="My Ark Server"
                        disabled={loading}
                        aria-label="Server name"
                        required
                      />
                      {errors.name && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.name}</span>
                        </label>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Map *</span>
                      </label>
                      <select
                        className={`select select-bordered w-full ${errors.map ? 'select-error' : ''}`}
                        value={formData.map}
                        onChange={(e) => handleInputChange('map', e.target.value)}
                        disabled={loading}
                        aria-label="Select server map"
                        required
                      >
                        {mapOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.map && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.map}</span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Paths */}
                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Executable Path *</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className={`input input-bordered flex-1 ${errors.executablePath ? 'input-error' : ''}`}
                          value={formData.executablePath}
                          onChange={(e) => handleInputChange('executablePath', e.target.value)}
                          placeholder="C:\ArkServer\ShooterGame\Binaries\Win64\ArkAscendedServer.exe"
                          disabled={loading}
                          aria-label="Server executable path"
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-ghost btn-square btn-sm"
                          onClick={() => toast('Please enter the path manually', {
                            icon: '💡',
                            duration: 3000
                          })}
                          disabled={loading}
                          aria-label="Browse for executable"
                        >
                          <FolderIcon className="h-4 w-4" />
                        </button>
                      </div>
                      {errors.executablePath && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.executablePath}</span>
                        </label>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Config Directory *</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className={`input input-bordered flex-1 ${errors.configDirectory ? 'input-error' : ''}`}
                          value={formData.configDirectory}
                          onChange={(e) => handleInputChange('configDirectory', e.target.value)}
                          placeholder="C:\ArkServer\ShooterGame\Saved\Config\WindowsServer"
                          disabled={loading}
                          aria-label="Server config directory"
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-ghost btn-square btn-sm"
                          onClick={() => toast('Please enter the path manually', {
                            icon: '💡',
                            duration: 3000
                          })}
                          disabled={loading}
                          aria-label="Browse for config directory"
                        >
                          <FolderIcon className="h-4 w-4" />
                        </button>
                      </div>
                      {errors.configDirectory && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.configDirectory}</span>
                        </label>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Server Directory *</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className={`input input-bordered flex-1 ${errors.serverDirectory ? 'input-error' : ''}`}
                          value={formData.serverDirectory}
                          onChange={(e) => handleInputChange('serverDirectory', e.target.value)}
                          placeholder="C:\ArkServer"
                          disabled={loading}
                          aria-label="Server installation directory"
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-ghost btn-square btn-sm"
                          onClick={() => toast('Please enter the path manually', {
                            icon: '💡',
                            duration: 3000
                          })}
                          disabled={loading}
                          aria-label="Browse for server directory"
                        >
                          <FolderIcon className="h-4 w-4" />
                        </button>
                      </div>
                      {errors.serverDirectory && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.serverDirectory}</span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Network Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Game Port *</span>
                      </label>
                      <input
                        type="number"
                        className={`input input-bordered w-full ${errors.port ? 'input-error' : ''}`}
                        value={formData.port}
                        onChange={(e) => handleInputChange('port', parseInt(e.target.value))}
                        min="1"
                        max="65535"
                        disabled={loading}
                        aria-label="Game port"
                        required
                      />
                      {errors.port && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.port}</span>
                        </label>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Query Port *</span>
                      </label>
                      <input
                        type="number"
                        className={`input input-bordered w-full ${errors.queryPort ? 'input-error' : ''}`}
                        value={formData.queryPort}
                        onChange={(e) => handleInputChange('queryPort', parseInt(e.target.value))}
                        min="1"
                        max="65535"
                        disabled={loading}
                        aria-label="Query port"
                        required
                      />
                      {errors.queryPort && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.queryPort}</span>
                        </label>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">RCON Port *</span>
                      </label>
                      <input
                        type="number"
                        className={`input input-bordered w-full ${errors.rconPort ? 'input-error' : ''}`}
                        value={formData.rconPort}
                        onChange={(e) => handleInputChange('rconPort', parseInt(e.target.value))}
                        min="1"
                        max="65535"
                        disabled={loading}
                        aria-label="RCON port"
                        required
                      />
                      {errors.rconPort && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.rconPort}</span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Passwords */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Admin Password</span>
                      </label>
                      <input
                        type="password"
                        className={`input input-bordered w-full ${errors.adminPassword ? 'input-error' : ''}`}
                        value={formData.adminPassword}
                        onChange={(e) => handleInputChange('adminPassword', e.target.value)}
                        placeholder="••••••"
                        disabled={loading}
                        aria-label="Admin password"
                      />
                      {errors.adminPassword && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.adminPassword}</span>
                        </label>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">RCON Password</span>
                      </label>
                      <input
                        type="password"
                        className={`input input-bordered w-full ${errors.rconPassword ? 'input-error' : ''}`}
                        value={formData.rconPassword}
                        onChange={(e) => handleInputChange('rconPassword', e.target.value)}
                        placeholder="••••••"
                        disabled={loading}
                        aria-label="RCON password"
                      />
                      {errors.rconPassword && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.rconPassword}</span>
                        </label>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Server Password</span>
                      </label>
                      <input
                        type="password"
                        className={`input input-bordered w-full ${errors.serverPassword ? 'input-error' : ''}`}
                        value={formData.serverPassword}
                        onChange={(e) => handleInputChange('serverPassword', e.target.value)}
                        placeholder="••••••"
                        disabled={loading}
                        aria-label="Server password"
                      />
                      {errors.serverPassword && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.serverPassword}</span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Additional Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Max Players *</span>
                      </label>
                      <input
                        type="number"
                        className={`input input-bordered w-full ${errors.maxPlayers ? 'input-error' : ''}`}
                        value={formData.maxPlayers}
                        onChange={(e) => handleInputChange('maxPlayers', parseInt(e.target.value))}
                        min="1"
                        max="255"
                        disabled={loading}
                        aria-label="Maximum players"
                        required
                      />
                      {errors.maxPlayers && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.maxPlayers}</span>
                        </label>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Description</span>
                      </label>
                      <textarea
                        className={`textarea textarea-bordered w-full h-20 min-h-[5rem] resize-none font-mono text-sm ${errors.description ? 'textarea-error' : ''}`}
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Server description (optional)"
                        disabled={loading}
                        aria-label="Server description"
                      />
                      {errors.description && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.description}</span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4 mt-8">
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn btn-ghost min-w-[100px]"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary min-w-[140px]"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="loading loading-spinner loading-sm" />
                          Creating...
                        </>
                      ) : (
                        'Create Server'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 