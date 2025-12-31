/**
 * Overlay shown when the canvas is empty, prompting users to start designing
 */
export function EmptyCanvasOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
      <div className="bg-background/40 backdrop-blur-sm border border-border rounded-2xl p-8 text-center max-w-md animate-fade-in">
        <div className="text-4xl mb-4">✨</div>
        <h3 className="text-xl font-bold text-foreground mb-2">Start Designing</h3>
        <p className="text-muted-foreground mb-4">
          Drag shapes from the palette on the left to begin mapping your workflow.
        </p>
        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="bg-foreground/10 px-1.5 py-0.5 rounded">Del</kbd> to remove
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-foreground/10 px-1.5 py-0.5 rounded">⌘Z</kbd> to undo
          </span>
        </div>
      </div>
    </div>
  );
}
