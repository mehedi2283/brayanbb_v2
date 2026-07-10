import { TooltipRenderProps } from 'react-joyride';
import { X, ChevronRight, Check } from 'lucide-react';

export function TutorialTooltip({
  index,
  step,
  size,
  tooltipProps,
  primaryProps,
  backProps,
  closeProps,
  isLastStep,
}: TooltipRenderProps) {
  return (
    <div
      {...tooltipProps}
      className="bg-white w-full rounded-2xl relative font-sans"
    >
      <div className="p-6 relative">
        <button
          {...closeProps}
          style={{}}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-full hover:bg-slate-100"
          aria-label="Close tutorial"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="mb-2">
          {step.title && (
            <h3 className="text-[17px] font-bold text-slate-900 tracking-tight pr-6">
              {step.title}
            </h3>
          )}
        </div>
        
        <div className="text-[14.5px] text-slate-600 leading-relaxed font-medium">
          {step.content}
        </div>
      </div>

      <div className="bg-slate-50/80 px-6 py-4 border-t border-slate-100 flex items-center justify-between backdrop-blur-sm rounded-b-2xl">
        <div className="flex space-x-1.5">
          {Array.from({ length: size }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? 'w-5 bg-slate-900' : 'w-1.5 bg-slate-300'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center space-x-2">
          {index > 0 && (
            <button
              {...backProps}
              style={{}}
              className="text-sm font-semibold text-slate-500 hover:text-slate-900 px-3 py-2 rounded-lg transition-colors hover:bg-slate-200/50"
            >
              Back
            </button>
          )}
          <button
            {...primaryProps}
            style={{}}
            className="flex items-center text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          >
            {isLastStep ? (
              <>
                Finish <Check className="w-4 h-4 ml-1.5" />
              </>
            ) : (
              <>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
