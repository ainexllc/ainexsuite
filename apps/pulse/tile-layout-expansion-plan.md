# Pulse Tile Layout Expansion Plan

## 🎯 **Current System Analysis**

### **Existing Architecture:**
- **3 fixed slots**: `bottom-left`, `bottom-center`, `bottom-right`
- **Single size**: All tiles are `min-h-[120px]`
- **Fixed 3-column grid**: `grid-cols-1 md:grid-cols-3`
- **Basic drag & drop**: Simple tile swapping between slots

### **Limitations:**
- Only 3 tiles can be displayed simultaneously
- All tiles must be the same size
- No customization of layout structure
- Limited visual hierarchy options

---

## 🚀 **Enhanced Tile Layout System**

### **1. Layout Presets**
```
┌─ 2×2 Grid ──────────────────┐  ┌─ 1×4 Row ───────────────────┐
│  ┌─────┐  ┌─────┐           │  │  ┌─────┬─────┬─────┬─────┐  │
│  │  S  │  │  S  │           │  │  │  S  │  S  │  S  │  S  │  │
│  └─────┘  └─────┘           │  │  └─────┴─────┴─────┴─────┘  │
│  ┌─────┐  ┌─────┐           │  └─────────────────────────────┘
│  │  S  │  │  S  │           │
│  └─────┘  └─────┘           │
└─────────────────────────────┘

┌─ 2×3 Grid ──────────────────┐  ┌─ Custom Layout ─────────────┐
│  ┌─────┐  ┌─────┐  ┌─────┐   │  │  ┌─────────────┐           │
│  │  S  │  │  S  │  │  S  │   │  │  │      L      │  ┌─────┐  │
│  └─────┘  └─────┘  └─────┘   │  │  └─────────────┘  │  S  │  │
│  ┌─────┐  ┌─────┐  ┌─────┐   │  │  ┌─────┐  ┌─────┐  │     │  │
│  │  S  │  │  S  │  │  S  │   │  │  │  S  │  │  S  │  └─────┘  │
│  └─────┘  └─────┘  └─────┘   │  │  └─────┘  └─────┘           │
└─────────────────────────────┘  └─────────────────────────────┘
```

### **2. Tile Size Variants**
```typescript
type TileSize = 'small' | 'medium' | 'large';

interface TileSizeConfig {
  small: { width: 1, height: 1, className: 'col-span-1 row-span-1' };
  medium: { width: 2, height: 1, className: 'col-span-2 row-span-1' };
  large: { width: 2, height: 2, className: 'col-span-2 row-span-2' };
}
```

### **3. Flexible Grid System**
```typescript
interface LayoutConfig {
  id: string;
  name: string;
  gridCols: number;
  gridRows: number;
  slots: SlotDefinition[];
}

interface SlotDefinition {
  id: string;
  position: { col: number; row: number };
  size: TileSize;
  allowedSizes: TileSize[];
}
```

### **4. Advanced Drag & Drop**
- **Size-aware placement**: Prevent invalid tile placements
- **Auto-resize suggestions**: Smart size recommendations
- **Visual feedback**: Highlight valid drop zones
- **Tile swapping**: Exchange tiles of different sizes

---

## 🛠️ **Implementation Roadmap**

### **Phase 1: Core Layout System**
1. **Layout Configuration System**
   - Define layout presets (2×2, 1×4, 2×3, custom)
   - Create layout selector in tile tray
   - Add layout persistence to localStorage

2. **Tile Size Variants**
   - Update `TileBase` component for size variants
   - Implement responsive scaling
   - Add size indicators in tile tray

3. **Flexible Grid Component**
   - Replace fixed 3-column grid with dynamic CSS Grid
   - Implement slot-based positioning
   - Add grid gap and spacing controls

### **Phase 2: Advanced Features**
4. **Enhanced Drag & Drop**
   - Size validation for drop targets
   - Visual drop zone indicators
   - Smart tile placement suggestions
   - Multi-tile selection (future)

5. **Layout Customization**
   - Drag to resize tiles
   - Manual slot configuration
   - Save custom layouts
   - Layout templates

### **Phase 3: Polish & UX**
6. **Responsive Design**
   - Mobile-optimized layouts
   - Adaptive tile sizing
   - Touch-friendly interactions

7. **Visual Enhancements**
   - Smooth layout transitions
   - Loading states for layout changes
   - Error boundaries for invalid layouts

---

## 📊 **Technical Architecture**

### **New Type Definitions**
```typescript
// Layout System
type LayoutPreset = '2x2' | '1x4' | '2x3' | 'custom';
type TileSize = 'small' | 'medium' | 'large';

// Component Props
interface TileLayoutProps {
  layout: LayoutConfig;
  tiles: Record<string, TileInstance>;
  onLayoutChange: (layout: LayoutConfig) => void;
  onTileMove: (tileId: string, fromSlot: string, toSlot: string) => void;
  onTileResize: (tileId: string, newSize: TileSize) => void;
}

// Persistence
interface LayoutState {
  currentLayout: LayoutPreset;
  customLayouts: LayoutConfig[];
  tilePositions: Record<string, { slotId: string; size: TileSize }>;
}
```

### **Component Hierarchy**
```
TileTray
├── LayoutSelector
│   ├── PresetButton (2×2, 1×4, 2×3)
│   └── CustomLayoutEditor
├── TileGrid
│   ├── GridSlot (position-aware drop zones)
│   └── DraggableTile (size-aware tiles)
└── SizeControls
```

### **State Management**
- **Layout State**: Current preset + custom configs
- **Tile State**: Position, size, content per slot
- **UI State**: Drag mode, resize mode, selection

---

## 🎨 **UI/UX Considerations**

### **Visual Design**
- **Grid Guidelines**: Subtle grid lines for alignment
- **Size Indicators**: Visual cues for tile dimensions
- **Drop Zones**: Highlight valid placement areas
- **Resize Handles**: Corner/corner handles for resizing

### **Interaction Patterns**
- **Tap to Select**: Select tiles for resizing
- **Drag to Move**: Standard drag and drop
- **Pinch to Resize**: Touch gesture support
- **Double-tap Reset**: Quick layout reset

### **Accessibility**
- **Keyboard Navigation**: Arrow key movement
- **Screen Reader**: Announce layout changes
- **High Contrast**: Clear visual hierarchy
- **Focus Management**: Proper tab order

---

## 📈 **Success Metrics**

### **User Experience**
- ✅ **Flexibility**: Users can create preferred layouts
- ✅ **Performance**: Smooth interactions at 60fps
- ✅ **Persistence**: Layouts survive app restarts
- ✅ **Responsiveness**: Works on all screen sizes

### **Technical Quality**
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Performance**: Optimized rendering and interactions
- ✅ **Maintainability**: Clean, documented code
- ✅ **Testability**: Comprehensive test coverage

---

## 🚀 **Next Steps**

1. **Start with Phase 1**: Implement basic layout presets
2. **Gather Feedback**: Test with small user group
3. **Iterate**: Add advanced features based on usage patterns
4. **Scale**: Support for more complex layouts and tile types

This plan provides a solid foundation for a much more flexible and powerful tile system! 🎯
