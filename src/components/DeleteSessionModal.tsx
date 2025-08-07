import React from 'react';
import { Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DeleteSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sessionData: {
    id: string;
    timestamp: string;
    internalFileName: string;
    providerFileName: string;
    summary: {
      matched: number;
      internalOnly: number;
      providerOnly: number;
      mismatched: number;
      totalInternal: number;
      totalProvider: number;
    };
  } | null;
}

const DeleteSessionModal: React.FC<DeleteSessionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  sessionData
}) => {
  if (!sessionData) return null;

  const totalTransactions = sessionData.summary.matched + 
                           sessionData.summary.internalOnly + 
                           sessionData.summary.providerOnly + 
                           sessionData.summary.mismatched;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Delete Reconciliation Session
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this reconciliation session? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-muted bg-muted/20 p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Session ID:</span>
                <span className="text-muted-foreground">{sessionData.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span className="text-muted-foreground">
                  {new Date(sessionData.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Files:</span>
                <span className="text-muted-foreground text-right">
                  {sessionData.internalFileName}
                  <br />
                  {sessionData.providerFileName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Transactions:</span>
                <span className="text-muted-foreground">{totalTransactions}</span>
              </div>
            </div>
          </div>

          <Alert variant="destructive">
            <AlertDescription className="flex items-center gap-2">
              <X className="h-4 w-4" />
              This action is permanent and cannot be reversed.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Delete Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSessionModal;