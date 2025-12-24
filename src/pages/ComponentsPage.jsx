import { useState } from 'react';
import { Plus, Trash2, Settings, Search } from 'lucide-react';
import { 
  Button, 
  Modal, 
  Popover, 
  Badge, 
  Toggle, 
  Input, 
  SearchInput,
  Skeleton,
  Tooltip
} from '../components/ui';

export default function ComponentsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [toggleValue, setToggleValue] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12">
      <h1 className="font-serif text-3xl text-ink-900">Component Library</h1>

      {/* Buttons */}
      <section>
        <h2 className="font-serif text-xl text-ink-900 mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" icon={Plus}>With Icon</Button>
          <Button variant="primary" loading>Loading</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      {/* Modal */}
      <section>
        <h2 className="font-serif text-xl text-ink-900 mb-4">Modal</h2>
        <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
        <Modal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)}
          title="Example Modal"
        >
          <p className="font-sans text-ink-600">
            This is the modal content. Press Escape or click outside to close.
          </p>
          <Modal.Footer>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setModalOpen(false)}>Confirm</Button>
          </Modal.Footer>
        </Modal>
      </section>

      {/* Popover */}
      <section>
        <h2 className="font-serif text-xl text-ink-900 mb-4">Popover</h2>
        <Popover
          trigger={<Button variant="outline" icon={Settings}>Open Menu</Button>}
          align="start"
        >
          {({ close }) => (
            <div className="py-1">
              <Popover.Item icon={Plus} onClick={close}>Add Item</Popover.Item>
              <Popover.Item icon={Settings} onClick={close}>Settings</Popover.Item>
              <Popover.Divider />
              <Popover.Item icon={Trash2} danger onClick={close}>Delete</Popover.Item>
            </div>
          )}
        </Popover>
      </section>

      {/* Badges */}
      <section>
        <h2 className="font-serif text-xl text-ink-900 mb-4">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="primary" removable onRemove={() => alert('Removed!')}>
            Removable
          </Badge>
        </div>
      </section>

      {/* Toggle */}
      <section>
        <h2 className="font-serif text-xl text-ink-900 mb-4">Toggle</h2>
        <div className="space-y-3">
          <Toggle 
            checked={toggleValue} 
            onChange={setToggleValue} 
            label="Enable notifications"
          />
          <Toggle 
            checked={true} 
            onChange={() => {}} 
            label="Disabled toggle"
            disabled
          />
        </div>
      </section>

      {/* Inputs */}
      <section>
        <h2 className="font-serif text-xl text-ink-900 mb-4">Inputs</h2>
        <div className="space-y-4 max-w-sm">
          <Input 
            label="List Name"
            placeholder="Enter list name..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Input 
            label="With Icon"
            placeholder="Search..."
            icon={Search}
          />
          <Input 
            label="With Error"
            placeholder="Enter email..."
            error="Please enter a valid email address"
          />
          <SearchInput
            value={searchValue}
            onChange={setSearchValue}
            onClear={() => setSearchValue('')}
            placeholder="Search articles..."
          />
        </div>
      </section>

      {/* Tooltip */}
      <section>
        <h2 className="font-serif text-xl text-ink-900 mb-4">Tooltip</h2>
        <div className="flex gap-4">
          <Tooltip content="This is a tooltip" side="top">
            <Button variant="outline">Hover me (top)</Button>
          </Tooltip>
          <Tooltip content="Bottom tooltip" side="bottom">
            <Button variant="outline">Hover me (bottom)</Button>
          </Tooltip>
        </div>
      </section>

      {/* Skeletons */}
      <section>
        <h2 className="font-serif text-xl text-ink-900 mb-4">Skeletons</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton.Card />
          <Skeleton.Card />
          <Skeleton.Card />
        </div>
        <div className="mt-4 max-w-xs space-y-1 bg-white p-2 rounded-lg border border-ink-200">
          <Skeleton.ListItem />
          <Skeleton.ListItem />
          <Skeleton.ListItem />
        </div>
      </section>
    </div>
  );
}