'use client';

import { useState } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from '../../components/modal';
import { GlassModal, GlassModalHeader, GlassModalTitle, GlassModalDescription, GlassModalContent, GlassModalFooter } from '../../components/glass-modal';
import { ConfirmationDialog } from '../../components/confirmation-dialog';
import { Button } from '../../components/buttons/button';
import { X } from 'lucide-react';

export function ModalsSection() {
  const [modalSize, setModalSize] = useState<'sm' | 'md' | 'lg' | 'xl' | null>(null);
  const [glassModalVariant, setGlassModalVariant] = useState<'default' | 'elevated' | 'frosted' | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Modal Sizes */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Modal Sizes</h4>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={() => setModalSize('sm')}>
            Small Modal
          </Button>
          <Button variant="outline" size="sm" onClick={() => setModalSize('md')}>
            Medium Modal
          </Button>
          <Button variant="outline" size="sm" onClick={() => setModalSize('lg')}>
            Large Modal
          </Button>
          <Button variant="outline" size="sm" onClick={() => setModalSize('xl')}>
            XL Modal
          </Button>
        </div>

        {/* Size Preview - Static */}
        <div className="mt-4 grid grid-cols-4 gap-3">
          {(['sm', 'md', 'lg', 'xl'] as const).map((size) => {
            const widths = { sm: 'w-24', md: 'w-32', lg: 'w-40', xl: 'w-48' };
            return (
              <div key={size} className="text-center">
                <div className={`${widths[size]} h-16 mx-auto rounded-lg border-2 border-dashed border-border bg-muted/30 flex items-center justify-center`}>
                  <span className="text-xs text-muted-foreground uppercase">{size}</span>
                </div>
                <span className="text-xs text-muted-foreground mt-1 block">{size}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* GlassModal Variants */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">GlassModal Variants</h4>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={() => setGlassModalVariant('default')}>
            Default Glass
          </Button>
          <Button variant="outline" size="sm" onClick={() => setGlassModalVariant('elevated')}>
            Elevated Glass
          </Button>
          <Button variant="outline" size="sm" onClick={() => setGlassModalVariant('frosted')}>
            Frosted Glass
          </Button>
        </div>

        {/* Variant Preview - Static */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-border bg-background/80 backdrop-blur-sm">
            <p className="text-xs font-medium text-muted-foreground mb-1">Default</p>
            <p className="text-xs text-muted-foreground">Light blur</p>
          </div>
          <div className="p-4 rounded-xl border border-border bg-background/60 backdrop-blur-md shadow-lg">
            <p className="text-xs font-medium text-muted-foreground mb-1">Elevated</p>
            <p className="text-xs text-muted-foreground">Medium blur + shadow</p>
          </div>
          <div className="p-4 rounded-xl border border-border/50 bg-background/40 backdrop-blur-xl">
            <p className="text-xs font-medium text-muted-foreground mb-1">Frosted</p>
            <p className="text-xs text-muted-foreground">Heavy blur</p>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">ConfirmationDialog</h4>
        <div className="flex flex-wrap gap-3">
          <Button variant="danger" size="sm" onClick={() => setConfirmDialogOpen(true)}>
            Delete Item
          </Button>
        </div>

        {/* Static Preview */}
        <div className="mt-4 p-4 rounded-xl border border-red-500/30 bg-red-500/5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-red-500/10">
              <X className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Delete this item?</p>
              <p className="text-xs text-muted-foreground mt-1">This action cannot be undone.</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4 justify-end">
            <Button variant="ghost" size="sm">Cancel</Button>
            <Button variant="danger" size="sm">Delete</Button>
          </div>
        </div>
      </div>

      {/* Modal Structure Preview */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Modal Structure</h4>
        <div className="p-4 rounded-xl border border-border bg-surface-elevated">
          <div className="border-b border-border pb-3 mb-3">
            <p className="text-sm font-semibold text-foreground">Modal Title</p>
            <p className="text-xs text-muted-foreground">Optional description text</p>
          </div>
          <div className="py-4 text-sm text-muted-foreground">
            Modal content goes here...
          </div>
          <div className="border-t border-border pt-3 mt-3 flex justify-end gap-2">
            <Button variant="ghost" size="sm">Cancel</Button>
            <Button variant="primary" size="sm">Confirm</Button>
          </div>
        </div>
      </div>

      {/* Actual Modals (rendered in portal) */}
      {modalSize && (
        <Modal isOpen={true} onClose={() => setModalSize(null)} size={modalSize}>
          <ModalHeader>
            <ModalTitle>Modal - {modalSize.toUpperCase()}</ModalTitle>
            <ModalDescription>This is a {modalSize} sized modal dialog.</ModalDescription>
          </ModalHeader>
          <ModalContent>
            <p className="text-sm text-muted-foreground">
              Modal content for the {modalSize} size variant. The modal will adjust its width based on the size prop.
            </p>
          </ModalContent>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setModalSize(null)}>Cancel</Button>
            <Button variant="primary" onClick={() => setModalSize(null)}>Confirm</Button>
          </ModalFooter>
        </Modal>
      )}

      {glassModalVariant && (
        <GlassModal isOpen={true} onClose={() => setGlassModalVariant(null)} variant={glassModalVariant}>
          <GlassModalHeader>
            <GlassModalTitle>Glass Modal - {glassModalVariant}</GlassModalTitle>
            <GlassModalDescription>Glassmorphism style modal with {glassModalVariant} variant.</GlassModalDescription>
          </GlassModalHeader>
          <GlassModalContent>
            <p className="text-sm text-muted-foreground">
              This modal uses backdrop blur and transparency for a modern glass effect.
            </p>
          </GlassModalContent>
          <GlassModalFooter>
            <Button variant="ghost" onClick={() => setGlassModalVariant(null)}>Cancel</Button>
            <Button variant="primary" onClick={() => setGlassModalVariant(null)}>Confirm</Button>
          </GlassModalFooter>
        </GlassModal>
      )}

      <ConfirmationDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={() => setConfirmDialogOpen(false)}
        title="Delete this item?"
        description="This action cannot be undone. The item will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
