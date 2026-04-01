'use client';

import { AlertCircle, ImageIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { SIZE_PRESETS, SUPPORTED_FORMATS } from '@/lib/image-optimization';
import { useImageOptimizationStore } from '@/lib/image-optimization-store';

export function ImageOptimizationSettings() {
  const { settings, setEnabled, setFormat, setQuality, setMaxWidth, setMaxHeight } =
    useImageOptimizationStore();

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Find the matching size preset
  const currentSizePreset = SIZE_PRESETS.find(
    (preset) =>
      preset.value.maxWidth === settings.maxWidth && preset.value.maxHeight === settings.maxHeight,
  );

  return (
    <div className="space-y-4">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label className="text-sm font-medium">Auto-Optimize Images</Label>
          <p className="text-xs text-muted-foreground">Compress and convert images before upload</p>
        </div>
        <Switch checked={settings.enabled} onCheckedChange={setEnabled} />
      </div>

      {settings.enabled && (
        <>
          <div className="border-t border-border pt-4 space-y-4">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label className="text-sm">Output Format</Label>
              <Select
                value={settings.format}
                onValueChange={(val) => setFormat(val as typeof settings.format)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_FORMATS.map((fmt) => (
                    <SelectItem key={fmt.value} value={fmt.value}>
                      <div className="flex flex-col">
                        <span>{fmt.label}</span>
                        <span className="text-xs text-muted-foreground">{fmt.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quality Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Quality</Label>
                <span className="text-xs text-muted-foreground">{settings.quality}%</span>
              </div>
              <Slider
                value={[settings.quality]}
                min={60}
                max={100}
                step={5}
                onValueChange={(values) => setQuality(values[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Smaller</span>
                <span>Better</span>
              </div>
            </div>

            {/* Size Preset */}
            <div className="space-y-2">
              <Label className="text-sm">Maximum Size</Label>
              <Select
                value={currentSizePreset?.value.maxWidth.toString() || 'custom'}
                onValueChange={(value) => {
                  const preset = SIZE_PRESETS.find((p) => p.value.maxWidth.toString() === value);
                  if (preset) {
                    setMaxWidth(preset.value.maxWidth);
                    setMaxHeight(preset.value.maxHeight);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIZE_PRESETS.map((preset) => (
                    <SelectItem
                      key={preset.value.maxWidth}
                      value={preset.value.maxWidth.toString()}
                    >
                      <div className="flex flex-col">
                        <span>{preset.label}</span>
                        <span className="text-xs text-muted-foreground">{preset.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </Button>

            {showAdvanced && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                {/* Custom Width */}
                <div className="space-y-2">
                  <Label className="text-sm">Max Width (px)</Label>
                  <input
                    type="number"
                    value={settings.maxWidth}
                    onChange={(e) => setMaxWidth(parseInt(e.target.value) || 1200)}
                    min={100}
                    max={4000}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                {/* Custom Height */}
                <div className="space-y-2">
                  <Label className="text-sm">Max Height (px)</Label>
                  <input
                    type="number"
                    value={settings.maxHeight}
                    onChange={(e) => setMaxHeight(parseInt(e.target.value) || 1200)}
                    min={100}
                    max={4000}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Info Banner */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <ImageIcon className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <p className="font-medium">Image Optimization Active</p>
              <p className="mt-1">
                Images will be automatically compressed and converted to{' '}
                {settings.format.toUpperCase()} before uploading. This helps reduce file size for
                faster GitHub profile loading.
              </p>
            </div>
          </div>
        </>
      )}

      {!settings.enabled && (
        <div className="flex items-start gap-2 p-3 bg-muted rounded-lg border">
          <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium">Optimization Disabled</p>
            <p className="mt-1">
              Large images may slow down your GitHub profile. Enable optimization to automatically
              compress images before uploading.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
