/**
 * Avatar Component Examples
 *
 * Demonstration of all Avatar component variants and use cases.
 * Copy these examples to use in your app.
 */

import { Avatar, AvatarGroup, UserDisplay } from "./index";
import { User, Shield, Crown } from "lucide-react";

/**
 * Basic Avatar Examples
 */
export function BasicAvatarExamples() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Sizes</h3>
        <div className="flex items-end gap-4">
          <Avatar
            src="https://i.pravatar.cc/150?img=1"
            name="John Doe"
            size="xs"
          />
          <Avatar
            src="https://i.pravatar.cc/150?img=2"
            name="Jane Smith"
            size="sm"
          />
          <Avatar
            src="https://i.pravatar.cc/150?img=3"
            name="Bob Johnson"
            size="md"
          />
          <Avatar
            src="https://i.pravatar.cc/150?img=4"
            name="Alice Williams"
            size="lg"
          />
          <Avatar
            src="https://i.pravatar.cc/150?img=5"
            name="Charlie Brown"
            size="xl"
          />
          <Avatar
            src="https://i.pravatar.cc/150?img=6"
            name="Diana Prince"
            size="2xl"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Shapes</h3>
        <div className="flex items-center gap-4">
          <Avatar
            src="https://i.pravatar.cc/150?img=7"
            name="Circle Avatar"
            shape="circle"
            size="lg"
          />
          <Avatar
            src="https://i.pravatar.cc/150?img=8"
            name="Rounded Avatar"
            shape="rounded"
            size="lg"
          />
          <Avatar
            src="https://i.pravatar.cc/150?img=9"
            name="Square Avatar"
            shape="square"
            size="lg"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">With Border</h3>
        <div className="flex items-center gap-4">
          <Avatar
            src="https://i.pravatar.cc/150?img=10"
            name="Bordered Avatar"
            size="lg"
            border
          />
          <Avatar name="No Image" size="lg" border />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Status Indicators</h3>
        <div className="flex items-center gap-4">
          <Avatar
            src="https://i.pravatar.cc/150?img=11"
            name="Online User"
            status="online"
            size="lg"
          />
          <Avatar
            src="https://i.pravatar.cc/150?img=12"
            name="Offline User"
            status="offline"
            size="lg"
          />
          <Avatar
            src="https://i.pravatar.cc/150?img=13"
            name="Busy User"
            status="busy"
            size="lg"
          />
          <Avatar
            src="https://i.pravatar.cc/150?img=14"
            name="Away User"
            status="away"
            size="lg"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Initials Fallback</h3>
        <div className="flex items-center gap-4">
          <Avatar name="John Doe" size="lg" />
          <Avatar name="Jane Smith" size="lg" />
          <Avatar name="Bob" size="lg" />
          <Avatar name="A" size="lg" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Custom Fallback</h3>
        <div className="flex items-center gap-4">
          <Avatar fallback={<User className="h-6 w-6" />} size="lg" />
          <Avatar fallback={<Shield className="h-6 w-6" />} size="lg" />
          <Avatar fallback={<Crown className="h-6 w-6" />} size="lg" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Loading State</h3>
        <div className="flex items-center gap-4">
          <Avatar name="Loading User" size="lg" loading />
          <Avatar
            src="https://i.pravatar.cc/150?img=15"
            name="Loading with Image"
            size="lg"
            loading
          />
        </div>
      </div>
    </div>
  );
}

/**
 * AvatarGroup Examples
 */
export function AvatarGroupExamples() {
  const users = [
    { src: "https://i.pravatar.cc/150?img=1", name: "John Doe" },
    { src: "https://i.pravatar.cc/150?img=2", name: "Jane Smith" },
    { src: "https://i.pravatar.cc/150?img=3", name: "Bob Johnson" },
    { src: "https://i.pravatar.cc/150?img=4", name: "Alice Williams" },
    { src: "https://i.pravatar.cc/150?img=5", name: "Charlie Brown" },
    { src: "https://i.pravatar.cc/150?img=6", name: "Diana Prince" },
  ];

  return (
    <div className="space-y-8 p-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Group</h3>
        <AvatarGroup avatars={users.slice(0, 3)} size="md" />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">With Overflow</h3>
        <AvatarGroup avatars={users} max={4} size="md" />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Spacing Variants</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-ink-600 mb-2">Tight</p>
            <AvatarGroup avatars={users} max={5} spacing="tight" />
          </div>
          <div>
            <p className="text-sm text-ink-600 mb-2">Normal</p>
            <AvatarGroup avatars={users} max={5} spacing="normal" />
          </div>
          <div>
            <p className="text-sm text-ink-600 mb-2">Loose</p>
            <AvatarGroup avatars={users} max={5} spacing="loose" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Different Sizes</h3>
        <div className="space-y-4">
          <AvatarGroup avatars={users} max={4} size="xs" />
          <AvatarGroup avatars={users} max={4} size="sm" />
          <AvatarGroup avatars={users} max={4} size="md" />
          <AvatarGroup avatars={users} max={4} size="lg" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">With Click Handler</h3>
        <AvatarGroup
          avatars={users}
          max={3}
          size="md"
          onOverflowClick={() => alert("Show all members!")}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">With Status</h3>
        <AvatarGroup
          avatars={[
            { ...users[0], status: "online" },
            { ...users[1], status: "away" },
            { ...users[2], status: "busy" },
            { ...users[3], status: "offline" },
          ]}
          max={5}
          size="lg"
        />
      </div>
    </div>
  );
}

