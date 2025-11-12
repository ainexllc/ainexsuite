'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import {
  Eraser, Palette, Trash2, Maximize2, Minimize2, StickyNote, X, Sun, Moon,
  Undo2, Redo2, Type, Square, Circle, ArrowUp, Download, Hand
} from 'lucide-react';
import { useAuth } from '@ainexsuite/auth';
import { db } from '@ainexsuite/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface StickyNoteType {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  size?: 'small' | 'medium' | 'large';
  locked?: boolean;
}

interface TextElement {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
}

type Tool = 'hand' | 'brush' | 'eraser' | 'text' | 'rectangle' | 'circle' | 'line' | 'arrow';

interface WhiteboardProps {
  // No fixed dimensions; will use container size
}

export function Whiteboard(_props: WhiteboardProps) {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<Tool>('brush');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stickyNotes, setStickyNotes] = useState<StickyNoteType[]>([]);
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [isLoaded, setIsLoaded] = useState(false);

  // New state for enhanced features
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(0);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [stickyNoteColor, setStickyNoteColor] = useState('#fef08a');
  const [stickyNoteSize, setStickyNoteSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [shapeStartPoint, setShapeStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [fontSize] = useState(16);

  // Pan/navigation state
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Load whiteboard data from Firestore
  useEffect(() => {
    if (!user) return;

    const loadWhiteboard = async () => {
      try {
        const whiteboardRef = doc(db, 'whiteboards', user.uid);
        const whiteboardSnap = await getDoc(whiteboardRef);

        if (whiteboardSnap.exists()) {
          const data = whiteboardSnap.data();

          // Load sticky notes
          if (data.stickyNotes) {
            setStickyNotes(data.stickyNotes);
          }

          // Load text elements
          if (data.textElements) {
            setTextElements(data.textElements);
          }

          // Load dark mode preference
          if (typeof data.isDarkMode === 'boolean') {
            setIsDarkMode(data.isDarkMode);
          }

          // Load canvas drawing
          if (data.canvasData && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const img = new Image();
              img.onload = () => {
                ctx.drawImage(img, 0, 0);
              };
              img.src = data.canvasData;
            }
          }
        }
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading whiteboard:', error);
        setIsLoaded(true);
      }
    };

    void loadWhiteboard();
  }, [user]);

  // Resize canvas to container
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      // Save current canvas content
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        tempCtx.drawImage(canvas, 0, 0);
      }

      // Resize canvas
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      // Restore canvas content
      const ctx = canvas.getContext('2d');
      if (ctx && tempCtx) {
        ctx.drawImage(tempCanvas, 0, 0);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      resizeObserver.disconnect();
    };
  }, []);

  // Save canvas state to history for undo/redo
  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasData = canvas.toDataURL();
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyStep + 1);
      newHistory.push(canvasData);
      // Limit history to 50 states to prevent memory issues
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      return newHistory;
    });
    setHistoryStep((prev) => Math.min(prev + 1, 49));
  }, [historyStep]);

  // Undo function
  const undo = useCallback(() => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const newStep = historyStep - 1;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = history[newStep];
      setHistoryStep(newStep);
    }
  }, [history, historyStep]);

  // Redo function
  const redo = useCallback(() => {
    if (historyStep < history.length - 1) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const newStep = historyStep + 1;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = history[newStep];
      setHistoryStep(newStep);
    }
  }, [history, historyStep]);

  // Save whiteboard to Firestore
  const saveWhiteboard = useCallback(async () => {
    if (!user || !isLoaded) return;

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const canvasData = canvas.toDataURL('image/png');
      const whiteboardRef = doc(db, 'whiteboards', user.uid);

      await setDoc(whiteboardRef, {
        canvasData,
        stickyNotes,
        textElements,
        isDarkMode,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving whiteboard:', error);
    }
  }, [user, stickyNotes, textElements, isDarkMode, isLoaded]);

  // Export to PNG
  const exportToPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `whiteboard-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  // Auto-save when sticky notes or dark mode changes
  useEffect(() => {
    if (!isLoaded) return;

    const timeoutId = setTimeout(() => {
      void saveWhiteboard();
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(timeoutId);
  }, [stickyNotes, isDarkMode, saveWhiteboard, isLoaded]);

  // Canvas drawing and interaction handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update cursor based on tool
    if (tool === 'hand') {
      canvas.style.cursor = isPanning ? 'grabbing' : 'grab';
    } else if (tool === 'text') {
      canvas.style.cursor = 'text';
    } else {
      canvas.style.cursor = 'crosshair';
    }

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - panOffset.x;
      const y = e.clientY - rect.top - panOffset.y;

      if (tool === 'hand') {
        // Start panning
        setIsPanning(true);
        setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      } else if (tool === 'brush' || tool === 'eraser') {
        // Start drawing
        setIsDrawing(true);
        ctx.save();
        ctx.translate(panOffset.x, panOffset.y);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = tool === 'eraser' ? (isDarkMode ? '#ffffff' : '#000000') : color;
        ctx.lineWidth = brushSize;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.restore();
      } else if (tool === 'rectangle' || tool === 'circle' || tool === 'arrow') {
        // Start shape drawing
        setShapeStartPoint({ x, y });
        setIsDrawing(true);
      } else if (tool === 'text') {
        // Add text at click position
        const text = prompt('Enter text:');
        if (text) {
          ctx.save();
          ctx.translate(panOffset.x, panOffset.y);
          ctx.font = `${fontSize}px sans-serif`;
          ctx.fillStyle = color;
          ctx.fillText(text, x, y);
          ctx.restore();
          saveToHistory();
          void saveWhiteboard();
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - panOffset.x;
      const y = e.clientY - rect.top - panOffset.y;

      if (tool === 'hand' && isPanning) {
        // Update pan offset
        const newX = e.clientX - panStart.x;
        const newY = e.clientY - panStart.y;
        setPanOffset({ x: newX, y: newY });
      } else if ((tool === 'brush' || tool === 'eraser') && isDrawing) {
        // Continue drawing
        ctx.save();
        ctx.translate(panOffset.x, panOffset.y);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = tool === 'eraser' ? (isDarkMode ? '#ffffff' : '#000000') : color;
        ctx.lineWidth = brushSize;
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.restore();
      } else if (isDrawing && shapeStartPoint) {
        // Preview shape while dragging
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Redraw existing content
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);

          // Draw preview shape
          ctx.translate(panOffset.x, panOffset.y);
          ctx.strokeStyle = color;
          ctx.lineWidth = brushSize;

          if (tool === 'rectangle') {
            const width = x - shapeStartPoint.x;
            const height = y - shapeStartPoint.y;
            ctx.strokeRect(shapeStartPoint.x, shapeStartPoint.y, width, height);
          } else if (tool === 'circle') {
            const radius = Math.sqrt(Math.pow(x - shapeStartPoint.x, 2) + Math.pow(y - shapeStartPoint.y, 2));
            ctx.beginPath();
            ctx.arc(shapeStartPoint.x, shapeStartPoint.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
          } else if (tool === 'arrow') {
            drawArrow(ctx, shapeStartPoint.x, shapeStartPoint.y, x, y);
          }
        };
        if (history.length > 0) {
          img.src = history[historyStep];
        }
        ctx.restore();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (tool === 'hand') {
        setIsPanning(false);
      } else if (isDrawing) {
        if (shapeStartPoint) {
          // Finalize shape
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left - panOffset.x;
          const y = e.clientY - rect.top - panOffset.y;

          ctx.save();
          ctx.translate(panOffset.x, panOffset.y);
          ctx.strokeStyle = color;
          ctx.lineWidth = brushSize;

          if (tool === 'rectangle') {
            const width = x - shapeStartPoint.x;
            const height = y - shapeStartPoint.y;
            ctx.strokeRect(shapeStartPoint.x, shapeStartPoint.y, width, height);
          } else if (tool === 'circle') {
            const radius = Math.sqrt(Math.pow(x - shapeStartPoint.x, 2) + Math.pow(y - shapeStartPoint.y, 2));
            ctx.beginPath();
            ctx.arc(shapeStartPoint.x, shapeStartPoint.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
          } else if (tool === 'arrow') {
            drawArrow(ctx, shapeStartPoint.x, shapeStartPoint.y, x, y);
          }

          ctx.restore();
          setShapeStartPoint(null);
        }

        setIsDrawing(false);
        saveToHistory();
        void saveWhiteboard();
      }
    };

    // Helper function to draw arrow
    const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
      const headlen = 15;
      const angle = Math.atan2(toY - fromY, toX - fromX);

      // Draw line
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      // Draw arrowhead
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    };

    const handleMouseOut = () => {
      if (tool !== 'hand') {
        setIsDrawing(false);
        setShapeStartPoint(null);
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseout', handleMouseOut);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseout', handleMouseOut);
    };
  }, [isDrawing, isPanning, color, brushSize, tool, saveWhiteboard, saveToHistory, isDarkMode, panOffset, panStart, shapeStartPoint, fontSize, history, historyStep]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save after clearing
    void saveWhiteboard();
  }, [saveWhiteboard]);

  const changeTool = useCallback((newTool: Tool) => {
    setTool(newTool);
    if (newTool === 'eraser') {
      setColor(isDarkMode ? '#ffffff' : '#000000');
    } else if (newTool === 'brush') {
      setColor('#000000');
    }
    // Clear any text input in progress when switching tools
    setCurrentTextInput(null);
  }, [isDarkMode]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      // Enter fullscreen
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(err => {
          console.error('Error entering fullscreen:', err);
        });
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.error('Error exiting fullscreen:', err);
        });
      }
    }
  }, [isFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    let previousTool: Tool | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        if (e.key === 'z') {
          e.preventDefault();
          undo();
        } else if (e.key === 'y') {
          e.preventDefault();
          redo();
        } else if (e.key === 's') {
          e.preventDefault();
          void saveWhiteboard();
        }
      } else if (e.key === ' ' && !previousTool) {
        // Spacebar for temporary hand tool
        e.preventDefault();
        previousTool = tool;
        setTool('hand');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' && previousTool) {
        // Release spacebar to go back to previous tool
        setTool(previousTool);
        previousTool = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [undo, redo, saveWhiteboard, tool]);

  // Sticky notes functions
  const addStickyNote = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const newNote: StickyNoteType = {
      id: Date.now().toString(),
      x: 100,
      y: 100,
      text: '',
      color: stickyNoteColor,
      size: stickyNoteSize,
      locked: false,
    };

    setStickyNotes((prev) => [...prev, newNote]);
  }, [stickyNoteColor, stickyNoteSize]);

  const deleteStickyNote = useCallback((id: string) => {
    setStickyNotes((prev) => prev.filter((note) => note.id !== id));
  }, []);

  const updateStickyNoteText = useCallback((id: string, text: string) => {
    setStickyNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, text } : note))
    );
  }, []);

  const handleNoteMouseDown = useCallback((e: React.MouseEvent, noteId: string) => {
    const container = containerRef.current;
    if (!container) return;

    const note = stickyNotes.find((n) => n.id === noteId);
    if (!note) return;

    const rect = container.getBoundingClientRect();
    setDraggedNote(noteId);
    setDragOffset({
      x: e.clientX - rect.left - note.x,
      y: e.clientY - rect.top - note.y,
    });
  }, [stickyNotes]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggedNote) return;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const newX = e.clientX - rect.left - dragOffset.x;
      const newY = e.clientY - rect.top - dragOffset.y;

      setStickyNotes((prev) =>
        prev.map((note) =>
          note.id === draggedNote ? { ...note, x: newX, y: newY } : note
        )
      );
    },
    [draggedNote, dragOffset]
  );

  const handleMouseUp = useCallback(() => {
    setDraggedNote(null);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Grid background for visibility */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px),
            linear-gradient(to bottom, ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
      
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
        }}
      />
      
      {/* Enhanced Toolbar */}
      <div className={`absolute top-4 left-4 flex flex-col gap-3 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border z-10 max-h-[90vh] overflow-y-auto ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-800/95 to-gray-900/95 border-white/10'
          : 'bg-gradient-to-br from-white/95 to-gray-50/95 border-gray-200'
      }`}>
        {/* Undo/Redo Actions */}
        <div className="flex gap-2">
          <button
            onClick={undo}
            disabled={historyStep <= 0}
            className={`p-2.5 rounded-xl transition-all ${
              historyStep <= 0
                ? isDarkMode ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                : isDarkMode
                ? 'bg-white/10 text-white/80 hover:bg-white/20'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="Undo (Ctrl/Cmd+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={historyStep >= history.length - 1}
            className={`p-2.5 rounded-xl transition-all ${
              historyStep >= history.length - 1
                ? isDarkMode ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                : isDarkMode
                ? 'bg-white/10 text-white/80 hover:bg-white/20'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="Redo (Ctrl/Cmd+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            onClick={exportToPNG}
            className={`p-2.5 rounded-xl transition-all ${
              isDarkMode
                ? 'bg-white/10 text-white/80 hover:bg-white/20'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="Export to PNG"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        <div className={`h-px ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />

        {/* Drawing Tools */}
        <div className="flex flex-col gap-2">
          <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
            Tools
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => changeTool('hand')}
              className={`p-2.5 rounded-xl transition-all ${
                tool === 'hand'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 scale-105'
                  : isDarkMode
                  ? 'bg-white/10 text-white/80 hover:bg-white/20'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Hand (Pan/Navigate)"
            >
              <Hand className="w-4 h-4" />
            </button>
            <button
              onClick={() => changeTool('brush')}
              className={`p-2.5 rounded-xl transition-all ${
                tool === 'brush'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 scale-105'
                  : isDarkMode
                  ? 'bg-white/10 text-white/80 hover:bg-white/20'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Brush"
            >
              <Palette className="w-4 h-4" />
            </button>
            <button
              onClick={() => changeTool('eraser')}
              className={`p-2.5 rounded-xl transition-all ${
                tool === 'eraser'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 scale-105'
                  : isDarkMode
                  ? 'bg-white/10 text-white/80 hover:bg-white/20'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Eraser"
            >
              <Eraser className="w-4 h-4" />
            </button>
            <button
              onClick={() => changeTool('text')}
              className={`p-2.5 rounded-xl transition-all ${
                tool === 'text'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 scale-105'
                  : isDarkMode
                  ? 'bg-white/10 text-white/80 hover:bg-white/20'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Text"
            >
              <Type className="w-4 h-4" />
            </button>
            <button
              onClick={() => changeTool('rectangle')}
              className={`p-2.5 rounded-xl transition-all ${
                tool === 'rectangle'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 scale-105'
                  : isDarkMode
                  ? 'bg-white/10 text-white/80 hover:bg-white/20'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Rectangle"
            >
              <Square className="w-4 h-4" />
            </button>
            <button
              onClick={() => changeTool('circle')}
              className={`p-2.5 rounded-xl transition-all ${
                tool === 'circle'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 scale-105'
                  : isDarkMode
                  ? 'bg-white/10 text-white/80 hover:bg-white/20'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Circle"
            >
              <Circle className="w-4 h-4" />
            </button>
            <button
              onClick={() => changeTool('arrow')}
              className={`p-2.5 rounded-xl transition-all ${
                tool === 'arrow'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 scale-105'
                  : isDarkMode
                  ? 'bg-white/10 text-white/80 hover:bg-white/20'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Arrow"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Color Picker */}
        <div className="flex flex-col gap-2">
          <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
            Color
          </span>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className={`w-full h-9 rounded-lg cursor-pointer border-2 ${
              isDarkMode ? 'border-white/20' : 'border-gray-300'
            }`}
            disabled={tool === 'eraser'}
            title="Choose color"
          />
        </div>

        {/* Brush Size */}
        <div className="flex flex-col gap-2">
          <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
            Size
          </span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer ${
                isDarkMode ? 'bg-white/20' : 'bg-gray-200'
              } [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500`}
              title="Brush size"
            />
            <span className={`text-xs font-mono w-5 text-right ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
              {brushSize}
            </span>
          </div>
        </div>

        <div className={`h-px ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'} my-1`} />

        {/* Sticky Notes Section */}
        <div className="flex flex-col gap-2">
          <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
            Sticky Notes
          </span>

          <button
            onClick={addStickyNote}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-medium text-sm shadow-lg transition-all ${
              isDarkMode
                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white'
                : 'bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500 text-gray-900'
            }`}
            title="Add sticky note"
          >
            <StickyNote className="w-4 h-4" />
            <span>Add Note</span>
          </button>

          {/* Sticky Note Color Picker */}
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={stickyNoteColor}
              onChange={(e) => setStickyNoteColor(e.target.value)}
              className={`w-8 h-8 rounded cursor-pointer border-2 ${
                isDarkMode ? 'border-white/20' : 'border-gray-300'
              }`}
              title="Note color"
            />
            <div className="flex gap-1">
              {['#fef08a', '#a7f3d0', '#bfdbfe', '#fbbf24', '#fca5a5'].map((presetColor) => (
                <button
                  key={presetColor}
                  onClick={() => setStickyNoteColor(presetColor)}
                  className={`w-6 h-6 rounded border-2 transition-transform hover:scale-110 ${
                    stickyNoteColor === presetColor ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                  } ${isDarkMode ? 'border-white/20' : 'border-gray-300'}`}
                  style={{ backgroundColor: presetColor }}
                  title="Select color"
                />
              ))}
            </div>
          </div>

          {/* Sticky Note Size Selector */}
          <div className="flex gap-1">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setStickyNoteSize(size)}
                className={`flex-1 px-2 py-1 text-xs rounded-lg transition-all capitalize ${
                  stickyNoteSize === size
                    ? 'bg-blue-500 text-white'
                    : isDarkMode
                    ? 'bg-white/10 text-white/70 hover:bg-white/20'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className={`h-px ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'} my-1`} />

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">

          <button
            onClick={clearCanvas}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-medium text-sm shadow-lg transition-all ${
              isDarkMode
                ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white'
                : 'bg-gradient-to-r from-red-400 to-rose-400 hover:from-red-500 hover:to-rose-500 text-white'
            }`}
            title="Clear canvas"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-medium text-sm transition-all ${
              isDarkMode
                ? 'bg-white/10 hover:bg-white/20 text-white/90'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Fullscreen Button - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={toggleFullscreen}
          className={`p-2 rounded backdrop-blur-sm transition-colors ${
            isDarkMode
              ? 'bg-black/50 text-white hover:bg-black/70'
              : 'bg-white/90 text-gray-800 hover:bg-gray-100 shadow-lg'
          }`}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5" />
          ) : (
            <Maximize2 className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Sticky Notes */}
      {stickyNotes.map((note) => {
        const noteSize = note.size || 'medium';
        const sizeStyles = {
          small: { width: '150px', minHeight: '100px' },
          medium: { width: '200px', minHeight: '150px' },
          large: { width: '250px', minHeight: '200px' },
        };

        return (
          <div
            key={note.id}
            className={`absolute rounded-lg p-3 select-none transition-shadow ${
              note.locked ? 'cursor-not-allowed' : 'cursor-move'
            }`}
            style={{
              left: note.x + panOffset.x,
              top: note.y + panOffset.y,
              backgroundColor: note.color,
              ...sizeStyles[noteSize],
              zIndex: draggedNote === note.id ? 50 : 20,
              color: 'rgb(17 24 39)',
              boxShadow: isDarkMode
                ? '0 8px 30px -12px rgba(56, 189, 248, 0.3)'
                : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            }}
            onMouseDown={(e) => {
              // Only start drag if not locked and not clicking textarea or delete button
              if (!note.locked &&
                  (e.target as HTMLElement).tagName !== 'TEXTAREA' &&
                  (e.target as HTMLElement).tagName !== 'BUTTON' &&
                  !(e.target as HTMLElement).closest('button')) {
                handleNoteMouseDown(e, note.id);
              }
            }}
          >
            <div className="flex justify-end mb-1">
              <button
                onClick={() => deleteStickyNote(note.id)}
                className="p-1 rounded transition-colors hover:bg-black/10 text-gray-700"
                title="Delete note"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <textarea
              value={note.text}
              onChange={(e) => updateStickyNoteText(note.id, e.target.value)}
              className="w-full bg-transparent border-none outline-none resize-none text-sm placeholder:text-gray-500 text-gray-800"
              placeholder="Type your note..."
              style={{
                fontFamily: 'Courier New, monospace',
                height: noteSize === 'small' ? '60px' : noteSize === 'large' ? '160px' : '110px'
              }}
            />
          </div>
        );
      })}

      {/* Fallback for no canvas support */}
      {!canvasRef.current && (
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
          Canvas not supported or error occurred
        </div>
      )}
    </div>
  );
}
