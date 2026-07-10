          {apiWarning && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md shadow-sm mb-4 flex items-start justify-between">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-700">
                    {apiWarning}
                  </p>
                </div>
              </div>
              {!isClientMode && (
                <button
                  onClick={() => setCurrentView('settings')}
                  className="ml-4 flex-shrink-0 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm font-medium rounded-md transition-colors"
                >
                  Update Settings
                </button>
              )}
            </div>
          )}
