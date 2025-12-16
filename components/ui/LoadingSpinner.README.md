# Pokeball Loading Spinner

A delightful, animated Pokeball loading spinner component for the Pokemon TCG Forum. Features pure CSS animations with no JavaScript dependencies, optimized for performance with GPU acceleration.

## Features

- **Pure CSS Animations**: No JavaScript required for smooth 60fps animations
- **Multiple Sizes**: Four size variants (sm, md, lg, xl)
- **Customizable**: Optional loading text with pulse animation
- **Performance Optimized**: Uses `will-change` for GPU acceleration
- **Theme Integrated**: Uses Pikachu yellow accent color (`#FFCC00`) for glow effects
- **Responsive**: Works seamlessly across all device sizes

## Installation

The component is already installed in the project at:
```
/components/ui/LoadingSpinner.tsx
```

## Usage

### Basic Usage

```tsx
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function MyComponent() {
  return <LoadingSpinner />;
}
```

### With Size Variant

```tsx
<LoadingSpinner size="lg" />
```

Available sizes:
- `sm`: 32px (w-8 h-8)
- `md`: 48px (w-12 h-12) - Default
- `lg`: 64px (w-16 h-16)
- `xl`: 96px (w-24 h-24)

### With Loading Text

```tsx
<LoadingSpinner
  size="md"
  text="Loading Pokemon cards..."
/>
```

### With Custom Styling

```tsx
<LoadingSpinner
  size="xl"
  text="Catching rare cards..."
  className="my-8"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Controls the size of the Pokeball spinner |
| `text` | `string` | `undefined` | Optional loading text displayed below the spinner |
| `className` | `string` | `''` | Additional CSS classes for wrapper div |

## Animations

The component features four synchronized CSS animations:

1. **pokeball-spin** (1s linear infinite)
   - Continuous 360° rotation of the entire Pokeball

2. **pokeball-pulse** (2s ease-in-out infinite)
   - Gentle scale transformation (1.0 to 1.05)
   - Pikachu yellow glow effect using box-shadow

3. **button-glow** (2s ease-in-out infinite)
   - Center button alternates between white and accent color
   - Synchronized glow effect with box-shadow

4. **text-pulse** (2s ease-in-out infinite)
   - Loading text fades between 60% and 100% opacity

## Structure

The Pokeball is constructed with five layers:

```
.pokeball-spinner (container)
├── .pokeball-top (red gradient, top half)
├── .pokeball-bottom (white gradient, bottom half)
├── .pokeball-band (black horizontal band, 12% height)
└── .pokeball-button (black circle with white inner button)
    └── .pokeball-button-inner (animated white/yellow center)
```

## CSS Variables Used

- `--color-accent`: #FFCC00 (Pikachu yellow)
- `--color-text-secondary`: Used for loading text

## Performance Considerations

- Uses `will-change: transform` for optimized GPU rendering
- All animations run on the compositor thread (no layout/paint)
- Minimal DOM structure (5 elements total)
- No JavaScript event listeners or state management

## Demo

Visit `/loading-demo` to see all size variants and usage examples.

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

All modern browsers support the CSS features used (transforms, animations, gradients).

## Examples

### Full Page Loading

```tsx
export default function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="xl" text="Loading..." />
    </div>
  );
}
```

### Inline Loading State

```tsx
export default function CardList({ isLoading }) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="md" text="Loading cards..." />
      </div>
    );
  }

  return <div>{/* Card content */}</div>;
}
```

### Button Loading State

```tsx
export default function SubmitButton({ isSubmitting }) {
  return (
    <button disabled={isSubmitting} className="btn-primary">
      {isSubmitting ? (
        <LoadingSpinner size="sm" />
      ) : (
        'Submit'
      )}
    </button>
  );
}
```

## Customization

### Custom Colors

To change the Pokeball colors, modify the CSS in `globals.css`:

```css
.pokeball-top {
  background: linear-gradient(180deg, #your-color 0%, #your-color-dark 100%);
}

.pokeball-bottom {
  background: linear-gradient(0deg, #your-color 0%, #your-color-light 100%);
}
```

### Custom Animation Speed

Modify the animation durations in `globals.css`:

```css
.pokeball-spinner {
  animation: pokeball-spin 2s linear infinite, pokeball-pulse 3s ease-in-out infinite;
}
```

## Accessibility

- The spinner is purely decorative and uses no ARIA attributes
- Loading text is rendered as standard text for screen readers
- Consider adding `aria-live="polite"` and `role="status"` to the parent container when using for loading states

## License

Part of the Pokemon TCG Forum project.
