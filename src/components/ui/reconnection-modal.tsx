import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TokenUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateToken: (token: string) => Promise<void>;
  businessName?: string;
  phoneNumber?: string;
  errorMessage?: string;
  isLoading?: boolean;
}

export function TokenUpdateModal({
  isOpen,
  onClose,
  onUpdateToken,
  businessName,
  phoneNumber,
  errorMessage,
  isLoading = false
}: TokenUpdateModalProps) {
  const [accessToken, setAccessToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleUpdateToken = async () => {
    if (!accessToken.trim()) {
      setLocalError('Access token is required');
      return;
    }

    setLocalError('');
    try {
      await onUpdateToken(accessToken);
      setAccessToken('');
      onClose();
    } catch (error: any) {
      setLocalError(error.message || 'Failed to update token');
    }
  };

  const handleClose = () => {
    setAccessToken('');
    setLocalError('');
    setShowToken(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Update WhatsApp Access Token
          </DialogTitle>
          <DialogDescription>
            Your WhatsApp access token has expired. Please update it to continue using WhatsApp features.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage || "The connection to your WhatsApp Business account has been lost. This usually happens when your Facebook password was changed or the session expired for security reasons."}
            </AlertDescription>
          </Alert>

          {businessName && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium">Business Account</p>
              <p className="text-sm text-gray-600">{businessName}</p>
              {phoneNumber && (
                <p className="text-sm text-gray-600">{phoneNumber}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="access-token">WhatsApp Access Token</Label>
            <div className="relative">
              <Input
                id="access-token"
                type={showToken ? 'text' : 'password'}
                placeholder="Enter your WhatsApp access token"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {localError && (
              <p className="text-sm text-red-600">{localError}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleUpdateToken} 
              className="w-full"
              disabled={isLoading || !accessToken.trim()}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating Token...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Access Token
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleClose} className="w-full" disabled={isLoading}>
              Cancel
            </Button>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• You can find your access token in your Facebook Developer Console</p>
            <p>• Make sure the token has the necessary permissions for WhatsApp Business API</p>
            <p>• The token will be securely stored and encrypted</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
