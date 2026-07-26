import React, { useState } from 'react';
import { Target, CheckCircle2, Circle, Award, RotateCcw } from 'lucide-react';
import { initialMissionTasks, MissionTask } from '../../data/mockDashboardData';

export const TodaysMissionCard: React.FC = () => {
  const [tasks, setTasks] = useState<MissionTask[]>(initialMissionTasks);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercentage = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="flex flex-col h-full rounded-xl border border-edge/80 bg-panel/90 p-5 shadow-lg backdrop-blur-sm">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-edge/60 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neon/10 border border-neon/30 text-neon-bright">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-100 tracking-wide">
              Today's Mission
            </h3>
            <p className="font-mono text-xs text-slate-400 uppercase">
              Officer Directive Checklist
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs text-neon-bright font-bold bg-neon/10 px-2.5 py-1 rounded border border-neon/20">
          <Award className="h-3.5 w-3.5" />
          <span>{progressPercentage}% DONE</span>
        </div>
      </div>

      {/* Progress Bar Gauge */}
      <div className="mb-4 bg-void/80 rounded-lg p-3 border border-edge/50">
        <div className="flex justify-between items-center text-xs font-mono mb-1.5 text-slate-300">
          <span>MISSION COMPLETION</span>
          <span className="text-neon-bright font-bold">{completedCount} of {tasks.length} Complete</span>
        </div>
        <div className="w-full bg-edge/50 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-neon-bright h-full rounded-full transition-all duration-500 shadow-neon-sm"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Mission Tasks List */}
      <div className="flex-1 space-y-2.5">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 cursor-pointer select-none ${
              task.completed
                ? 'bg-void/40 border-edge/40 text-slate-400'
                : 'bg-void/80 border-neon/30 text-slate-200 hover:border-neon'
            }`}
          >
            <div className="flex items-center gap-3">
              {task.completed ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-slate-500 shrink-0 hover:text-neon-bright" />
              )}
              <span className={`text-sm font-body ${task.completed ? 'line-through text-slate-400' : 'font-medium'}`}>
                {task.label}
              </span>
            </div>

            <span className="text-[10px] font-mono uppercase text-slate-500 bg-void px-2 py-0.5 rounded border border-edge/40">
              {task.category}
            </span>
          </div>
        ))}
      </div>

      {/* Reset button */}
      <div className="mt-4 pt-3 border-t border-edge/50 flex items-center justify-between text-xs font-mono text-slate-400">
        <span className="text-slate-500">DUTY SHIFT #SHIFT-B2</span>
        <button 
          onClick={() => setTasks(initialMissionTasks)}
          className="flex items-center gap-1 hover:text-neon-bright transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          <span>RESET STATUS</span>
        </button>
      </div>
    </div>
  );
};
