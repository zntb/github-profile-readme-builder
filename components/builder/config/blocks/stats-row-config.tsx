'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { STATS_THEMES } from '@/lib/types';

import { FieldGroup } from '../field-group';

interface StatsRowCardSettingsProps {
  card:
    | {
        type: string;
        props: Record<string, unknown>;
      }
    | undefined;
  onCardPropsChange: (updates: Record<string, unknown>) => void;
  hideSharedSettings?: boolean;
}

function StatsRowCardSettings({
  card,
  onCardPropsChange,
  hideSharedSettings,
}: StatsRowCardSettingsProps) {
  if (!card) {
    return <p className="text-xs text-muted-foreground">Select a card to configure it.</p>;
  }

  return (
    <div className="space-y-3 rounded-md border border-border/60 p-3">
      {!hideSharedSettings && (
        <>
          <FieldGroup>
            <Label>Theme</Label>
            <Select
              value={(card.props.theme as string) || 'default'}
              onValueChange={(value) => onCardPropsChange({ theme: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {STATS_THEMES.map((theme) => (
                  <SelectItem key={theme} value={theme}>
                    {theme}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>

          {(card.type === 'stats-card' ||
            card.type === 'top-languages' ||
            card.type === 'streak-stats') && (
            <FieldGroup>
              <div className="flex items-center justify-between">
                <Label>Hide Border</Label>
                <Switch
                  checked={Boolean(card.props.hideBorder)}
                  onCheckedChange={(checked) => onCardPropsChange({ hideBorder: checked })}
                />
              </div>
            </FieldGroup>
          )}
        </>
      )}

      {(card.type === 'stats-card' || card.type === 'streak-stats') && (
        <FieldGroup>
          <Label>Border Radius ({String(card.props.borderRadius ?? 10)}px)</Label>
          <Input
            type="number"
            value={Number(card.props.borderRadius) || 10}
            onChange={(e) =>
              onCardPropsChange({
                borderRadius: Math.min(20, Math.max(0, parseInt(e.target.value, 10) || 10)),
              })
            }
            min={0}
            max={20}
          />
        </FieldGroup>
      )}

      {card.type === 'top-languages' && (
        <>
          <FieldGroup>
            <Label>Layout</Label>
            <Select
              value={(card.props.layout as string) || 'compact'}
              onValueChange={(value) => onCardPropsChange({ layout: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="donut">Donut</SelectItem>
                <SelectItem value="donut-vertical">Donut Vertical</SelectItem>
                <SelectItem value="pie">Pie</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label>Languages Count ({String(card.props.langs_count ?? 8)})</Label>
            <Input
              type="number"
              value={Number(card.props.langs_count) || 8}
              onChange={(e) =>
                onCardPropsChange({
                  langs_count: Math.min(20, Math.max(1, parseInt(e.target.value, 10) || 8)),
                })
              }
              min={1}
              max={20}
            />
          </FieldGroup>
          <FieldGroup>
            <div className="flex items-center justify-between">
              <Label>Hide Progress</Label>
              <Switch
                checked={Boolean(card.props.hideProgress)}
                onCheckedChange={(checked) => onCardPropsChange({ hideProgress: checked })}
              />
            </div>
          </FieldGroup>
        </>
      )}
    </div>
  );
}

interface StatsRowConfigProps {
  direction: string;
  gap: number;
  card1: { type: string; props: Record<string, unknown> } | undefined;
  card2: { type: string; props: Record<string, unknown> } | undefined;
  theme: string;
  hideBorder: boolean;
  onDirectionChange: (value: string) => void;
  onGapChange: (value: number) => void;
  onCard1Change: (value: { type: string; props: Record<string, unknown> } | undefined) => void;
  onCard2Change: (value: { type: string; props: Record<string, unknown> } | undefined) => void;
  onCard1PropsChange: (updates: Record<string, unknown>) => void;
  onCard2PropsChange: (updates: Record<string, unknown>) => void;
  onThemeChange: (value: string) => void;
  onHideBorderChange: (value: boolean) => void;
}

export function StatsRowConfig({
  direction,
  gap,
  card1,
  card2,
  theme,
  hideBorder,
  onDirectionChange,
  onGapChange,
  onCard1Change,
  onCard2Change,
  onCard1PropsChange,
  onCard2PropsChange,
  onThemeChange,
  onHideBorderChange,
}: StatsRowConfigProps) {
  const cardTypes = [
    { value: 'none', label: 'None' },
    { value: 'stats-card', label: 'Stats' },
    { value: 'top-languages', label: 'Top Languages' },
    { value: 'streak-stats', label: 'Streak Stats' },
  ];

  const createCard = (type: string) => {
    const baseProps = { username: 'github', theme: 'tokyonight', borderRadius: 10 };
    switch (type) {
      case 'stats-card':
        return {
          type: 'stats-card',
          props: {
            ...baseProps,
            showIcons: true,
            hideBorder: false,
            hideTitle: false,
            hideRank: false,
            layoutWidth: 'full',
          },
        };
      case 'top-languages':
        return {
          type: 'top-languages',
          props: {
            ...baseProps,
            layout: 'compact',
            hideBorder: false,
            hideProgress: false,
            langs_count: 8,
            layoutWidth: 'full',
          },
        };
      case 'streak-stats':
        return {
          type: 'streak-stats',
          props: { ...baseProps, hideBorder: false, layoutWidth: 'full' },
        };
      default:
        return undefined;
    }
  };

  return (
    <>
      <FieldGroup>
        <Label>Direction</Label>
        <Select value={direction} onValueChange={onDirectionChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="row">Row (side by side)</SelectItem>
            <SelectItem value="column">Column (stacked)</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>
      <FieldGroup>
        <Label>Gap (px)</Label>
        <Input
          type="number"
          min={0}
          max={48}
          step={2}
          value={gap}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val)) {
              onGapChange(Math.min(48, Math.max(0, val)));
            }
          }}
        />
      </FieldGroup>
      <div className="rounded-md border border-border/60 p-3 space-y-3">
        <Label className="text-sm font-medium">Shared Settings (applies to both cards)</Label>
        <FieldGroup>
          <Label>Theme</Label>
          <Select value={theme} onValueChange={onThemeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {STATS_THEMES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldGroup>
        <FieldGroup>
          <div className="flex items-center justify-between">
            <Label>Hide Border</Label>
            <Switch checked={hideBorder} onCheckedChange={onHideBorderChange} />
          </div>
        </FieldGroup>
      </div>
      <FieldGroup>
        <Label>Card 1</Label>
        <Select
          value={card1?.type ?? 'none'}
          onValueChange={(value) => onCard1Change(createCard(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {cardTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldGroup>
      <FieldGroup>
        <Label>Card 2</Label>
        <Select
          value={card2?.type ?? 'none'}
          onValueChange={(value) => onCard2Change(createCard(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {cardTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldGroup>
      <FieldGroup>
        <Label>Card 1 Settings</Label>
        <StatsRowCardSettings
          card={card1}
          onCardPropsChange={onCard1PropsChange}
          hideSharedSettings
        />
      </FieldGroup>
      <FieldGroup>
        <Label>Card 2 Settings</Label>
        <StatsRowCardSettings
          card={card2}
          onCardPropsChange={onCard2PropsChange}
          hideSharedSettings
        />
      </FieldGroup>
      <p className="text-xs text-muted-foreground">
        Configure up to two cards here, or select Stats Row and add cards from the sidebar.
      </p>
    </>
  );
}
