'use client';

import { TrendingUp, Users, Clock } from 'lucide-react';

interface StatsDashboardProps {
  reviewsThisWeek: number;
  mostReviewedProfessor?: string;
  trendingDepartment?: string;
}

export function StatsDashboard({ reviewsThisWeek, mostReviewedProfessor, trendingDepartment }: StatsDashboardProps) {
  return (
    <div className="bg-white rounded-[4px] shadow-custom p-5">
      <h3 className="text-lg font-semibold text-[#2d2540] mb-4">Platform Activity</h3>
      
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-[#faf8ff] rounded-[4px] flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-[#800000]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#800000]">{reviewsThisWeek}</div>
            <div className="text-sm text-[#2d2540]/60">Reviews This Week</div>
          </div>
        </div>

        {mostReviewedProfessor && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#faf8ff] rounded-[4px] flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-[#800000]" />
            </div>
            <div>
              <div className="font-semibold text-[#2d2540]">{mostReviewedProfessor}</div>
              <div className="text-sm text-[#2d2540]/60">Most Reviewed</div>
            </div>
          </div>
        )}

        {trendingDepartment && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#faf8ff] rounded-[4px] flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-[#800000]" />
            </div>
            <div>
              <div className="font-semibold text-[#2d2540]">{trendingDepartment}</div>
              <div className="text-sm text-[#2d2540]/60">Trending Department</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
