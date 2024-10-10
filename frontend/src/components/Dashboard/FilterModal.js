import React from 'react';
import Modal from '../common/Modal';
import Select from '../common/Select';

const FilterModal = ({ isOpen, onClose, filters, onFilterChange }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filter Exchanges">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skill Level</label>
          <Select
            options={[
              { value: 'all', label: 'All Levels' },
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
            ]}
            value={filters.skillLevel}
            onChange={(value) => onFilterChange('skillLevel', value)}
          />
        </div>
        <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exchange Status</label>
          <Select
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'accepted', label: 'Accepted' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'declined', label: 'Declined' },
            ]}
            value={filters.exchangeStatus}
            onChange={(value) => onFilterChange('exchangeStatus', value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
          <Select
            options={[
              { value: 'date', label: 'Date' },
              { value: 'duration', label: 'Duration' },
            ]}
            value={filters.sortBy}
            onChange={(value) => onFilterChange('sortBy', value)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default FilterModal;