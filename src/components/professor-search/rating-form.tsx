'use client';

import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AddCourseDialog } from './add-course-dialog';
import { createClient } from "@/utils/supabase/client";

interface RatingFormProps {
  isOpen: boolean;
  onClose: () => void;
  professorId: string;
  professorName: string;
  courses: Array<{ id: string; code: string; name: string }>;
  availableTags: Array<{ id: string; name: string }>;
  onSubmit: (data: {
    courseId: string;
    teachingQuality: number;
    fairness: number;
    clarity: number;
    difficulty: number;
    mandatoryAttendance: boolean | null;
    textbookUsed: boolean | null;
    gradeReceived: string;
    reviewText: string;
    wouldTakeAgain: boolean;
    isAnonymous: boolean;
    selectedTags: string[];
  }) => Promise<void>;
}

export function RatingForm({
  isOpen,
  onClose,
  professorId,
  professorName,
  courses,
  availableTags,
  onSubmit
}: RatingFormProps) {
  const [difficulty, setDifficulty] = useState(0);
  const [mandatoryAttendance, setMandatoryAttendance] = useState<boolean | null>(null);
  const [textbookUsed, setTextbookUsed] = useState<boolean | null>(null);
  const [gradeReceived, setGradeReceived] = useState('');

  // Missing state variables
  const [step, setStep] = useState(1);
  const [courseId, setCourseId] = useState('');
  const [teachingQuality, setTeachingQuality] = useState(0);
  const [fairness, setFairness] = useState(0);
  const [clarity, setClarity] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [wouldTakeAgain, setWouldTakeAgain] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTagToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((id) => id !== tagId));
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleSubmit = async () => {
    if (!courseId || teachingQuality === 0 || fairness === 0 || clarity === 0 || difficulty === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        courseId,
        teachingQuality,
        fairness,
        clarity,
        difficulty,
        mandatoryAttendance,
        textbookUsed,
        gradeReceived,
        reviewText,
        wouldTakeAgain,
        isAnonymous,
        selectedTags
      });
      handleClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setCourseId('');
    setTeachingQuality(0);
    setFairness(0);
    setClarity(0);
    setDifficulty(0);
    setMandatoryAttendance(null);
    setTextbookUsed(null);
    setGradeReceived('');
    setReviewText('');
    setWouldTakeAgain(false);
    setIsAnonymous(true);
    setSelectedTags([]);
    onClose();
  };

  // ... Helper components ...

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-[#2d2540]">
            Rate Professor {professorName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {/* Step 1: Course Selection (Unchanged) */}
          {step === 1 && (
            // ... existing step 1
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium text-[#2d2540] mb-2 block">
                  Select Course <span className="text-red-500 text-sm ml-1">(Required)</span>
                </Label>
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger className="border-[rgba(100,80,140,0.12)] rounded-[4px]">
                    <SelectValue placeholder="Choose a course..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex justify-end mt-1">
                  <AddCourseDialog
                    onAdd={async (name, code) => {
                      const supabase = createClient();
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user) return;
                      const { error } = await supabase.from('courses').insert({
                        name,
                        code,
                        is_verified: false,
                        submitted_by: user.id,
                      });
                      if (error) {
                        alert("Failed: " + error.message);
                      } else {
                        alert("Course submitted for review!");
                      }
                    }}
                    trigger={
                      <div className="text-xs text-primary underline cursor-pointer hover:text-primary/80 pt-1 text-right">
                        Course not listed? Add it here.
                      </div>
                    }
                  />
                </div>
              </div>
              <Button
                onClick={() => setStep(2)}
                disabled={!courseId}
                className="w-full bg-[#800000] hover:bg-[#600000] text-white rounded-[4px] font-semibold"
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <RatingStars
                value={teachingQuality}
                onChange={setTeachingQuality}
                label="Teaching Quality"
              />
              <RatingStars
                value={fairness}
                onChange={setFairness}
                label="Fairness"
              />
              <RatingStars
                value={clarity}
                onChange={setClarity}
                label="Clarity"
              />
              <RatingStars
                value={difficulty}
                onChange={setDifficulty}
                label="Difficulty"
                minLabel="Very Easy"
                maxLabel="Very Hard"
                labels={['Very Easy', 'Easy', 'Average', 'Hard', 'Very Hard']}
              />
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 border-[rgba(100,80,140,0.12)] rounded-[4px]"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={teachingQuality === 0 || fairness === 0 || clarity === 0 || difficulty === 0}
                  className="flex-1 bg-[#800000] hover:bg-[#600000] text-white rounded-[4px] font-semibold"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-base font-medium text-[#2d2540] mb-2 block">
                    Mandatory Attendance <span className="text-muted-foreground text-sm font-normal ml-1">(Optional)</span>
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={mandatoryAttendance === true ? "default" : "outline"}
                      onClick={() => setMandatoryAttendance(true)}
                      className={`active:scale-95 ${mandatoryAttendance === true ? 'bg-[#800000] text-white' : ''}`}
                    >Yes</Button>
                    <Button
                      type="button"
                      variant={mandatoryAttendance === false ? "default" : "outline"}
                      onClick={() => setMandatoryAttendance(false)}
                      className={`active:scale-95 ${mandatoryAttendance === false ? 'bg-[#800000] text-white' : ''}`}
                    >No</Button>
                  </div>
                </div>
                <div>
                  <Label className="text-base font-medium text-[#2d2540] mb-2 block">
                    Textbook Used <span className="text-muted-foreground text-sm font-normal ml-1">(Optional)</span>
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={textbookUsed === true ? "default" : "outline"}
                      onClick={() => setTextbookUsed(true)}
                      className={`active:scale-95 ${textbookUsed === true ? 'bg-[#800000] text-white' : ''}`}
                    >Yes</Button>
                    <Button
                      type="button"
                      variant={textbookUsed === false ? "default" : "outline"}
                      onClick={() => setTextbookUsed(false)}
                      className={`active:scale-95 ${textbookUsed === false ? 'bg-[#800000] text-white' : ''}`}
                    >No</Button>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-base font-medium text-[#2d2540] mb-2 block">
                  Grade Received <span className="text-muted-foreground text-sm font-normal ml-1">(Optional)</span>
                </Label>
                <Select value={gradeReceived} onValueChange={setGradeReceived}>
                  <SelectTrigger className="border-[rgba(100,80,140,0.12)] rounded-[4px]">
                    <SelectValue placeholder="Select Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {['1.0', '1.25', '1.5', '1.75', '2.0', '2.25', '2.5', '2.75', '3.0', '4.0', '5.0', 'Inc', 'Drop', 'Pass', 'Fail'].map(g => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1 border-[rgba(100,80,140,0.12)] rounded-[4px]">Back</Button>
                <Button onClick={() => setStep(4)} className="flex-1 bg-[#800000] hover:bg-[#600000] text-white rounded-[4px] font-semibold">Continue</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium text-[#2d2540] mb-2 block">
                  Written Review (Optional)
                </Label>
                <Textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this professor... (Max 350 chars)"
                  rows={6}
                  maxLength={350}
                  className="border-[rgba(100,80,140,0.12)] rounded-[4px] resize-none"
                />
                <div className="text-right text-xs text-muted-foreground">{reviewText.length}/350</div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(3)}
                  variant="outline"
                  className="flex-1 border-[rgba(100,80,140,0.12)] rounded-[4px]"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(5)}
                  className="flex-1 bg-[#800000] hover:bg-[#600000] text-white rounded-[4px] font-semibold"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 5 and 6 (Tags and Final) - adjusted indices for new step */}
          {step === 5 && (
            <div className="space-y-4">
              {/* Tags Logic - Existing Code */}
              <div>
                <Label className="text-base font-medium text-[#2d2540] mb-3 block">
                  Select Tags (Optional) - Max 3
                </Label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      onClick={() => {
                        if (selectedTags.includes(tag.id)) {
                          handleTagToggle(tag.id);
                        } else if (selectedTags.length < 3) {
                          handleTagToggle(tag.id);
                        }
                      }}
                      className={`cursor-pointer text-sm px-3 py-1.5 rounded-[2px] border transition-colors ${selectedTags.includes(tag.id)
                        ? 'bg-[#800000] text-white border-[#800000]'
                        : 'bg-white text-[#2d2540] border-[rgba(100,80,140,0.12)] hover:border-[#800000]'
                        } ${!selectedTags.includes(tag.id) && selectedTags.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setStep(4)} variant="outline" className="flex-1 border-[rgba(100,80,140,0.12)] rounded-[4px]">Back</Button>
                <Button onClick={() => setStep(6)} className="flex-1 bg-[#800000] hover:bg-[#600000] text-white rounded-[4px] font-semibold">Continue</Button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="wouldTakeAgain"
                  checked={wouldTakeAgain}
                  onCheckedChange={(checked) => setWouldTakeAgain(checked as boolean)}
                  className="border-[rgba(100,80,140,0.12)] data-[state=checked]:bg-[#800000] data-[state=checked]:border-[#800000]"
                />
                <label htmlFor="wouldTakeAgain" className="text-base font-medium text-[#2d2540] cursor-pointer">
                  I would take this professor again
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isAnonymous"
                  checked={isAnonymous}
                  onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                  className="border-[rgba(100,80,140,0.12)] data-[state=checked]:bg-[#800000] data-[state=checked]:border-[#800000]"
                />
                <label htmlFor="isAnonymous" className="text-base font-medium text-[#2d2540] cursor-pointer">
                  Submit anonymously
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => setStep(5)}
                  variant="outline"
                  className="flex-1 border-[rgba(100,80,140,0.12)] rounded-[4px]"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-[#800000] hover:bg-[#600000] text-white rounded-[4px] font-semibold"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog >
  );
}

function RatingStars({
  value,
  onChange,
  label,
  minLabel = "Terrible",
  maxLabel = "Excellent",
  labels = ['Terrible', 'Poor', 'Average', 'Good', 'Excellent']
}: {
  value: number;
  onChange: (val: number) => void;
  label: string;
  minLabel?: string;
  maxLabel?: string;
  labels?: string[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-base font-medium text-[#2d2540]">
          {label} <span className="text-red-500 text-sm ml-1">*</span>
        </Label>
        {value > 0 && (
          <span className="text-sm font-medium text-[#800000]">
            {labels[value - 1]}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className="focus:outline-none group relative p-1"
          >
            <Star
              className={`w-10 h-10 transition-all duration-200 ${rating <= value
                ? 'fill-[#FFD700] text-[#FFD700] scale-105'
                : 'text-gray-200 group-hover:text-gray-300'}`}
            />
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
