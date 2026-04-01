'use client';

import {
  AlertTriangle,
  ChevronDown,
  Copy,
  FolderOpen,
  MoreVertical,
  Pencil,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { saveToActiveProfile, useProfileStore } from '@/lib/profiles';
import { useBuilderStore } from '@/lib/store';
import type { Profile } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ProfileManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Default profile name based on count
function getDefaultProfileName(): string {
  const profiles = useProfileStore.getState().profiles;
  const count = profiles.length + 1;
  return `Profile ${count}`;
}

function ProfileCard({
  profile,
  isActive,
  onLoad,
  onRename,
  onDuplicate,
  onDelete,
}: {
  profile: Profile;
  isActive: boolean;
  onLoad: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const blockCount = profile.blocks.length;

  return (
    <div
      className={cn(
        'group relative rounded-xl border-2 p-4 transition-all duration-200',
        isActive
          ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
          : 'border-border/60 hover:border-primary/50 hover:bg-muted/30',
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute -top-2 -right-2 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground shadow-md">
          Active
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0" onClick={onLoad}>
          <h3 className="font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors">
            {profile.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {blockCount} block{blockCount !== 1 ? 's' : ''} • {profile.username || 'No username'}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Updated {formatDate(profile.updatedAt)}
          </p>
        </div>

        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onRename();
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
                setMenuOpen(false);
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function SaveProfileDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState(() => getDefaultProfileName());

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Please enter a profile name');
      return;
    }
    onSave(name.trim());
    onOpenChange(false);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Save Profile
          </DialogTitle>
          <DialogDescription>Save your current configuration as a named profile</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label htmlFor="profile-name" className="text-sm font-medium text-foreground">
            Profile Name
          </label>
          <Input
            id="profile-name"
            value={name}
            onChange={handleNameChange}
            placeholder="My Awesome Profile"
            className="mt-2"
            onKeyDown={handleKeyDown}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Profile</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RenameDialog({
  open,
  onOpenChange,
  currentName,
  onRename,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onRename: (newName: string) => void;
}) {
  const [name, setName] = useState(currentName);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!name.trim()) {
        toast.error('Please enter a profile name');
        return;
      }
      onRename(name.trim());
      onOpenChange(false);
    }
  };

  const handleRename = () => {
    if (!name.trim()) {
      toast.error('Please enter a profile name');
      return;
    }
    onRename(name.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5" />
            Rename Profile
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <label htmlFor="rename-name" className="text-sm font-medium text-foreground">
            Profile Name
          </label>
          <Input
            id="rename-name"
            value={name}
            onChange={handleNameChange}
            className="mt-2"
            onKeyDown={handleKeyDown}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRename}>Rename</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ProfileManager({ open, onOpenChange }: ProfileManagerProps) {
  const blocks = useBuilderStore((s) => s.blocks);
  const username = useBuilderStore((s) => s.username);
  const setBlocks = useBuilderStore((s) => s.setBlocks);
  const setUsername = useBuilderStore((s) => s.setUsername);

  const profiles = useProfileStore((s) => s.profiles);
  const activeProfileId = useProfileStore((s) => s.activeProfileId);
  const createProfile = useProfileStore((s) => s.createProfile);
  const deleteProfile = useProfileStore((s) => s.deleteProfile);
  const duplicateProfile = useProfileStore((s) => s.duplicateProfile);
  const loadProfile = useProfileStore((s) => s.loadProfile);
  const renameProfile = useProfileStore((s) => s.renameProfile);

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [profileToRename, setProfileToRename] = useState<Profile | null>(null);
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);

  // Handle loading a profile
  const handleLoad = (profile: Profile) => {
    loadProfile(profile.id);
    setBlocks(profile.blocks);
    setUsername(profile.username);
    toast.success(`Loaded "${profile.name}"`);
    onOpenChange(false);
  };

  // Handle saving a new profile
  const handleSave = (name: string) => {
    createProfile(name, blocks, username);
    toast.success(`Profile "${name}" saved`);
  };

  // Handle updating active profile
  const handleUpdateActive = () => {
    const active = profiles.find((p) => p.id === activeProfileId);
    if (active) {
      saveToActiveProfile(blocks, username);
      toast.success(`"${active.name}" updated`);
    } else {
      // No active profile, show save dialog
      setShowSaveDialog(true);
    }
  };

  // Handle profile actions
  const handleRename = (profile: Profile) => {
    setProfileToRename(profile);
    setShowRenameDialog(true);
  };

  const handleDuplicate = (profile: Profile) => {
    duplicateProfile(profile.id);
  };

  const handleDelete = (profile: Profile) => {
    setProfileToDelete(profile);
  };

  const confirmDelete = () => {
    if (profileToDelete) {
      deleteProfile(profileToDelete.id);
      setProfileToDelete(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Profile Manager
            </DialogTitle>
            <DialogDescription>
              Save, load, and manage your profile configurations
            </DialogDescription>
          </DialogHeader>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowSaveDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Profile
            </Button>
            {activeProfileId && (
              <Button variant="outline" className="flex-1" onClick={handleUpdateActive}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div>

          {/* Profile list */}
          <ScrollArea className="h-[40vh] pr-4">
            {profiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No profiles yet</p>
                <p className="text-sm mt-1">Save your current configuration as a new profile</p>
              </div>
            ) : (
              <div className="space-y-3">
                {profiles.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    isActive={profile.id === activeProfileId}
                    onLoad={() => handleLoad(profile)}
                    onRename={() => handleRename(profile)}
                    onDuplicate={() => handleDuplicate(profile)}
                    onDelete={() => handleDelete(profile)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Keyboard shortcuts hint */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Press <kbd className="bg-muted px-1.5 py-0.5 rounded">Ctrl</kbd> +{' '}
            <kbd className="bg-muted px-1.5 py-0.5 rounded">1-9</kbd> to quickly switch profiles
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Profile Dialog */}
      <SaveProfileDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onSave={handleSave}
      />

      {/* Rename Dialog */}
      {profileToRename && (
        <RenameDialog
          open={showRenameDialog}
          onOpenChange={setShowRenameDialog}
          currentName={profileToRename.name}
          onRename={(newName) => renameProfile(profileToRename.id, newName)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!profileToDelete}
        onOpenChange={(open) => {
          if (!open) setProfileToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Profile?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{profileToDelete?.name}&rdquo;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Profile selector dropdown for header
export function ProfileSelector() {
  const profiles = useProfileStore((s) => s.profiles);
  const activeProfileId = useProfileStore((s) => s.activeProfileId);
  const loadProfile = useProfileStore((s) => s.loadProfile);

  const setBlocks = useBuilderStore((s) => s.setBlocks);
  const setUsername = useBuilderStore((s) => s.setUsername);

  const [open, setOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);

  // Find active profile from the profiles array
  const activeProfile = activeProfileId ? profiles.find((p) => p.id === activeProfileId) : null;

  const handleSelect = (profile: Profile) => {
    loadProfile(profile.id);
    setBlocks(profile.blocks);
    setUsername(profile.username);
    toast.success(`Switched to "${profile.name}"`);
    setOpen(false);
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {activeProfile ? (
              <>
                <span className="max-w-[100px] truncate">{activeProfile.name}</span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </>
            ) : (
              <>
                <FolderOpen className="w-4 h-4" />
                <span>Profiles</span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {profiles.length === 0 ? (
            <DropdownMenuItem disabled className="text-muted-foreground">
              No profiles saved
            </DropdownMenuItem>
          ) : (
            profiles.map((profile, index) => (
              <DropdownMenuItem
                key={profile.id}
                onClick={() => handleSelect(profile)}
                className="flex items-center gap-2"
              >
                <span className="flex items-center justify-center w-5 h-5 rounded bg-muted text-xs font-medium">
                  {index + 1}
                </span>
                <span className="flex-1 truncate">{profile.name}</span>
                {profile.id === activeProfileId && (
                  <span className="text-xs text-primary">Active</span>
                )}
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setManagerOpen(true)}>
            <FolderOpen className="mr-2 h-4 w-4" />
            Manage Profiles
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileManager open={managerOpen} onOpenChange={setManagerOpen} />
    </>
  );
}
