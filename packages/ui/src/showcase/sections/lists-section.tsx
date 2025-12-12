'use client';

import { FileText, Star, Settings, User, Inbox } from 'lucide-react';
import { ListItem } from '../../components/lists/list-item';
import { EmptyState } from '../../components/lists/empty-state';

export function ListsSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Lists</h2>
        <p className="text-muted-foreground mb-6">
          List items with various states, variants, and features for building rich list interfaces.
        </p>
      </div>

      {/* ListItem Variants */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-3">ListItem Variants</h3>
          <div className="space-y-3">
            <ListItem
              title="Default Variant"
              subtitle="Standard padding and sizing for most use cases"
              icon={FileText}
              variant="default"
            />
            <ListItem
              title="Compact Variant"
              subtitle="Reduced padding for dense lists"
              icon={FileText}
              variant="compact"
            />
            <ListItem
              title="Detailed Variant"
              subtitle="Increased padding for more prominent list items"
              icon={FileText}
              variant="detailed"
            />
          </div>
        </div>
      </div>

      {/* ListItem States */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-3">ListItem States</h3>
          <div className="space-y-3">
            <ListItem
              title="Normal State"
              subtitle="Default interactive list item"
              icon={Star}
              onClick={() => console.log('Clicked')}
            />
            <ListItem
              title="Selected State"
              subtitle="Currently active or selected item"
              icon={Star}
              selected
            />
            <ListItem
              title="Disabled State"
              subtitle="Non-interactive list item"
              icon={Star}
              disabled
            />
          </div>
        </div>
      </div>

      {/* ListItem Features */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-3">ListItem Features</h3>
          <div className="space-y-3">
            <ListItem
              title="With Icon"
              subtitle="List item with leading icon"
              icon={Settings}
            />
            <ListItem
              title="With Subtitle"
              subtitle="Secondary text provides additional context"
              icon={User}
            />
            <ListItem
              title="With Trailing Element"
              subtitle="Badge or action on the right side"
              icon={Inbox}
              trailing={
                <span className="inline-flex items-center justify-center rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  New
                </span>
              }
            />
            <ListItem
              title="With Multiple Features"
              subtitle="Icon, subtitle, and trailing badge combined"
              icon={FileText}
              trailing={
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">2 min ago</span>
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* EmptyState */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-3">EmptyState</h3>
          <div className="space-y-4">
            <EmptyState
              title="No items found"
              description="Try adjusting your search or filter to find what you're looking for."
              icon={Inbox}
              variant="default"
            />
            <EmptyState
              title="Start creating content"
              description="Click the button below to create your first item."
              icon={FileText}
              variant="default"
              action={{
                label: 'Create Item',
                onClick: () => console.log('Create clicked'),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
