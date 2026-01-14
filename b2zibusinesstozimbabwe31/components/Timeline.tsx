import React from 'react';
import { Calendar, Upload, Rocket, CheckCircle } from 'lucide-react';
import { TimelineEvent } from '../types';

const events: TimelineEvent[] = [
  {
    date: 'Today',
    title: 'Merchant Registration Open',
    description: 'You have successfully created your account. Verification is pending.',
    status: 'completed',
    icon: 'check'
  },
  {
    date: '30 December',
    title: 'Product Listing Begins',
    description: 'The dashboard opens for you to start uploading your inventory, setting prices, and managing stock before the public launch.',
    status: 'upcoming',
    icon: 'upload'
  },
  {
    date: '12 January',
    title: 'Official Launch & App Download',
    description: 'B2Zi goes live on Google Play and Apple App Store. Consumers begin purchasing. Deliveries start rolling out.',
    status: 'upcoming',
    icon: 'rocket'
  }
];

export const Timeline: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-b2zi-light/30">
      <h2 className="text-2xl font-bold text-b2zi-black mb-6 flex items-center gap-2">
        <Calendar className="text-b2zi-dark" />
        Launch Roadmap
      </h2>
      <div className="relative border-l-4 border-b2zi-light/30 ml-3 space-y-12">
        {events.map((event, index) => {
          const isCompleted = event.status === 'completed';
          
          return (
            <div key={index} className="relative pl-10">
              {/* Timeline Dot */}
              <div className={`absolute -left-[14px] top-1 h-7 w-7 rounded-full border-4 flex items-center justify-center ${
                isCompleted ? 'bg-b2zi-dark border-b2zi-dark' : 'bg-white border-b2zi-light'
              }`}>
                {isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <span className={`text-sm font-bold tracking-wider uppercase ${
                  isCompleted ? 'text-b2zi-dark' : 'text-gray-500'
                }`}>
                  {event.date}
                </span>
              </div>
              
              <h3 className="text-xl font-semibold text-b2zi-black">{event.title}</h3>
              <p className="mt-2 text-gray-600 leading-relaxed max-w-2xl">
                {event.description}
              </p>
              
              {event.status === 'upcoming' && (
                <span className="inline-block mt-3 px-3 py-1 bg-b2zi-light/20 text-b2zi-dark text-xs font-semibold rounded-full">
                  Coming Soon
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
