'use client';

import dynamic from 'next/dynamic';

import { resolveFooterBannerColors } from '@/lib/footer-banner-utils';
import { generateId } from '@/lib/store';
import { SKILL_ICONS, type Block } from '@/lib/types';

import { type BackgroundType, type GradientDirection } from './gradient-color-picker';

// Lazy load block config components for code splitting
// Each block type config will be loaded on-demand when that block is selected
const ActivityGraphConfig = dynamic(
  () => import('./blocks/activity-graph-config').then((m) => m.ActivityGraphConfig),
  { ssr: false, loading: () => <ConfigSkeleton /> },
);
const AvatarConfig = dynamic(() => import('./blocks/avatar-config').then((m) => m.AvatarConfig), {
  ssr: false,
  loading: () => <ConfigSkeleton />,
});
const CapsuleHeaderConfig = dynamic(
  () => import('./blocks/capsule-header-config').then((m) => m.CapsuleHeaderConfig),
  { ssr: false, loading: () => <ConfigSkeleton /> },
);
const CodeBlockConfig = dynamic(
  () => import('./blocks/code-block-config').then((m) => m.CodeBlockConfig),
  { ssr: false, loading: () => <ConfigSkeleton /> },
);
const CollapsibleConfig = dynamic(
  () => import('./blocks/collapsible-config').then((m) => m.CollapsibleConfig),
  { ssr: false, loading: () => <ConfigSkeleton /> },
);
const CustomBadgeConfig = dynamic(
  () => import('./blocks/custom-badge-config').then((m) => m.CustomBadgeConfig),
  { ssr: false, loading: () => <ConfigSkeleton /> },
);
const DividerConfig = dynamic(
  () => import('./blocks/divider-config').then((m) => m.DividerConfig),
  { ssr: false, loading: () => <ConfigSkeleton /> },
);
const FooterBannerConfig = dynamic(
  () => import('./blocks/footer-banner-config').then((m) => m.FooterBannerConfig),
  { ssr: false, loading: () => <ConfigSkeleton /> },
);
const GifConfig = dynamic(() => import('./blocks/gif-config').then((m) => m.GifConfig), {
  ssr: false,
  loading: () => <ConfigSkeleton />,
});
const GreetingConfig = dynamic(
  () => import('./blocks/greeting-config').then((m) => m.GreetingConfig),
  { ssr: false, loading: () => <ConfigSkeleton /> },
);
const HeadingConfig = dynamic(
  () => import('./blocks/heading-config').then((m) => m.HeadingConfig),
  { ssr: false, loading: () => <ConfigSkeleton /> },
);
const ImageConfig = dynamic(() => import('./blocks/image-config').then((m) => m.ImageConfig), {
  ssr: false,
  loading: () => <ConfigSkeleton />,
});
const ParagraphConfig = dynamic(
  () => import('./blocks/paragraph-config').then((m) => m.ParagraphConfig),
  { ssr: false, loading: () => <ConfigSkeleton /> },
);
const QuoteConfig = dynamic(() => import('./blocks/quote-config').then((m) => m.QuoteConfig), {
  ssr: false,
  loading: () => <ConfigSkeleton />,
});
const SkillIconsConfig = dynamic(
  () => import('./blocks/skill-icons-config').then((m) => m.SkillIconsConfig),
  { ssr: false, loading: () => <ConfigSkeleton /> },
);
const SocialBadgesConfig = dynamic(
  () => import('./blocks/social-badges-config').then((m) => m.SocialBadgesConfig),
  { ssr: false, loading: () => <ConfigSkeleton /> },
);
const SpacerConfig = dynamic(() => import('./blocks/spacer-config').then((m) => m.SpacerConfig), {
  ssr: false,
  loading: () => <ConfigSkeleton />,
});
const StatsCardConfig = dynamic(
  () => import('./blocks/stats-card-config').then((m) => m.StatsCardConfig),
  { ssr: false, loading: () => <ConfigSkeleton /> },
);
const StatsRowConfig = dynamic(
  () => import('./blocks/stats-row-config').then((m) => m.StatsRowConfig),
  { ssr: false, loading: () => <ConfigSkeleton /> },
);
const StreakStatsConfig = dynamic(
  () => import('./blocks/streak-stats-config').then((m) => m.StreakStatsConfig),
  { ssr: false, loading: () => <ConfigSkeleton /> },
);
const SupportLinkConfig = dynamic(
  () => import('./blocks/support-link-config').then((m) => m.SupportLinkConfig),
  { ssr: false, loading: () => <ConfigSkeleton /> },
);
const TopLanguagesConfig = dynamic(
  () => import('./blocks/top-languages-config').then((m) => m.TopLanguagesConfig),
  { ssr: false, loading: () => <ConfigSkeleton /> },
);
const TrophiesConfig = dynamic(
  () => import('./blocks/trophies-config').then((m) => m.TrophiesConfig),
  { ssr: false, loading: () => <ConfigSkeleton /> },
);
const TypingAnimationConfig = dynamic(
  () => import('./blocks/typing-animation-config').then((m) => m.TypingAnimationConfig),
  { ssr: false, loading: () => <ConfigSkeleton /> },
);
const VisitorCounterConfig = dynamic(
  () => import('./blocks/visitor-counter-config').then((m) => m.VisitorCounterConfig),
  { ssr: false, loading: () => <ConfigSkeleton /> },
);
const WakatimeStatsConfig = dynamic(
  () => import('./blocks/wakatime-stats-config').then((m) => m.WakatimeStatsConfig),
  { ssr: false, loading: () => <ConfigSkeleton /> },
);

