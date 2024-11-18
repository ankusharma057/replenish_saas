import React, { useState } from 'react';

export default function COVID() {
  const [answers, setAnswers] = useState({
    fever: null,
    symptoms: [],
    exposure: null,
    travelHistory: null,
    vaccination: null,
  });

  const handleCheckboxChange = (question, value) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [question]: prevAnswers[question] === value ? null : value
    }));
  };

  const handleMultiSelectChange = (question, value) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [question]: prevAnswers[question]?.includes(value)
        ? prevAnswers[question].filter(item => item !== value)
        : [...(prevAnswers[question] || []), value]
    }));
  };

  return (
    <div className="h-full flex flex-col max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Question 1: Do you have fever? */}
      <div className="question mb-6">
        <h3 className="font-semibold text-xl text-gray-800 mb-4">1. Do you have fever?</h3>
        <div className="flex gap-6">
          <label className="flex items-center text-gray-700">
            <input
              type="radio"
              name="fever"
              value="yes"
              checked={answers.fever === 'yes'}
              onChange={() => handleCheckboxChange('fever', 'yes')}
              className="h-4 w-4 accent-indigo-600"
            />
            <span className="ml-2">Yes</span>
          </label>
          <label className="flex items-center text-gray-700">
            <input
              type="radio"
              name="fever"
              value="no"
              checked={answers.fever === 'no'}
              onChange={() => handleCheckboxChange('fever', 'no')}
              className="h-4 w-4 accent-indigo-600"
            />
            <span className="ml-2">No</span>
          </label>
        </div>
      </div>

      <div className="question mb-6">
        <h3 className="font-semibold text-xl text-gray-800 mb-4">2.  Do you have any of the following signs or symptoms?</h3>
        <div className="grid grid-cols-3 gap-4">
          {['New onset of cough', 'New loss or decrease in sense of taste or smell', 'Chills', 'Worsening chronic cough', 'Runny nose', 'Headache', 'Sore throat', 'Sneezing (not allergy related)', 'Unexplained fatigue or malaise', 'Shortness of breath', 'Hoarse voice', 'Difficulty swallowing', 'Difficulty breathing', 'Nasal congestion', 'Nausea/vomiting, diarrhea, abdominal pain'].map((symptom, index) => (
            <label key={index} className="flex items-center text-gray-700">
              <input
                type="checkbox"
                value={symptom}
                checked={answers.symptoms.includes(symptom)}
                onChange={() => handleMultiSelectChange('symptoms', symptom)}
                className="h-4 w-4 accent-indigo-600"
              />
              <span className="ml-2 text-sm">{symptom}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="question mb-6">
        <h3 className="font-semibold text-xl text-gray-800 mb-4">3. Have you travelled or have had close contact with anyone who has travelled in the past 14 days?*</h3>
        <div className="flex gap-6">
          <label className="flex items-center text-gray-700">
            <input
              type="radio"
              name="exposure"
              value="yes"
              checked={answers.exposure === 'yes'}
              onChange={() => handleCheckboxChange('exposure', 'yes')}
              className="h-4 w-4 accent-indigo-600"
            />
            <span className="ml-2 text-sm">Yes</span>
          </label>
          <label className="flex items-center text-gray-700">
            <input
              type="radio"
              name="exposure"
              value="no"
              checked={answers.exposure === 'no'}
              onChange={() => handleCheckboxChange('exposure', 'no')}
              className="h-4 w-4 accent-indigo-600"
            />
            <span className="ml-2 text-sm">No</span>
          </label>
        </div>
      </div>

      <div className="question mb-6">
        <h3 className="font-semibold text-xl text-gray-800 mb-4">4. Have you had close contact with anyone with respiratory illness or a confirmed or probable/suspected case of COVID-19?*</h3>
        <div className="flex gap-6">
          <label className="flex items-center text-gray-700">
            <input
              type="radio"
              name="travelHistory"
              value="yes"
              checked={answers.travelHistory === 'yes'}
              onChange={() => handleCheckboxChange('travelHistory', 'yes')}
              className="h-4 w-4 accent-indigo-600"
            />
            <span className="ml-2 text-sm">Yes (if yes, go to question 5)</span>
          </label>
          <label className="flex items-center text-gray-700">
            <input
              type="radio"
              name="travelHistory"
              value="no"
              checked={answers.travelHistory === 'no'}
              onChange={() => handleCheckboxChange('travelHistory', 'no')}
              className="h-4 w-4 accent-indigo-600"
            />
            <span className="ml-2 text-sm">No (if no, screening is complete)</span>
          </label>
        </div>
      </div>

      <div className="question mb-6">
        <h3 className="font-semibold text-xl text-gray-800 mb-4">5. Did you wear the required and/or recommended PPE according to the type of duties you were performing (e.g. goggles, gloves, mask, and gown or N95 with aerosol-generating medical procedures) when you had close contact with a suspected or confirmed case of COVID-19?</h3>
        <div className="flex gap-6">
          <label className="flex items-center text-gray-700">
            <input
              type="radio"
              name="vaccination"
              value="yes"
              checked={answers.vaccination === 'yes'}
              onChange={() => handleCheckboxChange('vaccination', 'yes')}
              className="h-4 w-4 accent-indigo-600"
            />
            <span className="ml-2 text-sm">Yes</span>
          </label>
          <label className="flex items-center text-gray-700">
            <input
              type="radio"
              name="vaccination"
              value="no"
              checked={answers.vaccination === 'no'}
              onChange={() => handleCheckboxChange('vaccination', 'no')}
              className="h-4 w-4 accent-indigo-600"
            />
            <span className="ml-2 text-sm">No</span>
          </label>
        </div>
      </div>

      <div className="notes text-gray-600 italic mt-6">
        <p className="text-xs">If you have answered "yes" to questions 1, 3, or have checked off signs or symptoms, you may need to reschedule your appointment.</p>
        <p className="text-xs">If you have answered "yes" to question 4 but "yes" to question 5, you may proceed with your appointment.</p>
      </div>
    </div>
  );
}
