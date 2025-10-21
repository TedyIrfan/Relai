import React, { useState } from 'react';
import NominatifEntryForm from '../components/nominatif/NominatifEntryForm.jsx';
import { dummyDrafts, dummySubmittedNominatifs } from '../data/nominatifDummy.js';

const Nominatif = () => {
  const [activeView, setActiveView] = useState('entry'); // 'entry', 'drafts', 'submitted'

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nominatif</h1>
        <p className="text-gray-600 mt-2">Entry dan Management Data Nominatif Perjalanan Dinas</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveView('entry')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'entry'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Entry Nominatif
              </span>
            </button>
            <button
              onClick={() => setActiveView('drafts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'drafts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Draft ({dummyDrafts.length})
              </span>
            </button>
            <button
              onClick={() => setActiveView('submitted')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'submitted'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Submitted ({dummySubmittedNominatifs.length})
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Content based on active view */}
      {activeView === 'entry' && <NominatifEntryForm />}

      {activeView === 'drafts' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Draft Nominatif</h2>
          <div className="space-y-4">
            {dummyDrafts.map((draft) => (
              <div key={draft.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{draft.deskripsiTugas}</h3>
                    <p className="text-sm text-gray-600 mt-1">Tujuan: {draft.tujuan}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Dibuat: {new Date(draft.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      Draft
                    </span>
                    <button className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'submitted' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Submitted Nominatif</h2>
          <div className="space-y-4">
            {dummySubmittedNominatifs.map((nominatif) => (
              <div key={nominatif.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{nominatif.deskripsiTugas}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Tujuan: {nominatif.tujuan} | Total: {nominatif.totalPagu.toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0
                      })}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Submitted: {new Date(nominatif.submittedAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Submitted
                    </span>
                    <button className="px-3 py-1 text-xs font-medium bg-gray-600 text-white rounded hover:bg-gray-700">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Nominatif;