// Skeleton component for loading state
function ConfigSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-muted rounded w-3/4" />
      <div className="h-10 bg-muted rounded w-full" />
      <div className="h-10 bg-muted rounded w-5/6" />
      <div className="h-10 bg-muted rounded w-4/5" />
    </div>
  );
}

interface BlockConfigFieldsProps {
  block: Block;
  updateBlock: (id: string, props: Record<string, unknown>) => void;
  updateBlockChildren: (id: string, children: Block[]) => void;
}

export function BlockConfigFields({
  block,
  updateBlock,
  updateBlockChildren,
}: BlockConfigFieldsProps) {
  const { type, props, id } = block;

  const update = (key: string, value: unknown) => {
    updateBlock(id, { [key]: value });
  };

  const getNumberProp = (key: string, fallback: number) => {
    const value = props[key];
    const numericValue = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(numericValue) ? numericValue : fallback;
  };

  type StatsChildType = 'stats-card' | 'top-languages' | 'streak-stats';
  const statsChildTypes: StatsChildType[] = ['stats-card', 'top-languages', 'streak-stats'];

  switch (type) {
    case 'stats-row': {
      const statsChildren = block.children
        ? [
            ...block.children.filter((child): child is Block & { type: StatsChildType } =>
              statsChildTypes.includes(child.type as StatsChildType),
            ),
          ]
        : [];

      const updateCardProps = (slotIndex: 0 | 1, updates: Record<string, unknown>) => {
        const currentStatsChildren = block.children
          ? [
              ...block.children.filter((child): child is Block & { type: StatsChildType } =>
                statsChildTypes.includes(child.type as StatsChildType),
              ),
            ]
          : [];
        const nextSlots: Array<Block | undefined> = [
          currentStatsChildren[0],
          currentStatsChildren[1],
        ];
        const targetCard = nextSlots[slotIndex];
        if (!targetCard) return;
        nextSlots[slotIndex] = {
          ...targetCard,
          props: {
            ...targetCard.props,
            ...updates,
          },
        };
        updateBlockChildren(
          id,
          nextSlots.filter((child): child is Block => Boolean(child)),
        );
      };

      return (
        <StatsRowConfig
          direction={(props.direction as string) ?? 'row'}
          gap={(props.gap as number) ?? 12}
          card1={statsChildren[0]}
          card2={statsChildren[1]}
          theme={(props.theme as string) ?? 'default'}
          hideBorder={(props.hideBorder as boolean) ?? false}
          onDirectionChange={(v) => update('direction', v)}
          onGapChange={(v) => update('gap', v)}
          onCard1Change={(card) => {
            if (!card) {
              updateBlockChildren(id, statsChildren[1] ? [statsChildren[1]] : []);
            } else {
              const newCard = { ...card, id: generateId() } as Block;
              updateBlockChildren(id, statsChildren[1] ? [newCard, statsChildren[1]] : [newCard]);
            }
          }}
          onCard2Change={(card) => {
            if (!card) {
              updateBlockChildren(id, statsChildren[0] ? [statsChildren[0]] : []);
            } else {
              const newCard = { ...card, id: generateId() } as Block;
              updateBlockChildren(id, statsChildren[0] ? [statsChildren[0], newCard] : [newCard]);
            }
          }}
          onCard1PropsChange={(updates) => updateCardProps(0, updates)}
          onCard2PropsChange={(updates) => updateCardProps(1, updates)}
          onThemeChange={(v) => {
            update('theme', v);
            // Update both cards' props directly
            const currentStatsChildren = block.children
              ? [
                  ...block.children.filter((child): child is Block & { type: StatsChildType } =>
                    statsChildTypes.includes(child.type as StatsChildType),
                  ),
                ]
              : [];
            const updatedChildren = currentStatsChildren.map((child) => ({
              ...child,
              props: { ...child.props, theme: v },
            }));
            if (updatedChildren.length > 0) {
              updateBlockChildren(id, updatedChildren);
            }
          }}
          onHideBorderChange={(v) => {
            update('hideBorder', v);
            // Update both cards' props directly
            const currentStatsChildren = block.children
              ? [
                  ...block.children.filter((child): child is Block & { type: StatsChildType } =>
                    statsChildTypes.includes(child.type as StatsChildType),
                  ),
                ]
              : [];
            const updatedChildren = currentStatsChildren.map((child) => ({
              ...child,
              props: { ...child.props, hideBorder: v },
            }));
            if (updatedChildren.length > 0) {
              updateBlockChildren(id, updatedChildren);
            }
          }}
        />
      );
    }

    case 'divider':
      return (
        <DividerConfig
          type={(props.type as string) ?? 'line'}
          gifUrl={(props.gifUrl as string) ?? ''}
          bgType={(props.bgType as BackgroundType) ?? 'solid'}
          bgGradientDirection={(props.bgGradientDirection as GradientDirection) ?? 'horizontal'}
          bgStartColor={(props.bgStartColor as string) ?? 'CCCCCC'}
          bgEndColor={(props.bgEndColor as string) ?? '999999'}
          bgSolidColor={(props.bgSolidColor as string) ?? 'CCCCCC'}
          thickness={(props.thickness as number) ?? 2}
          alignment={(props.alignment as string) ?? 'center'}
          onTypeChange={(v) => update('type', v)}
          onGifUrlChange={(v) => update('gifUrl', v)}
          onBgTypeChange={(v) => update('bgType', v)}
          onBgGradientDirectionChange={(v) => update('bgGradientDirection', v)}
          onBgStartColorChange={(v) => update('bgStartColor', v)}
          onBgEndColorChange={(v) => update('bgEndColor', v)}
          onBgSolidColorChange={(v) => update('bgSolidColor', v)}
          onThicknessChange={(v) => update('thickness', v)}
          onAlignmentChange={(v) => update('alignment', v)}
        />
      );

    case 'spacer':
      return (
        <SpacerConfig
          height={(props.height as number) ?? 20}
          onHeightChange={(v) => update('height', v)}
        />
      );

    case 'capsule-header': {
      // Support both new format (bgStartColor/bgEndColor) and legacy format (color)
      let bgStartColor = props.bgStartColor as string;
      let bgEndColor = props.bgEndColor as string;

      if (props.color) {
        const colorValue = props.color as string;
        const colorParts = colorValue.split(',');
        if (colorParts.length >= 2) {
          const startMatch = colorParts[0].match(/\d+:([0-9a-fA-F]+)/);
          const endMatch = colorParts[1].match(/\d+:([0-9a-fA-F]+)/);
          if (startMatch) bgStartColor = startMatch[1].toUpperCase();
          if (endMatch) bgEndColor = endMatch[1].toUpperCase();
        }
      }

      bgStartColor = bgStartColor ?? 'EEFF00';
      bgEndColor = bgEndColor ?? 'A82DAA';

      const currentType = (props.type as string) ?? 'waving';
      const currentSection = (props.section as string) ?? 'header';
      const currentHeight = getNumberProp('height', 200);
      const maxR = Math.floor(currentHeight / 2);

      return (
        <CapsuleHeaderConfig
          text={props.text as string}
          type={currentType}
          section={currentSection}
          height={currentHeight}
          fontSize={getNumberProp('fontSize', 30)}
          bgType={(props.bgType as 'solid' | 'gradient' | 'animated') ?? 'gradient'}
          bgGradientDirection={
            (props.bgGradientDirection as
              | 'horizontal'
              | 'vertical'
              | 'diagonal'
              | 'radial'
              | 'conic') ?? 'horizontal'
          }
          bgAnimation={
            (props.bgAnimation as 'none' | 'gradient' | 'pulse' | 'wave' | 'shimmer') ?? 'none'
          }
          bgStartColor={bgStartColor}
          bgEndColor={bgEndColor}
          bgSolidColor={(props.bgSolidColor as string) ?? 'EEFF00'}
          fontColor={(props.fontColor as string) ?? 'ffffff'}
          borderRadiusTL={
            props.borderRadiusTL !== undefined
              ? Math.min(Number(props.borderRadiusTL), maxR)
              : undefined
          }
          borderRadiusTR={
            props.borderRadiusTR !== undefined
              ? Math.min(Number(props.borderRadiusTR), maxR)
              : undefined
          }
          borderRadiusBR={
            props.borderRadiusBR !== undefined
              ? Math.min(Number(props.borderRadiusBR), maxR)
              : undefined
          }
          borderRadiusBL={
            props.borderRadiusBL !== undefined
              ? Math.min(Number(props.borderRadiusBL), maxR)
              : undefined
          }
          parallaxEffect={(props.parallaxEffect as boolean) ?? false}
          onTextChange={(v) => update('text', v)}
          onTypeChange={(v) => {
            update('type', v);
            update('color', undefined);
          }}
          onSectionChange={(v) => {
            update('section', v);
            update('color', undefined);
          }}
          onHeightChange={(v) => {
            update('height', v);
            update('color', undefined);
          }}
          onFontSizeChange={(v) => {
            update('fontSize', v);
            update('color', undefined);
          }}
          onFontColorChange={(v) => {
            update('fontColor', v);
            update('color', undefined);
          }}
          onBgTypeChange={(v) => {
            update('bgType', v);
            update('color', undefined);
          }}
          onBgGradientDirectionChange={(v) => {
            update('bgGradientDirection', v);
            update('color', undefined);
          }}
          onBgAnimationChange={(v) => {
            update('bgAnimation', v);
            update('color', undefined);
          }}
          onBgStartColorChange={(v) => {
            update('bgStartColor', v);
            update('color', undefined);
          }}
          onBgEndColorChange={(v) => {
            update('bgEndColor', v);
            update('color', undefined);
          }}
          onBgSolidColorChange={(v) => update('bgSolidColor', v)}
          onBorderRadiusTLChange={(v) => update('borderRadiusTL', v)}
          onBorderRadiusTRChange={(v) => update('borderRadiusTR', v)}
          onBorderRadiusBRChange={(v) => update('borderRadiusBR', v)}
          onBorderRadiusBLChange={(v) => update('borderRadiusBL', v)}
          onParallaxEffectChange={(v) => update('parallaxEffect', v)}
          wavePosition={getNumberProp('wavePosition', 70)}
          waveAmplitude={getNumberProp('waveAmplitude', 20)}
          waveSpeed={getNumberProp('waveSpeed', 20)}
          waveFlip={(props.waveFlip as boolean) ?? false}
          onWavePositionChange={(v) => update('wavePosition', v)}
          onWaveAmplitudeChange={(v) => update('waveAmplitude', v)}
          onWaveSpeedChange={(v) => update('waveSpeed', v)}
          onWaveFlipChange={(v) => update('waveFlip', v)}
          textAlignX={getNumberProp('textAlignX', 50)}
          textAlignY={getNumberProp('textAlignY', 50)}
          onTextAlignXChange={(v) => update('textAlignX', v)}
          onTextAlignYChange={(v) => update('textAlignY', v)}
        />
      );
    }

    case 'avatar':
      return (
        <AvatarConfig
          imageUrl={(props.imageUrl as string) ?? ''}
          size={getNumberProp('size', 150)}
          borderRadius={getNumberProp('borderRadius', 50)}
          borderColor={(props.borderColor as string) ?? ''}
          onImageUrlChange={(v) => update('imageUrl', v)}
          onSizeChange={(v) => update('size', v)}
          onBorderRadiusChange={(v) => update('borderRadius', v)}
          onBorderColorChange={(v) => update('borderColor', v)}
        />
      );

    case 'greeting':
      return (
        <GreetingConfig
          text={props.text as string}
          emoji={(props.emoji as string) ?? ''}
          alignment={(props.alignment as string) ?? 'center'}
          onTextChange={(v) => update('text', v)}
          onEmojiChange={(v) => update('emoji', v)}
          onAlignmentChange={(v) => update('alignment', v)}
        />
      );

    case 'typing-animation':
      return (
        <TypingAnimationConfig
          lines={props.lines as string[]}
          color={(props.color as string) ?? ''}
          width={props.width as number | undefined}
          height={props.height as number | undefined}
          speed={props.speed as number | undefined}
          onLinesChange={(v) => update('lines', v)}
          onColorChange={(v) => update('color', v)}
          onWidthChange={(v) => update('width', v)}
          onHeightChange={(v) => update('height', v)}
          onSpeedChange={(v) => update('speed', v)}
        />
      );

    case 'heading':
      return (
        <HeadingConfig
          text={props.text as string}
          level={Number(props.level) || 1}
          emoji={(props.emoji as string) ?? ''}
          alignment={(props.alignment as string) ?? 'left'}
          onTextChange={(v) => update('text', v)}
          onLevelChange={(v) => update('level', v)}
          onEmojiChange={(v) => update('emoji', v)}
          onAlignmentChange={(v) => update('alignment', v)}
        />
      );

    case 'paragraph':
      return (
        <ParagraphConfig
          text={props.text as string}
          alignment={(props.alignment as string) ?? 'left'}
          onTextChange={(v) => update('text', v)}
          onAlignmentChange={(v) => update('alignment', v)}
        />
      );

    case 'collapsible':
      return (
        <CollapsibleConfig
          title={props.title as string}
          defaultOpen={props.defaultOpen === true}
          onTitleChange={(v) => update('title', v)}
          onDefaultOpenChange={(v) => update('defaultOpen', v)}
        />
      );

    case 'code-block':
      return (
        <CodeBlockConfig
          code={(props.code as string) ?? ''}
          language={(props.language as string) ?? ''}
          onCodeChange={(v) => update('code', v)}
          onLanguageChange={(v) => update('language', v)}
        />
      );

    case 'image':
      return (
        <ImageConfig
          url={(props.url as string) ?? ''}
          alt={(props.alt as string) ?? ''}
          width={props.width as number | undefined}
          height={props.height as number | undefined}
          borderRadius={Number(props.borderRadius) || 0}
          alignment={(props.alignment as string) ?? 'center'}
          onUrlChange={(v) => update('url', v)}
          onAltChange={(v) => update('alt', v)}
          onWidthChange={(v) => update('width', v)}
          onHeightChange={(v) => update('height', v)}
          onBorderRadiusChange={(v) => update('borderRadius', v)}
          onAlignmentChange={(v) => update('alignment', v)}
        />
      );

    case 'gif':
      return (
        <GifConfig
          url={(props.url as string) ?? ''}
          alt={(props.alt as string) ?? ''}
          width={props.width as number | undefined}
          alignment={(props.alignment as string) ?? 'center'}
          onUrlChange={(v) => update('url', v)}
          onAltChange={(v) => update('alt', v)}
          onWidthChange={(v) => update('width', v)}
          onAlignmentChange={(v) => update('alignment', v)}
        />
      );

    case 'social-badges':
      return (
        <SocialBadgesConfig
          style={(props.style as string) ?? 'flat'}
          linkedin={(props.linkedin as string) ?? ''}
          twitter={(props.twitter as string) ?? ''}
          github={(props.github as string) ?? ''}
          youtube={(props.youtube as string) ?? ''}
          instagram={(props.instagram as string) ?? ''}
          discord={(props.discord as string) ?? ''}
          email={(props.email as string) ?? ''}
          portfolio={(props.portfolio as string) ?? ''}
          onStyleChange={(v) => update('style', v)}
          onLinkedinChange={(v) => update('linkedin', v)}
          onTwitterChange={(v) => update('twitter', v)}
          onGithubChange={(v) => update('github', v)}
          onYoutubeChange={(v) => update('youtube', v)}
          onInstagramChange={(v) => update('instagram', v)}
          onDiscordChange={(v) => update('discord', v)}
          onEmailChange={(v) => update('email', v)}
          onPortfolioChange={(v) => update('portfolio', v)}
        />
      );

    case 'custom-badge':
      return (
        <CustomBadgeConfig
          label={props.label as string}
          message={props.message as string}
          color={(props.color as string) ?? ''}
          style={(props.style as string) ?? 'flat'}
          logo={(props.logo as string) ?? ''}
          onLabelChange={(v) => update('label', v)}
          onMessageChange={(v) => update('message', v)}
          onColorChange={(v) => update('color', v)}
          onStyleChange={(v) => update('style', v)}
          onLogoChange={(v) => update('logo', v)}
        />
      );

    case 'skill-icons':
      return (
        <SkillIconsConfig
          icons={props.icons as string[]}
          perLine={(props.perLine as number) ?? 10}
          theme={(props.theme as string) ?? 'dark'}
          onIconsChange={(v) => update('icons', v)}
          onPerLineChange={(v) => update('perLine', v)}
          onThemeChange={(v) => update('theme', v)}
          availableIcons={[...SKILL_ICONS]}
        />
      );

    case 'stats-card':
      return (
        <StatsCardConfig
          layoutStyle={((props.layoutStyle as string) ?? 'standard') as 'standard' | 'compact'}
          layoutWidth={(props.layoutWidth as string) ?? 'full'}
          width={(props.width as string) ?? ''}
          theme={(props.theme as string) ?? 'default'}
          showIcons={Boolean(props.showIcons)}
          hideBorder={Boolean(props.hideBorder)}
          hideTitle={Boolean(props.hideTitle)}
          hideRank={Boolean(props.hideRank)}
          borderRadius={Number(props.borderRadius) || 10}
          bgColor={props.bgColor as string | undefined}
          textColor={props.textColor as string | undefined}
          titleColor={props.titleColor as string | undefined}
          iconColor={props.iconColor as string | undefined}
          onLayoutStyleChange={(v) => update('layoutStyle', v)}
          onLayoutWidthChange={(v) => update('layoutWidth', v)}
          onWidthChange={(v) => update('width', v)}
          onThemeChange={(v) => update('theme', v)}
          onShowIconsChange={(v) => update('showIcons', v)}
          onHideBorderChange={(v) => update('hideBorder', v)}
          onHideTitleChange={(v) => update('hideTitle', v)}
          onHideRankChange={(v) => update('hideRank', v)}
          onBorderRadiusChange={(v) => update('borderRadius', v)}
          onBgColorChange={(v) => update('bgColor', v)}
          onTextColorChange={(v) => update('textColor', v)}
          onTitleColorChange={(v) => update('titleColor', v)}
          onIconColorChange={(v) => update('iconColor', v)}
        />
      );

    case 'top-languages':
      return (
        <TopLanguagesConfig
          layoutWidth={(props.layoutWidth as string) ?? 'full'}
          width={(props.width as string) ?? ''}
          theme={(props.theme as string) ?? 'default'}
          layout={(props.layout as string) ?? 'compact'}
          langs_count={Number(props.langs_count) || 8}
          hideBorder={Boolean(props.hideBorder)}
          hideProgress={Boolean(props.hideProgress)}
          bgColor={props.bgColor as string | undefined}
          textColor={props.textColor as string | undefined}
          titleColor={props.titleColor as string | undefined}
          onLayoutWidthChange={(v) => update('layoutWidth', v)}
          onWidthChange={(v) => update('width', v)}
          onThemeChange={(v) => update('theme', v)}
          onLayoutChange={(v) => update('layout', v)}
          onLangsCountChange={(v) => update('langs_count', v)}
          onHideBorderChange={(v) => update('hideBorder', v)}
          onHideProgressChange={(v) => update('hideProgress', v)}
          onBgColorChange={(v) => update('bgColor', v)}
          onTextColorChange={(v) => update('textColor', v)}
          onTitleColorChange={(v) => update('titleColor', v)}
        />
      );

    case 'streak-stats':
      return (
        <StreakStatsConfig
          layoutWidth={(props.layoutWidth as string) ?? 'full'}
          width={(props.width as string) ?? ''}
          theme={(props.theme as string) ?? 'default'}
          hideBorder={Boolean(props.hideBorder)}
          borderRadius={Number(props.borderRadius) || 10}
          bgColor={props.bgColor as string | undefined}
          fireColor={props.fireColor as string | undefined}
          ringColor={props.ringColor as string | undefined}
          currStreakColor={props.currStreakColor as string | undefined}
          sideNumColor={props.sideNumColor as string | undefined}
          sideLabelColor={props.sideLabelColor as string | undefined}
          datesColor={props.datesColor as string | undefined}
          onLayoutWidthChange={(v) => update('layoutWidth', v)}
          onWidthChange={(v) => update('width', v)}
          onThemeChange={(v) => update('theme', v)}
          onHideBorderChange={(v) => update('hideBorder', v)}
          onBorderRadiusChange={(v) => update('borderRadius', v)}
          onBgColorChange={(v) => update('bgColor', v)}
          onFireColorChange={(v) => update('fireColor', v)}
          onRingColorChange={(v) => update('ringColor', v)}
          onCurrStreakColorChange={(v) => update('currStreakColor', v)}
          onSideNumColorChange={(v) => update('sideNumColor', v)}
          onSideLabelColorChange={(v) => update('sideLabelColor', v)}
          onDatesColorChange={(v) => update('datesColor', v)}
        />
      );

    case 'activity-graph':
      return (
        <ActivityGraphConfig
          theme={String(props.theme) || 'default'}
          hideBorder={Boolean(props.hideBorder)}
          bgColor={props.bgColor as string | undefined}
          color={props.color as string | undefined}
          lineColor={props.lineColor as string | undefined}
          pointColor={props.pointColor as string | undefined}
          areaColor={props.areaColor as string | undefined}
          onThemeChange={(v) => update('theme', v)}
          onHideBorderChange={(v) => update('hideBorder', v)}
          onBgColorChange={(v) => update('bgColor', v)}
          onColorChange={(v) => update('color', v)}
          onLineColorChange={(v) => update('lineColor', v)}
          onPointColorChange={(v) => update('pointColor', v)}
          onAreaColorChange={(v) => update('areaColor', v)}
        />
      );

    case 'trophies':
      return (
        <TrophiesConfig
          theme={String(props.theme) || 'default'}
          column={Number(props.column) || 4}
          row={Number(props.row) || 2}
          noFrame={Boolean(props.noFrame)}
          noBg={Boolean(props.noBg)}
          onThemeChange={(v) => update('theme', v)}
          onColumnChange={(v) => update('column', v)}
          onRowChange={(v) => update('row', v)}
          onNoFrameChange={(v) => update('noFrame', v)}
          onNoBgChange={(v) => update('noBg', v)}
        />
      );

    case 'visitor-counter':
      return (
        <VisitorCounterConfig
          label={(props.label as string) ?? 'Visitors'}
          color={(props.color as string) ?? 'blue'}
          style={(props.style as string) ?? 'flat'}
          alignment={(props.alignment as string) ?? 'center'}
          onLabelChange={(v) => update('label', v)}
          onColorChange={(v) => update('color', v)}
          onStyleChange={(v) => update('style', v)}
          onAlignmentChange={(v) => update('alignment', v)}
        />
      );

    case 'wakatime-stats':
      return (
        <WakatimeStatsConfig
          layoutWidth={(props.layoutWidth as string) ?? 'full'}
          width={(props.width as string) ?? ''}
          username={(props.username as string) ?? ''}
          theme={(props.theme as string) ?? 'default'}
          hideBorder={Boolean(props.hideBorder)}
          hideTitle={Boolean(props.hideTitle)}
          hideRecent={Boolean(props.hideRecent)}
          hideEditors={Boolean(props.hideEditors)}
          hideLanguages={Boolean(props.hideLanguages)}
          hideOperatingSystems={Boolean(props.hideOperatingSystems)}
          borderRadius={Number(props.borderRadius) || 4}
          bgColor={props.bgColor as string | undefined}
          textColor={props.textColor as string | undefined}
          titleColor={props.titleColor as string | undefined}
          onLayoutWidthChange={(v) => update('layoutWidth', v)}
          onWidthChange={(v) => update('width', v)}
          onUsernameChange={(v) => update('username', v)}
          onThemeChange={(v) => update('theme', v)}
          onHideBorderChange={(v) => update('hideBorder', v)}
          onHideTitleChange={(v) => update('hideTitle', v)}
          onHideRecentChange={(v) => update('hideRecent', v)}
          onHideEditorsChange={(v) => update('hideEditors', v)}
          onHideLanguagesChange={(v) => update('hideLanguages', v)}
          onHideOperatingSystemsChange={(v) => update('hideOperatingSystems', v)}
          onBorderRadiusChange={(v) => update('borderRadius', v)}
          onBgColorChange={(v) => update('bgColor', v)}
          onTextColorChange={(v) => update('textColor', v)}
          onTitleColorChange={(v) => update('titleColor', v)}
        />
      );

    case 'quote':
      return (
        <QuoteConfig
          quote={(props.quote as string) ?? ''}
          author={(props.author as string) ?? ''}
          theme={(props.theme as string) ?? 'default'}
          textAlign={(props.textAlign as string) ?? 'center'}
          authorAlign={(props.authorAlign as string) ?? 'center'}
          onQuoteChange={(v) => update('quote', v)}
          onAuthorChange={(v) => update('author', v)}
          onThemeChange={(v) => update('theme', v)}
          onTextAlignChange={(v) => update('textAlign', v)}
          onAuthorAlignChange={(v) => update('authorAlign', v)}
        />
      );

    case 'footer-banner': {
      /**
       * FIXED: use the shared resolveFooterBannerColors() helper so that both
       * legacy blocks (waveColor prop) and modern blocks (bgStartColor /
       * bgEndColor props) produce correct colour values.
       *
       * Previously this case split `waveColor` on ':' which turned
       * "0:EEFF00,100:A82DAA" into ['0', 'EEFF00,100', 'A82DAA'], yielding
       * bgStartColor = "0" (not a hex) and bgEndColor = "EEFF00,100" (not a hex).
       */
      const { bgStartColor, bgEndColor } = resolveFooterBannerColors(props);

      const currentType = (props.type as string) ?? 'waving';
      const currentSection = (props.section as string) ?? 'footer';
      const currentHeight = getNumberProp('height', 120);
      const maxR = Math.floor(currentHeight / 2);

      return (
        <FooterBannerConfig
          text={(props.text as string) ?? 'Thanks for visiting!'}
          type={currentType}
          section={currentSection}
          height={currentHeight}
          fontSize={getNumberProp('fontSize', 24)}
          bgType={(props.bgType as 'solid' | 'gradient' | 'animated') ?? 'gradient'}
          bgGradientDirection={
            (props.bgGradientDirection as
              | 'horizontal'
              | 'vertical'
              | 'diagonal'
              | 'radial'
              | 'conic') ?? 'horizontal'
          }
          bgAnimation={
            (props.bgAnimation as 'none' | 'gradient' | 'pulse' | 'wave' | 'shimmer') ?? 'none'
          }
          bgStartColor={bgStartColor}
          bgEndColor={bgEndColor}
          bgSolidColor={(props.bgSolidColor as string) ?? 'EEFF00'}
          fontColor={(props.fontColor as string) ?? 'ffffff'}
          borderRadiusTL={
            props.borderRadiusTL !== undefined
              ? Math.min(Number(props.borderRadiusTL), maxR)
              : undefined
          }
          borderRadiusTR={
            props.borderRadiusTR !== undefined
              ? Math.min(Number(props.borderRadiusTR), maxR)
              : undefined
          }
          borderRadiusBR={
            props.borderRadiusBR !== undefined
              ? Math.min(Number(props.borderRadiusBR), maxR)
              : undefined
          }
          borderRadiusBL={
            props.borderRadiusBL !== undefined
              ? Math.min(Number(props.borderRadiusBL), maxR)
              : undefined
          }
          parallaxEffect={(props.parallaxEffect as boolean) ?? false}
          onTextChange={(v) => update('text', v)}
          onTypeChange={(v) => {
            update('type', v);
            update('waveColor', undefined);
          }}
          onSectionChange={(v) => update('section', v)}
          onHeightChange={(v) => {
            update('height', v);
            update('waveColor', undefined);
          }}
          onFontSizeChange={(v) => update('fontSize', v)}
          onFontColorChange={(v) => update('fontColor', v)}
          onBgTypeChange={(v) => {
            update('bgType', v);
            update('waveColor', undefined);
          }}
          onBgGradientDirectionChange={(v) => {
            update('bgGradientDirection', v);
            update('waveColor', undefined);
          }}
          onBgAnimationChange={(v) => {
            update('bgAnimation', v);
            update('waveColor', undefined);
          }}
          onBgStartColorChange={(v) => {
            update('bgStartColor', v);
            update('waveColor', undefined);
          }}
          onBgEndColorChange={(v) => {
            update('bgEndColor', v);
            update('waveColor', undefined);
          }}
          onBgSolidColorChange={(v) => {
            update('bgSolidColor', v);
            update('waveColor', undefined);
          }}
          onBorderRadiusTLChange={(v) => {
            update('borderRadiusTL', v);
            update('waveColor', undefined);
          }}
          onBorderRadiusTRChange={(v) => {
            update('borderRadiusTR', v);
            update('waveColor', undefined);
          }}
          onBorderRadiusBRChange={(v) => {
            update('borderRadiusBR', v);
            update('waveColor', undefined);
          }}
          onBorderRadiusBLChange={(v) => {
            update('borderRadiusBL', v);
            update('waveColor', undefined);
          }}
          onParallaxEffectChange={(v) => update('parallaxEffect', v)}
          wavePosition={getNumberProp('wavePosition', 70)}
          waveAmplitude={getNumberProp('waveAmplitude', 20)}
          waveSpeed={getNumberProp('waveSpeed', 20)}
          waveFlip={(props.waveFlip as boolean) ?? false}
          onWavePositionChange={(v) => update('wavePosition', v)}
          onWaveAmplitudeChange={(v) => update('waveAmplitude', v)}
          onWaveSpeedChange={(v) => update('waveSpeed', v)}
          onWaveFlipChange={(v) => update('waveFlip', v)}
          textAlignX={getNumberProp('textAlignX', 50)}
          textAlignY={getNumberProp('textAlignY', 50)}
          onTextAlignXChange={(v) => update('textAlignX', v)}
          onTextAlignYChange={(v) => update('textAlignY', v)}
        />
      );
    }

    case 'support-link':
      return (
        <SupportLinkConfig
          type={(props.type as string) ?? 'coffee'}
          url={(props.url as string) ?? ''}
          alignment={(props.alignment as string) ?? 'center'}
          onTypeChange={(v) => update('type', v)}
          onUrlChange={(v) => update('url', v)}
          onAlignmentChange={(v) => update('alignment', v)}
        />
      );

    default:
      return (
        <p className="text-sm text-muted-foreground">
          No configuration available for this block type.
        </p>
      );
  }
}
