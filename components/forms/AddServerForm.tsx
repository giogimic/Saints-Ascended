import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ServerIcon, FolderIcon } from '@heroicons/react/24/outline';
import type { CreateServerFormData } from '@/types/server';
import { ErrorHandler } from '@/lib/error-handler';

// shadcn/ui imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/Card';

interface AddServerFormProps {
  onSuccess: (serverId: string) => void;
  onClose: () => void;
}

export function AddServerForm({ onSuccess, onClose }: AddServerFormProps) {
  const [formData, setFormData] = useState<CreateServerFormData>({
    name: '',
    map: 'TheIsland_WP',
    port: 7777,
    queryPort: 27015,
    rconPort: 32330,
    maxPlayers: 20,
    description: '',
    executablePath: '',
    configDirectory: '',
    serverDirectory: '',
    adminPassword: '',
    rconPassword: '',
    serverPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof CreateServerFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-matrix-500/20">
              <ServerIcon className="h-6 w-6 text-matrix-500" />
            </div>
            <DialogTitle className="text-xl font-mono uppercase text-matrix-500">
              Add New Server
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card variant="cyber-glass">
            <CardContent className="space-y-4">
              <h3 className="text-lg font-mono uppercase text-matrix-400 mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-matrix-400 font-mono">Server Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="My Ark Server"
                    disabled={loading}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm font-mono">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="map" className="text-matrix-400 font-mono">Map *</Label>
                  <Select value={formData.map} onValueChange={(value) => handleInputChange('map', value)}>
                    <SelectTrigger className={errors.map ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a map" />
                    </SelectTrigger>
                    <SelectContent>
                      {mapOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.map && (
                    <p className="text-red-400 text-sm font-mono">{errors.map}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Paths */}
          <Card variant="cyber-glass">
            <CardContent className="space-y-4">
              <h3 className="text-lg font-mono uppercase text-matrix-400 mb-4">Server Paths</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="executablePath" className="text-matrix-400 font-mono">Executable Path *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="executablePath"
                      value={formData.executablePath}
                      onChange={(e) => handleInputChange('executablePath', e.target.value)}
                      placeholder="C:\ArkServer\ShooterGame\Binaries\Win64\ArkAscendedServer.exe"
                      disabled={loading}
                      className={`flex-1 ${errors.executablePath ? 'border-red-500' : ''}`}
                    />
                    <Button
                      type="button"
                      variant="cyber-outline"
                      size="icon"
                      onClick={() => toast('Please enter the path manually', {
                        icon: '💡',
                        duration: 3000
                      })}
                      disabled={loading}
                    >
                      <FolderIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  {errors.executablePath && (
                    <p className="text-red-400 text-sm font-mono">{errors.executablePath}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="configDirectory" className="text-matrix-400 font-mono">Config Directory *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="configDirectory"
                      value={formData.configDirectory}
                      onChange={(e) => handleInputChange('configDirectory', e.target.value)}
                      placeholder="C:\ArkServer\ShooterGame\Saved\Config\WindowsServer"
                      disabled={loading}
                      className={`flex-1 ${errors.configDirectory ? 'border-red-500' : ''}`}
                    />
                    <Button
                      type="button"
                      variant="cyber-outline"
                      size="icon"
                      onClick={() => toast('Please enter the path manually', {
                        icon: '💡',
                        duration: 3000
                      })}
                      disabled={loading}
                    >
                      <FolderIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  {errors.configDirectory && (
                    <p className="text-red-400 text-sm font-mono">{errors.configDirectory}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serverDirectory" className="text-matrix-400 font-mono">Server Directory *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="serverDirectory"
                      value={formData.serverDirectory}
                      onChange={(e) => handleInputChange('serverDirectory', e.target.value)}
                      placeholder="C:\ArkServer"
                      disabled={loading}
                      className={`flex-1 ${errors.serverDirectory ? 'border-red-500' : ''}`}
                    />
                    <Button
                      type="button"
                      variant="cyber-outline"
                      size="icon"
                      onClick={() => toast('Please enter the path manually', {
                        icon: '💡',
                        duration: 3000
                      })}
                      disabled={loading}
                    >
                      <FolderIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  {errors.serverDirectory && (
                    <p className="text-red-400 text-sm font-mono">{errors.serverDirectory}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Network Settings */}
          <Card variant="cyber-glass">
            <CardContent className="space-y-4">
              <h3 className="text-lg font-mono uppercase text-matrix-400 mb-4">Network Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="port" className="text-matrix-400 font-mono">Game Port *</Label>
                  <Input
                    id="port"
                    type="number"
                    value={formData.port}
                    onChange={(e) => handleInputChange('port', parseInt(e.target.value))}
                    min="1"
                    max="65535"
                    disabled={loading}
                    className={errors.port ? 'border-red-500' : ''}
                  />
                  {errors.port && (
                    <p className="text-red-400 text-sm font-mono">{errors.port}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="queryPort" className="text-matrix-400 font-mono">Query Port *</Label>
                  <Input
                    id="queryPort"
                    type="number"
                    value={formData.queryPort}
                    onChange={(e) => handleInputChange('queryPort', parseInt(e.target.value))}
                    min="1"
                    max="65535"
                    disabled={loading}
                    className={errors.queryPort ? 'border-red-500' : ''}
                  />
                  {errors.queryPort && (
                    <p className="text-red-400 text-sm font-mono">{errors.queryPort}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rconPort" className="text-matrix-400 font-mono">RCON Port *</Label>
                  <Input
                    id="rconPort"
                    type="number"
                    value={formData.rconPort}
                    onChange={(e) => handleInputChange('rconPort', parseInt(e.target.value))}
                    min="1"
                    max="65535"
                    disabled={loading}
                    className={errors.rconPort ? 'border-red-500' : ''}
                  />
                  {errors.rconPort && (
                    <p className="text-red-400 text-sm font-mono">{errors.rconPort}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card variant="cyber-glass">
            <CardContent className="space-y-4">
              <h3 className="text-lg font-mono uppercase text-matrix-400 mb-4">Security Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminPassword" className="text-matrix-400 font-mono">Admin Password</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    value={formData.adminPassword}
                    onChange={(e) => handleInputChange('adminPassword', e.target.value)}
                    placeholder="••••••"
                    disabled={loading}
                    className={errors.adminPassword ? 'border-red-500' : ''}
                  />
                  {errors.adminPassword && (
                    <p className="text-red-400 text-sm font-mono">{errors.adminPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rconPassword" className="text-matrix-400 font-mono">RCON Password</Label>
                  <Input
                    id="rconPassword"
                    type="password"
                    value={formData.rconPassword}
                    onChange={(e) => handleInputChange('rconPassword', e.target.value)}
                    placeholder="••••••"
                    disabled={loading}
                    className={errors.rconPassword ? 'border-red-500' : ''}
                  />
                  {errors.rconPassword && (
                    <p className="text-red-400 text-sm font-mono">{errors.rconPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serverPassword" className="text-matrix-400 font-mono">Server Password</Label>
                  <Input
                    id="serverPassword"
                    type="password"
                    value={formData.serverPassword}
                    onChange={(e) => handleInputChange('serverPassword', e.target.value)}
                    placeholder="••••••"
                    disabled={loading}
                    className={errors.serverPassword ? 'border-red-500' : ''}
                  />
                  {errors.serverPassword && (
                    <p className="text-red-400 text-sm font-mono">{errors.serverPassword}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card variant="cyber-glass">
            <CardContent className="space-y-4">
              <h3 className="text-lg font-mono uppercase text-matrix-400 mb-4">Additional Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxPlayers" className="text-matrix-400 font-mono">Max Players *</Label>
                  <Input
                    id="maxPlayers"
                    type="number"
                    value={formData.maxPlayers}
                    onChange={(e) => handleInputChange('maxPlayers', parseInt(e.target.value))}
                    min="1"
                    max="255"
                    disabled={loading}
                    className={errors.maxPlayers ? 'border-red-500' : ''}
                  />
                  {errors.maxPlayers && (
                    <p className="text-red-400 text-sm font-mono">{errors.maxPlayers}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-matrix-400 font-mono">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Server description (optional)"
                    disabled={loading}
                    className={`min-h-[80px] ${errors.description ? 'border-red-500' : ''}`}
                  />
                  {errors.description && (
                    <p className="text-red-400 text-sm font-mono">{errors.description}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="cyber-outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="cyber-solid"
              disabled={loading}
              className="min-w-[140px]"
            >
              {loading ? 'Creating...' : 'Create Server'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 