/**
 * UserDisplay Examples
 */
export function UserDisplayExamples() {
  const user = {
    name: "John Doe",
    email: "john@example.com",
    photoURL: "https://i.pravatar.cc/150?img=1",
  };

  return (
    <div className="space-y-8 p-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic</h3>
        <UserDisplay user={user} />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">With Email</h3>
        <UserDisplay user={user} showEmail />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">With Subtitle</h3>
        <UserDisplay user={user} subtitle="Administrator" />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Sizes</h3>
        <div className="space-y-4">
          <UserDisplay user={user} size="sm" showEmail />
          <UserDisplay user={user} size="md" showEmail />
          <UserDisplay user={user} size="lg" showEmail />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">With Status</h3>
        <UserDisplay user={user} status="online" showEmail />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Interactive</h3>
        <UserDisplay
          user={user}
          showEmail
          interactive
          onClick={() => alert("User clicked!")}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Centered</h3>
        <UserDisplay user={user} showEmail align="center" />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Without Image</h3>
        <UserDisplay
          user={{ name: "Jane Smith", email: "jane@example.com" }}
          showEmail
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">In a Card</h3>
        <div className="bg-[rgb(var(--color-surface-card))] rounded-xl border border-[rgb(var(--color-outline-subtle))] p-4">
          <UserDisplay
            user={user}
            subtitle="Last seen 5 minutes ago"
            size="lg"
            status="online"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Real-World Examples
 */
export function RealWorldExamples() {
  return (
    <div className="space-y-12 p-8">
      {/* Comment/Activity Feed */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Comment Feed</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex gap-3 bg-[rgb(var(--color-surface-card))] rounded-xl border border-[rgb(var(--color-outline-subtle))] p-4"
            >
              <Avatar
                src={`https://i.pravatar.cc/150?img=${i}`}
                name={`User ${i}`}
                size="sm"
              />
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-sm">User {i}</span>
                  <span className="text-xs text-[rgb(var(--color-ink-600))]">
                    2 hours ago
                  </span>
                </div>
                <p className="text-sm text-[rgb(var(--color-ink-700))] mt-1">
                  This is a sample comment to demonstrate avatar usage in a
                  comment feed.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Members List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Team Members</h3>
        <div className="bg-[rgb(var(--color-surface-card))] rounded-xl border border-[rgb(var(--color-outline-subtle))] divide-y divide-[rgb(var(--color-outline-subtle))]">
          {[
            { name: "John Doe", role: "Admin", status: "online" as const },
            { name: "Jane Smith", role: "Editor", status: "away" as const },
            { name: "Bob Johnson", role: "Viewer", status: "offline" as const },
          ].map((member, i) => (
            <div key={i} className="p-4 hover:bg-[rgb(var(--color-surface-muted))] transition-colors">
              <UserDisplay
                user={{
                  name: member.name,
                  photoURL: `https://i.pravatar.cc/150?img=${i + 10}`,
                }}
                subtitle={member.role}
                status={member.status}
                interactive
              />
            </div>
          ))}
        </div>
      </div>

      {/* Profile Header */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Profile Header</h3>
        <div className="bg-[rgb(var(--color-surface-card))] rounded-xl border border-[rgb(var(--color-outline-subtle))] p-6">
          <div className="flex items-start gap-4">
            <Avatar
              src="https://i.pravatar.cc/150?img=20"
              name="Sarah Connor"
              size="2xl"
              border
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Sarah Connor</h2>
              <p className="text-[rgb(var(--color-ink-600))]">
                sarah@example.com
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-[rgb(var(--color-ink-600))]">
                  Status:
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-green-500">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Leaderboard</h3>
        <div className="bg-[rgb(var(--color-surface-card))] rounded-xl border border-[rgb(var(--color-outline-subtle))] divide-y divide-[rgb(var(--color-outline-subtle))]">
          {[
            { name: "Alice Wonder", points: 1250 },
            { name: "Bob Builder", points: 980 },
            { name: "Charlie Chaplin", points: 875 },
          ].map((leader, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <span className="text-2xl font-bold w-8">#{i + 1}</span>
              <Avatar
                src={`https://i.pravatar.cc/150?img=${i + 30}`}
                name={leader.name}
                size="md"
                border
              />
              <div className="flex-1">
                <p className="font-semibold">{leader.name}</p>
                <p className="text-sm text-[rgb(var(--color-ink-600))]">
                  {leader.points} points
                </p>
              </div>
              {i === 0 && (
                <Crown className="h-6 w-6 text-yellow-500" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
