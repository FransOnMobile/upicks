'use client';

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface FilterSidebarProps {
  selectedDepartments: string[];
  onDepartmentChange: (departments: string[]) => void;
  ratingRange: [number, number];
  onRatingRangeChange: (range: [number, number]) => void;
  courseLevel: string;
  onCourseLevelChange: (level: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  departments: Array<{ id: string; name: string; code: string }>;
}

export function FilterSidebar({
  selectedDepartments,
  onDepartmentChange,
  ratingRange,
  onRatingRangeChange,
  courseLevel,
  onCourseLevelChange,
  sortBy,
  onSortByChange,
  departments
}: FilterSidebarProps) {
  const handleDepartmentToggle = (deptId: string) => {
    if (selectedDepartments.includes(deptId)) {
      onDepartmentChange(selectedDepartments.filter(id => id !== deptId));
    } else {
      onDepartmentChange([...selectedDepartments, deptId]);
    }
  };

  return (
    <div className="w-full bg-card rounded-[4px] shadow-custom p-5 sticky top-24 border border-border">
      <h3 className="text-xl font-semibold text-foreground mb-5">Filters</h3>

      <div className="mb-6">
        <Label className="text-base font-semibold text-foreground mb-3 block">Department</Label>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {departments.map((dept) => (
            <div key={dept.id} className="flex items-center space-x-2">
              <Checkbox
                id={dept.id}
                checked={selectedDepartments.includes(dept.id)}
                onCheckedChange={() => handleDepartmentToggle(dept.id)}
                className="border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label
                htmlFor={dept.id}
                className="text-sm text-foreground/80 cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {dept.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <Label className="text-base font-semibold text-foreground mb-3 block">
          Rating Range: {ratingRange[0]}.0 - {ratingRange[1]}.0
        </Label>
        <Slider
          value={ratingRange}
          onValueChange={(value: number[]) => onRatingRangeChange(value as [number, number])}
          min={1}
          max={5}
          step={1}
          className="mt-2"
        />
      </div>

      <div className="mb-6">
        <Label className="text-base font-semibold text-foreground mb-3 block">Course Level</Label>
        <RadioGroup value={courseLevel} onValueChange={onCourseLevelChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" className="border-input text-primary" />
            <Label htmlFor="all" className="text-sm text-foreground/80 cursor-pointer">All Levels</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="undergraduate" id="undergraduate" className="border-input text-primary" />
            <Label htmlFor="undergraduate" className="text-sm text-foreground/80 cursor-pointer">Undergraduate</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="graduate" id="graduate" className="border-input text-primary" />
            <Label htmlFor="graduate" className="text-sm text-foreground/80 cursor-pointer">Graduate</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base font-semibold text-foreground mb-3 block">Sort By</Label>
        <RadioGroup value={sortBy} onValueChange={onSortByChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="highest-rated" id="highest-rated" className="border-input text-primary" />
            <Label htmlFor="highest-rated" className="text-sm text-foreground/80 cursor-pointer">Highest Rated</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="most-reviewed" id="most-reviewed" className="border-input text-primary" />
            <Label htmlFor="most-reviewed" className="text-sm text-foreground/80 cursor-pointer">Most Reviewed</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="recent" id="recent" className="border-input text-primary" />
            <Label htmlFor="recent" className="text-sm text-foreground/80 cursor-pointer">Most Recent</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
