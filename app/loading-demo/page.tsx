import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function LoadingDemo() {
  return (
    <div className="content-container">
      <div className="section-header">
        <h1 className="section-title">Pokeball Loading Spinner Demo</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Small Size */}
        <div className="bg-bg-secondary border border-border rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px]">
          <h3 className="text-lg font-semibold mb-6 text-text-primary">Small (sm)</h3>
          <LoadingSpinner size="sm" />
        </div>

        {/* Medium Size */}
        <div className="bg-bg-secondary border border-border rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px]">
          <h3 className="text-lg font-semibold mb-6 text-text-primary">Medium (md) - Default</h3>
          <LoadingSpinner size="md" />
        </div>

        {/* Large Size */}
        <div className="bg-bg-secondary border border-border rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px]">
          <h3 className="text-lg font-semibold mb-6 text-text-primary">Large (lg)</h3>
          <LoadingSpinner size="lg" />
        </div>

        {/* Extra Large Size */}
        <div className="bg-bg-secondary border border-border rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px]">
          <h3 className="text-lg font-semibold mb-6 text-text-primary">Extra Large (xl)</h3>
          <LoadingSpinner size="xl" />
        </div>
      </div>

      {/* With Loading Text */}
      <div className="bg-bg-secondary border border-border rounded-lg p-12">
        <h3 className="text-lg font-semibold mb-8 text-text-primary text-center">
          With Loading Text
        </h3>
        <div className="flex flex-col gap-8">
          <LoadingSpinner size="md" text="Loading Pokemon cards..." />
          <LoadingSpinner size="lg" text="Catching rare cards..." />
          <LoadingSpinner size="xl" text="Searching the TCG database..." />
        </div>
      </div>

      {/* Usage Example */}
      <div className="mt-12 bg-bg-tertiary border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-text-primary">Usage Example</h3>
        <pre className="bg-bg-primary p-4 rounded overflow-x-auto text-sm text-text-secondary">
{`import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Basic usage
<LoadingSpinner />

// With size
<LoadingSpinner size="lg" />

// With loading text
<LoadingSpinner size="md" text="Loading..." />

// With custom className
<LoadingSpinner
  size="xl"
  text="Catching Pokemon..."
  className="my-8"
/>`}
        </pre>
      </div>

      {/* Props Documentation */}
      <div className="mt-8 bg-bg-tertiary border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-text-primary">Props</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-4 text-text-primary">Prop</th>
              <th className="text-left py-2 px-4 text-text-primary">Type</th>
              <th className="text-left py-2 px-4 text-text-primary">Default</th>
              <th className="text-left py-2 px-4 text-text-primary">Description</th>
            </tr>
          </thead>
          <tbody className="text-text-secondary">
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">size</td>
              <td className="py-2 px-4 font-mono">{`'sm' | 'md' | 'lg' | 'xl'`}</td>
              <td className="py-2 px-4 font-mono">{`'md'`}</td>
              <td className="py-2 px-4">Controls the size of the Pokeball spinner</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">text</td>
              <td className="py-2 px-4 font-mono">string</td>
              <td className="py-2 px-4 font-mono">undefined</td>
              <td className="py-2 px-4">Optional loading text displayed below spinner</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono">className</td>
              <td className="py-2 px-4 font-mono">string</td>
              <td className="py-2 px-4 font-mono">{`''`}</td>
              <td className="py-2 px-4">Additional CSS classes for custom styling</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Animation Details */}
      <div className="mt-8 bg-bg-tertiary border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-text-primary">Animation Features</h3>
        <ul className="space-y-2 text-text-secondary">
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">•</span>
            <span><strong className="text-text-primary">Pokeball Spin:</strong> Continuous 360° rotation (1s linear infinite)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">•</span>
            <span><strong className="text-text-primary">Pokeball Pulse:</strong> Gentle scale and glow effect (2s ease-in-out infinite)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">•</span>
            <span><strong className="text-text-primary">Button Glow:</strong> Center button pulses between white and Pikachu yellow accent color</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">•</span>
            <span><strong className="text-text-primary">Text Pulse:</strong> Loading text fades in and out smoothly</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">•</span>
            <span><strong className="text-text-primary">CSS-Only:</strong> All animations use pure CSS with no JavaScript required</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">•</span>
            <span><strong className="text-text-primary">Performance:</strong> Uses <code className="text-accent">will-change</code> for optimized GPU acceleration</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
