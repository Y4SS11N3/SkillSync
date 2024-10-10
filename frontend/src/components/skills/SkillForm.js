import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSkills } from '../../redux/actions/skillActions';

const proficiencyLevels = [
  { value: '1', label: 'Beginner' },
  { value: '2', label: 'Elementary' },
  { value: '3', label: 'Intermediate' },
  { value: '4', label: 'Advanced' },
  { value: '5', label: 'Expert' }
];

const SkillSelector = ({ control, errors, availableSkills }) => (
  <div className="space-y-2">
    <label htmlFor="skillId" className="block text-sm font-medium text-gray-700">Select Skill</label>
    <Controller
      name="skillId"
      control={control}
      rules={{ required: "Skill selection is required" }}
      render={({ field }) => (
        <select
          {...field}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">Select a skill</option>
          {availableSkills && availableSkills.map((skill) => (
            <option key={skill.id} value={skill.id}>
              {skill.name}
            </option>
          ))}
        </select>
      )}
    />
    {errors.skillId && <p className="mt-2 text-sm text-red-600">{errors.skillId.message}</p>}
  </div>
);

const SkillDescription = ({ control }) => (
  <div className="space-y-2">
    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Skill Description</label>
    <Controller
      name="description"
      control={control}
      render={({ field }) => (
        <textarea
          {...field}
          rows={3}
          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
          placeholder="Add a personal description of your experience with this skill"
        />
      )}
    />
  </div>
);

const ProficiencySelector = ({ control, errors }) => (
  <div className="space-y-2">
    <label htmlFor="proficiencyLevel" className="block text-sm font-medium text-gray-700">Proficiency Level</label>
    <Controller
      name="proficiencyLevel"
      control={control}
      rules={{ required: "Proficiency level is required" }}
      render={({ field }) => (
        <select
          {...field}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">Select your proficiency level</option>
          {proficiencyLevels.map((level) => (
            <option key={level.value} value={level.value}>
              {level.value} - {level.label}
            </option>
          ))}
        </select>
      )}
    />
    {errors.proficiencyLevel && <p className="mt-2 text-sm text-red-600">{errors.proficiencyLevel.message}</p>}
  </div>
);

const SkillForm = ({ skill, onSubmit, onCancel, availableSkills }) => {
  const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: skill || { skillId: '', description: '', proficiencyLevel: '' }
  });

  const selectedSkillId = watch('skillId');

  useEffect(() => {
    if (skill) {
      setValue('skillId', skill.skillId);
      setValue('description', skill.description);
      setValue('proficiencyLevel', skill.proficiencyLevel.toString());
    }
  }, [skill, setValue]);

  const onFormSubmit = (data) => {
    onSubmit({
      skillId: Number(data.skillId),
      description: data.description,
      proficiencyLevel: Number(data.proficiencyLevel)
    });
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="flex items-center space-x-5">
          <div className="h-14 w-14 bg-white rounded-full flex flex-shrink-0 justify-center items-center text-blue-500">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">{skill ? 'Update Skill' : 'Add New Skill'}</h2>
            <p className="text-sm text-blue-100">Enter your skill details below.</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-4">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <SkillSelector control={control} errors={errors} availableSkills={availableSkills} />
          {selectedSkillId && (
            <>
              <SkillDescription control={control} />
              <ProficiencySelector control={control} errors={errors} />
            </>
          )}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedSkillId}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {skill ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SkillForm;