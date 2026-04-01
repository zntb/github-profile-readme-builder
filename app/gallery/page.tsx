'use client';

import { ArrowUpDown, Eye, Grid3X3, Heart, List, Search, Sparkles, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { CommunityProfile } from '@/lib/types';

type SortOption = 'recent' | 'popular' | 'most-liked' | 'most-favorited';

interface GalleryResponse {
  profiles: CommunityProfile[];
  total: number;
  offset: number;
  limit: number;
}

export default function GalleryPage() {
  const [profiles, setProfiles] = useState<CommunityProfile[]>([]);
  const [featuredProfiles, setFeaturedProfiles] = useState<CommunityProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [userInteractions, setUserInteractions] = useState<
    Map<string, { liked: boolean; favorited: boolean }>
  >(new Map());
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gallery-user-id');
      if (stored) {
        setUserId(stored);
      } else {
        const newId = `user-${Date.now()}`;
        localStorage.setItem('gallery-user-id', newId);
        setUserId(newId);
      }
    }
  }, []);

  // Fetch profiles from API
  const fetchProfiles = async (sort: SortOption = 'recent', featured: boolean = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sort,
        limit: '20',
        offset: '0',
      });

      if (featured) {
        params.set('featured', 'true');
      }

      const response = await fetch(`/api/gallery?${params}`);
      const data: GalleryResponse = await response.json();

      if (featured) {
        setFeaturedProfiles(data.profiles);
      } else {
        setProfiles(data.profiles);
      }
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user interactions for profiles
  const fetchUserInteractions = async (profileIds: string[], currentUserId: string) => {
    const interactions = new Map<string, { liked: boolean; favorited: boolean }>();

    await Promise.all(
      profileIds.map(async (profileId) => {
        try {
          const response = await fetch(`/api/gallery/${profileId}/like?userId=${currentUserId}`);
          const data = await response.json();
          interactions.set(profileId, data);
        } catch {
          interactions.set(profileId, { liked: false, favorited: false });
        }
      }),
    );

    setUserInteractions(interactions);
  };

  // Handle like/favorite
  const handleInteraction = async (profileId: string, type: 'like' | 'favorite') => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/gallery/${profileId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, userId }),
      });

      const data = await response.json();

      const currentInteraction = userInteractions.get(profileId) || {
        liked: false,
        favorited: false,
      };

      setUserInteractions((prev) => {
        const newInteractions = new Map(prev);
        newInteractions.set(profileId, data);
        return newInteractions;
      });

      // Update the profile's like/favorite count locally
      setProfiles((prev) =>
        prev.map((p) => {
          if (p.id === profileId) {
            let likes = p.likes;
            let favorites = p.favorites;

            if (type === 'like') {
              likes = currentInteraction.liked ? likes - 1 : likes + 1;
            } else {
              favorites = currentInteraction.favorited ? favorites - 1 : favorites + 1;
            }

            return { ...p, likes, favorites };
          }
          return p;
        }),
      );

      toast.success(
        type === 'like'
          ? data.liked
            ? 'Liked!'
            : 'Removed like'
          : data.favorited
            ? 'Added to favorites!'
            : 'Removed from favorites',
      );
    } catch (error) {
      console.error('Failed to update interaction:', error);
      toast.error('Failed to update');
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProfiles('recent', false);
    fetchProfiles('recent', true);
  }, []);

  // Fetch interactions when profiles and userId are loaded
  useEffect(() => {
    if (profiles.length > 0 && userId) {
      fetchUserInteractions(
        profiles.map((p) => p.id),
        userId,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles.length, userId]);

  // Filter profiles by search query
  const filteredProfiles = profiles.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Render profile card
  const renderProfileCard = (profile: CommunityProfile, isFeatured: boolean = false) => {
    const interaction = userInteractions.get(profile.id) || { liked: false, favorited: false };

    return (
      <Card
        key={profile.id}
        className={`group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${isFeatured ? 'border-primary/50' : ''}`}
      >
        {/* Preview Area */}
        <div className="relative h-32 bg-gradient-to-br from-muted/50 to-muted/30 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarUrl}
                    alt={profile.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-bold text-primary-foreground">
                    {profile.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">@{profile.username}</p>
            </div>
          </div>

          {isFeatured && (
            <Badge className="absolute top-2 right-2 bg-primary/90 hover:bg-primary/90">
              <Sparkles className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>

        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base font-semibold line-clamp-1">{profile.name}</CardTitle>
          <CardDescription className="text-xs">
            {profile.blocks.length} blocks · Created{' '}
            {new Date(profile.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <div className="flex flex-wrap gap-1 mt-2">
            {profile.blocks.slice(0, 3).map((block) => (
              <Badge key={block.id} variant="secondary" className="text-[10px] px-2 py-0">
                {block.type}
              </Badge>
            ))}
            {profile.blocks.length > 3 && (
              <Badge variant="outline" className="text-[10px] px-2 py-0">
                +{profile.blocks.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {profile.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Heart
                className={`w-3.5 h-3.5 ${interaction.liked ? 'fill-red-500 text-red-500' : ''}`}
              />
              {profile.likes}
            </span>
            <span className="flex items-center gap-1">
              <Star
                className={`w-3.5 h-3.5 ${interaction.favorited ? 'fill-yellow-500 text-yellow-500' : ''}`}
              />
              {profile.favorites}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 transition-colors ${interaction.liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
              onClick={() => handleInteraction(profile.id, 'like')}
              title={interaction.liked ? 'Remove like' : 'Like'}
            >
              <Heart className={`w-4 h-4 ${interaction.liked ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 transition-colors ${interaction.favorited ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'}`}
              onClick={() => handleInteraction(profile.id, 'favorite')}
              title={interaction.favorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-4 h-4 ${interaction.favorited ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  };

  // Render loading skeleton
  const renderSkeleton = (key: number) => (
    <Card key={key} className="overflow-hidden">
      <Skeleton className="h-32" />
      <CardHeader className="p-4">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex gap-1 mt-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2">
        <Skeleton className="h-4 w-20" />
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Community Gallery</h1>
              <p className="text-muted-foreground text-sm">
                Discover inspiring GitHub profiles from the community
              </p>
            </div>
            <Button className="shrink-0">
              <Sparkles className="w-4 h-4 mr-2" />
              Submit Your Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Featured Section */}
        {(loading || featuredProfiles.length > 0) && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Featured Profiles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {loading
                ? Array.from({ length: 5 }, (_, i) => renderSkeleton(i))
                : featuredProfiles.map((profile) => renderProfileCard(profile, true))}
            </div>
          </section>
        )}

        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search profiles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-[280px]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value as SortOption);
                fetchProfiles(value as SortOption);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Viewed</SelectItem>
                <SelectItem value="most-liked">Most Liked</SelectItem>
                <SelectItem value="most-favorited">Most Favorited</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center border border-border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-9 w-9 rounded-r-none"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-9 w-9 rounded-l-none"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Profiles Grid */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            All Profiles
            <span className="text-muted-foreground text-sm font-normal ml-2">
              ({filteredProfiles.length} profiles)
            </span>
          </h2>

          {loading ? (
            <div
              className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}
            >
              {Array.from({ length: 8 }, (_, i) => renderSkeleton(i))}
            </div>
          ) : filteredProfiles.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg">No profiles found</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  {searchQuery
                    ? `No profiles match "${searchQuery}". Try a different search term.`
                    : 'Be the first to submit your profile to the community!'}
                </p>
              </div>
            </Card>
          ) : (
            <div
              className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}
            >
              {filteredProfiles.map((profile) => renderProfileCard(profile))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
