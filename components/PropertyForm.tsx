import React from 'react';
import { PropertyInput } from '../types';
import { Trash2, GripVertical, MapPin, User, Clock, Building } from 'lucide-react';

interface PropertyFormProps {
  property: PropertyInput;
  index: number;
  onUpdate: (id: string, updates: Partial<PropertyInput>) => void;
  onRemove: (id: string) => void;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({ property, index, onUpdate, onRemove }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-4 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded cursor-move text-slate-400">
            <GripVertical size={16} />
          </div>
          <h3 className="font-semibold text-slate-700">Stop {index + 1}</h3>
        </div>
        <button
          onClick={() => onRemove(property.id)}
          className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-full transition-colors"
          title="Remove Stop"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Address & MLS */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
              <MapPin size={12} /> Address
            </label>
            <input
              type="text"
              value={property.address}
              onChange={(e) => onUpdate(property.id, { address: e.target.value })}
              className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-2 border"
              placeholder="123 Main St, City, State"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
              <Building size={12} /> MLS ID (Optional)
            </label>
            <input
              type="text"
              value={property.mlsId || ''}
              onChange={(e) => onUpdate(property.id, { mlsId: e.target.value })}
              className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-2 border"
              placeholder="MLS#123456"
            />
          </div>
        </div>

        {/* Logistics & Listing Agent */}
        <div className="space-y-3">
          <div className="flex gap-4">
             <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                <Clock size={12} /> Drive from Prev (min)
              </label>
              <input
                type="number"
                min="0"
                value={property.driveTimeFromPrevious}
                onChange={(e) => onUpdate(property.id, { driveTimeFromPrevious: parseInt(e.target.value) || 0 })}
                className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-2 border"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">Occupancy</label>
              <select
                value={property.occupancy}
                onChange={(e) => onUpdate(property.id, { occupancy: e.target.value as any })}
                className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-2 border bg-white"
              >
                <option value="Vacant">Vacant</option>
                <option value="Occupied">Occupied</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
          </div>

          {(property.occupancy === 'Occupied' || property.occupancy === 'Unknown') && (
            <div className="bg-amber-50 p-3 rounded-md border border-amber-100">
               <label className="block text-xs font-medium text-amber-700 mb-2 flex items-center gap-1">
                <User size={12} /> Listing Agent Info (Required)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={property.listingAgentName || ''}
                  onChange={(e) => onUpdate(property.id, { listingAgentName: e.target.value })}
                  placeholder="Name"
                  className="text-sm border-amber-200 rounded focus:ring-amber-500 focus:border-amber-500 p-1.5 border"
                />
                 <input
                  type="email"
                  value={property.listingAgentEmail || ''}
                  onChange={(e) => onUpdate(property.id, { listingAgentEmail: e.target.value })}
                  placeholder="Email"
                  className="text-sm border-amber-200 rounded focus:ring-amber-500 focus:border-amber-500 p-1.5 border"
                />
              </div>
              
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-amber-200/50">
                <input
                    type="checkbox"
                    id={`confirmed-${property.id}`}
                    checked={property.isConfirmed || false}
                    onChange={(e) => onUpdate(property.id, { isConfirmed: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label htmlFor={`confirmed-${property.id}`} className="text-sm text-amber-900 font-medium cursor-pointer">
                    Appointment Confirmed
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
