'use client';

import { generateId } from '@/lib/store';
import { SKILL_ICONS, type Block } from '@/lib/types';

import { ActivityGraphConfig } from './blocks/activity-graph-config';
import { AvatarConfig } from './blocks/avatar-config';
import { CapsuleHeaderConfig } from './blocks/capsule-header-config';
import { CodeBlockConfig } from './blocks/code-block-config';
import { CollapsibleConfig } from './blocks/collapsible-config';
import { ContainerConfig } from './blocks/container-config';
import { CustomBadgeConfig } from './blocks/custom-badge-config';
import { DividerConfig } from './blocks/divider-config';
import { FooterBannerConfig } from './blocks/footer-banner-config';
import { GifConfig } from './blocks/gif-config';
import { GreetingConfig } from './blocks/greeting-config';
import { HeadingConfig } from './blocks/heading-config';
import { ImageConfig } from './blocks/image-config';
import { ParagraphConfig } from './blocks/paragraph-config';
import { QuoteConfig } from './blocks/quote-config';
import { SkillIconsConfig } from './blocks/skill-icons-config';
import { SocialBadgesConfig } from './blocks/social-badges-config';
import { SpacerConfig } from './blocks/spacer-config';
import { StatsCardConfig } from './blocks/stats-card-config';
import { StatsRowConfig } from './blocks/stats-row-config';
import { StreakStatsConfig } from './blocks/streak-stats-config';
import { TopLanguagesConfig } from './blocks/top-languages-config';
import { TrophiesConfig } from './blocks/trophies-config';
import { TypingAnimationConfig } from './blocks/typing-animation-config';
import { VisitorCounterConfig } from './blocks/visitor-counter-config';

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
    case 'container':
      return (
        <ContainerConfig
          alignment={(props.alignment as string) ?? 'center'}
          direction={(props.direction as string) ?? 'column'}
          gap={(props.gap as number) ?? 16}
          onAlignmentChange={(v) => update('alignment', v)}
          onDirectionChange={(v) => update('direction', v)}
          onGapChange={(v) => update('gap', v)}
        />
      );

    case 'stats-row': {
      const statsChildren =
        block.children?.filter((child): child is Block & { type: StatsChildType } =>
          statsChildTypes.includes(child.type as StatsChildType),
        ) ?? [];

      const updateCardProps = (slotIndex: 0 | 1, updates: Record<string, unknown>) => {
        const nextSlots: Array<Block | undefined> = [statsChildren[0], statsChildren[1]];
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
          theme={(props.theme as string) ?? 'tokyonight'}
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
            // Apply theme to both cards using updateCardProps
            if (statsChildren[0]) {
              updateCardProps(0, { theme: v });
            }
            if (statsChildren[1]) {
              updateCardProps(1, { theme: v });
            }
          }}
          onHideBorderChange={(v) => {
            update('hideBorder', v);
            // Apply hideBorder to both cards using updateCardProps
            if (statsChildren[0]) {
              updateCardProps(0, { hideBorder: v });
            }
            if (statsChildren[1]) {
              updateCardProps(1, { hideBorder: v });
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
          onTypeChange={(v) => update('type', v)}
          onGifUrlChange={(v) => update('gifUrl', v)}
        />
      );

    case 'spacer':
      return (
        <SpacerConfig
          height={(props.height as number) ?? 20}
          onHeightChange={(v) => update('height', v)}
        />
      );

    case 'capsule-header':
      return (
        <CapsuleHeaderConfig
          text={props.text as string}
          type={(props.type as string) ?? 'waving'}
          section={(props.section as string) ?? 'header'}
          color={(props.color as string) ?? ''}
          height={getNumberProp('height', 200)}
          onTextChange={(v) => update('text', v)}
          onTypeChange={(v) => update('type', v)}
          onSectionChange={(v) => update('section', v)}
          onColorChange={(v) => update('color', v)}
          onHeightChange={(v) => update('height', v)}
        />
      );

    case 'avatar':
      return (
        <AvatarConfig
          imageUrl={(props.imageUrl as string) ?? ''}
          size={getNumberProp('size', 150)}
          borderRadius={getNumberProp('borderRadius', 50)}
          onImageUrlChange={(v) => update('imageUrl', v)}
          onSizeChange={(v) => update('size', v)}
          onBorderRadiusChange={(v) => update('borderRadius', v)}
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
          onLinesChange={(v) => update('lines', v)}
          onColorChange={(v) => update('color', v)}
          onWidthChange={(v) => update('width', v)}
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
          onLayoutStyleChange={(v) => update('layoutStyle', v)}
          onLayoutWidthChange={(v) => update('layoutWidth', v)}
          onWidthChange={(v) => update('width', v)}
          onThemeChange={(v) => update('theme', v)}
          onShowIconsChange={(v) => update('showIcons', v)}
          onHideBorderChange={(v) => update('hideBorder', v)}
          onHideTitleChange={(v) => update('hideTitle', v)}
          onHideRankChange={(v) => update('hideRank', v)}
          onBorderRadiusChange={(v) => update('borderRadius', v)}
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
          onLayoutWidthChange={(v) => update('layoutWidth', v)}
          onWidthChange={(v) => update('width', v)}
          onThemeChange={(v) => update('theme', v)}
          onLayoutChange={(v) => update('layout', v)}
          onLangsCountChange={(v) => update('langs_count', v)}
          onHideBorderChange={(v) => update('hideBorder', v)}
          onHideProgressChange={(v) => update('hideProgress', v)}
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
          onLayoutWidthChange={(v) => update('layoutWidth', v)}
          onWidthChange={(v) => update('width', v)}
          onThemeChange={(v) => update('theme', v)}
          onHideBorderChange={(v) => update('hideBorder', v)}
          onBorderRadiusChange={(v) => update('borderRadius', v)}
        />
      );

    case 'activity-graph':
      return (
        <ActivityGraphConfig
          theme={(props.theme as string) ?? 'default'}
          hideBorder={Boolean(props.hideBorder)}
          onThemeChange={(v) => update('theme', v)}
          onHideBorderChange={(v) => update('hideBorder', v)}
        />
      );

    case 'trophies':
      return (
        <TrophiesConfig
          theme={(props.theme as string) ?? 'default'}
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
          onLabelChange={(v) => update('label', v)}
          onColorChange={(v) => update('color', v)}
          onStyleChange={(v) => update('style', v)}
        />
      );

    case 'quote':
      return (
        <QuoteConfig
          quote={(props.quote as string) ?? ''}
          author={(props.author as string) ?? ''}
          theme={(props.theme as string) ?? 'default'}
          type={(props.type as string) ?? 'default'}
          onQuoteChange={(v) => update('quote', v)}
          onAuthorChange={(v) => update('author', v)}
          onThemeChange={(v) => update('theme', v)}
          onTypeChange={(v) => update('type', v)}
        />
      );

    case 'footer-banner':
      return (
        <FooterBannerConfig
          text={(props.text as string) ?? 'Thanks for visiting!'}
          waveColor={(props.waveColor as string) ?? ''}
          fontColor={(props.fontColor as string) ?? ''}
          height={Number(props.height) || 80}
          onTextChange={(v) => update('text', v)}
          onWaveColorChange={(v) => update('waveColor', v)}
          onFontColorChange={(v) => update('fontColor', v)}
          onHeightChange={(v) => update('height', v)}
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
