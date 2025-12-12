'use client';

import { Input } from '../../components/forms/input';
import { Textarea } from '../../components/forms/textarea';
import { Select } from '../../components/forms/select';
import { Checkbox } from '../../components/forms/checkbox';

export function InputsSection() {
  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Input</h4>
        <div className="space-y-3 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1.5">Normal</label>
            <Input placeholder="Enter your name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">With Value</label>
            <Input value="John Doe" readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-danger">Error State</label>
            <Input error placeholder="This field has an error" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Disabled</label>
            <Input disabled placeholder="This field is disabled" />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Textarea</h4>
        <div className="space-y-3 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1.5">Normal</label>
            <Textarea placeholder="Enter your message" rows={4} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-danger">Error State</label>
            <Textarea error placeholder="This field has an error" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Disabled</label>
            <Textarea disabled placeholder="This field is disabled" rows={3} />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Select</h4>
        <div className="space-y-3 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1.5">Normal</label>
            <Select>
              <option value="">Select an option</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-danger">Error State</label>
            <Select error>
              <option value="">Select an option</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Disabled</label>
            <Select disabled>
              <option value="">Select an option</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Checkbox</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox id="check1" />
            <label htmlFor="check1" className="text-sm cursor-pointer">Normal checkbox</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="check2" defaultChecked />
            <label htmlFor="check2" className="text-sm cursor-pointer">Checked checkbox</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="check3" disabled />
            <label htmlFor="check3" className="text-sm text-muted-foreground cursor-not-allowed">Disabled unchecked</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="check4" disabled defaultChecked />
            <label htmlFor="check4" className="text-sm text-muted-foreground cursor-not-allowed">Disabled checked</label>
          </div>
        </div>
      </div>
    </div>
  );
}
