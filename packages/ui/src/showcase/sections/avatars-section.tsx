'use client';

import { Avatar } from '../../components/avatar/avatar';
import { AvatarGroup } from '../../components/avatar/avatar-group';

export function AvatarsSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Avatars</h2>
        <p className="text-muted-foreground mb-6">
          User avatars with images, initials fallback, status indicators, and grouping.
        </p>
      </div>

      {/* Avatar Sizes */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-3">Avatar Sizes</h3>
          <div className="flex items-end gap-4 flex-wrap">
            <div className="flex flex-col items-center gap-2">
              <Avatar
                src="https://i.pravatar.cc/150?img=1"
                name="Extra Small"
                size="xs"
              />
              <span className="text-xs text-muted-foreground">xs</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar
                src="https://i.pravatar.cc/150?img=2"
                name="Small"
                size="sm"
              />
              <span className="text-xs text-muted-foreground">sm</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar
                src="https://i.pravatar.cc/150?img=3"
                name="Medium"
                size="md"
              />
              <span className="text-xs text-muted-foreground">md</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar
                src="https://i.pravatar.cc/150?img=4"
                name="Large"
                size="lg"
              />
              <span className="text-xs text-muted-foreground">lg</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar
                src="https://i.pravatar.cc/150?img=5"
                name="Extra Large"
                size="xl"
              />
              <span className="text-xs text-muted-foreground">xl</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar
                src="https://i.pravatar.cc/150?img=6"
                name="2X Large"
                size="2xl"
              />
              <span className="text-xs text-muted-foreground">2xl</span>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Shapes */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-3">Avatar Shapes</h3>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex flex-col items-center gap-2">
              <Avatar
                src="https://i.pravatar.cc/150?img=7"
                name="Circle Shape"
                size="lg"
                shape="circle"
              />
              <span className="text-xs text-muted-foreground">circle</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar
                src="https://i.pravatar.cc/150?img=8"
                name="Square Shape"
                size="lg"
                shape="square"
              />
              <span className="text-xs text-muted-foreground">square</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar
                src="https://i.pravatar.cc/150?img=9"
                name="Rounded Shape"
                size="lg"
                shape="rounded"
              />
              <span className="text-xs text-muted-foreground">rounded</span>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Content */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-3">Avatar Content</h3>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex flex-col items-center gap-2">
              <Avatar
                src="https://i.pravatar.cc/150?img=10"
                name="John Doe"
                size="lg"
              />
              <span className="text-xs text-muted-foreground">With Image</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar name="Jane Smith" size="lg" />
              <span className="text-xs text-muted-foreground">
                Initials Fallback
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar name="Bob Johnson" size="lg" />
              <span className="text-xs text-muted-foreground">
                Two-Word Name
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar name="Alice" size="lg" />
              <span className="text-xs text-muted-foreground">
                Single-Word Name
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Status */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-3">Avatar Status</h3>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex flex-col items-center gap-2">
              <Avatar
                src="https://i.pravatar.cc/150?img=11"
                name="Online User"
                size="lg"
                status="online"
              />
              <span className="text-xs text-muted-foreground">online</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar
                src="https://i.pravatar.cc/150?img=12"
                name="Offline User"
                size="lg"
                status="offline"
              />
              <span className="text-xs text-muted-foreground">offline</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar
                src="https://i.pravatar.cc/150?img=13"
                name="Busy User"
                size="lg"
                status="busy"
              />
              <span className="text-xs text-muted-foreground">busy</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar
                src="https://i.pravatar.cc/150?img=14"
                name="Away User"
                size="lg"
                status="away"
              />
              <span className="text-xs text-muted-foreground">away</span>
            </div>
          </div>
        </div>
      </div>

      {/* AvatarGroup */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-3">AvatarGroup</h3>
          <div className="space-y-6">
            <div className="flex flex-col gap-3">
              <span className="text-sm text-muted-foreground">
                Group of 4 avatars
              </span>
              <AvatarGroup
                avatars={[
                  {
                    src: 'https://i.pravatar.cc/150?img=15',
                    name: 'User One',
                  },
                  {
                    src: 'https://i.pravatar.cc/150?img=16',
                    name: 'User Two',
                  },
                  {
                    src: 'https://i.pravatar.cc/150?img=17',
                    name: 'User Three',
                  },
                  {
                    src: 'https://i.pravatar.cc/150?img=18',
                    name: 'User Four',
                  },
                ]}
                size="md"
              />
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-sm text-muted-foreground">
                Group with overflow (5+ members)
              </span>
              <AvatarGroup
                avatars={[
                  {
                    src: 'https://i.pravatar.cc/150?img=19',
                    name: 'User One',
                  },
                  {
                    src: 'https://i.pravatar.cc/150?img=20',
                    name: 'User Two',
                  },
                  {
                    src: 'https://i.pravatar.cc/150?img=21',
                    name: 'User Three',
                  },
                  { name: 'User Four' },
                  { name: 'User Five' },
                  { name: 'User Six' },
                  { name: 'User Seven' },
                ]}
                max={4}
                size="md"
              />
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-sm text-muted-foreground">
                Large group with initials
              </span>
              <AvatarGroup
                avatars={[
                  { name: 'Alice Johnson' },
                  { name: 'Bob Smith' },
                  { name: 'Carol Williams' },
                  { name: 'David Brown' },
                  { name: 'Emma Davis' },
                ]}
                size="lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
