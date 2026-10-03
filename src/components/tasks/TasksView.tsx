import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProgressRing } from '../common/ProgressRing';
import { 
  Plus, 
  Trash2, 
  Copy, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { format, parseISO, startOfWeek, addDays } from 'date-fns';
import { ResponsiveContainer, LineChart, Line, Tooltip, XAxis, YAxis } from 'recharts';

export const TasksView: React.FC = () => {
  const { 
    tasks, 
    addTask, 
    toggleTask, 
    deleteTask, 
    mindsetLogs, 
    setIsCreateTaskOpen 
  } = useApp();

  const [weekOffset, setWeekOffset] = useState(0);
  const [inlineTaskInput, setInlineTaskInput] = useState<{ date: string; title: string }>({ date: '', title: '' });

  const startOfCurrentWeek = addDays(startOfWeek(new Date(), { weekStartsOn: 0 }), weekOffset * 7);
  const weekDays = [0, 1, 2, 3, 4, 5, 6].map((i) => format(addDays(startOfCurrentWeek, i), 'yyyy-MM-dd'));

  const weekTasks = tasks.filter((t) => weekDays.includes(t.dueDate));
  const completedWeekTasks = weekTasks.filter((t) => t.completed).length;
  const totalWeekTasks = weekTasks.length;
  const overallWeekPct = Math.round((completedWeekTasks / (totalWeekTasks || 1)) * 100);

  const dailyBarData = weekDays.map((dStr) => {
    const dayName = format(parseISO(dStr), 'EEE');
    const dayT = tasks.filter((t) => t.dueDate === dStr);
    const dayComp = dayT.filter((t) => t.completed).length;
    const pct = dayT.length > 0 ? Math.round((dayComp / dayT.length) * 100) : 0;
    return { day: dayName, percentage: pct };
  });

  const mindsetChartData = weekDays.map((dStr) => {
    const dayName = format(parseISO(dStr), 'EEE');
    const mLog = mindsetLogs.find((m) => m.date === dStr) || { energy: 7, focus: 8, motivation: 7 };
    return {
      day: dayName,
      Energy: mLog.energy,
      Focus: mLog.focus,
      Motivation: mLog.motivation,
    };
  });

  const handleInlineAdd = (dStr: string) => {
    if (!inlineTaskInput.title.trim()) return;
    addTask({
      title: inlineTaskInput.title.trim(),
      dueDate: dStr,
      completed: false,
      priority: 'medium',
      category: 'Work',
    });
    setInlineTaskInput({ date: '', title: '' });
  };

  const handleCopyYesterdayList = (targetDateStr: string) => {
    const yesterdayStr = format(addDays(parseISO(targetDateStr), -1), 'yyyy-MM-dd');
    const yesterdayTasks = tasks.filter((t) => t.dueDate === yesterdayStr);
    if (!yesterdayTasks.length) {
      alert("No tasks found for yesterday to copy!");
      return;
    }
    yesterdayTasks.forEach((t) => {
      addTask({
        title: t.title,
        dueDate: targetDateStr,
        completed: false,
        priority: t.priority,
        category: t.category,
      });
    });
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#12141c] border border-[#1e2230] p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            TASK TRACKER
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            All seven days on one board. Plan tasks for each day of the week.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-[#090a0f] border border-[#1e2230] p-1 rounded-xl">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e2230] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-cyan-400 font-semibold px-2">
              {format(parseISO(weekDays[0]), 'dd MMM')} – {format(parseISO(weekDays[6]), 'dd MMM yyyy')}
            </span>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e2230] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsCreateTaskOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#090a0f] font-bold text-xs shadow-lg shadow-cyan-500/25 transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Top 2 Dashboard Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-6 bg-[#12141c] border border-[#1e2230] rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">OVERALL PROGRESS</span>

          <div className="flex items-center justify-between">
            <div className="flex items-end space-x-3 h-24 pt-2">
              {dailyBarData.map((d) => (
                <div key={d.day} className="flex flex-col items-center space-y-1">
                  <div className="w-5 bg-[#1e2230] rounded-t-md h-20 flex items-end overflow-hidden">
                    <div 
                      className="w-full bg-cyan-400 rounded-t-md transition-all duration-500"
                      style={{ height: `${d.percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{d.day}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center">
              <ProgressRing
                percentage={overallWeekPct}
                size={110}
                strokeWidth={8}
                color="#06b6d4"
                showText={false}
              >
                <span className="text-xl font-bold text-white font-mono">{overallWeekPct}%</span>
              </ProgressRing>
              <span className="text-xs font-mono text-slate-400 mt-2">
                {completedWeekTasks} / {totalWeekTasks} completed
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 bg-[#12141c] border border-[#1e2230] rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-[#1e2230] pb-3">
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">MINDSET TRACKER</span>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="flex items-center space-x-1 text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span>Energy</span>
              </span>
              <span className="flex items-center space-x-1 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Focus</span>
              </span>
              <span className="flex items-center space-x-1 text-purple-400">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>Motivation</span>
              </span>
            </div>
          </div>

          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mindsetChartData}>
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 10]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#161924] border border-[#262b3d] px-2.5 py-1.5 rounded-lg text-xs font-mono">
                          {payload.map((p) => (
                            <div key={p.name} style={{ color: p.color }}>
                              {p.name}: <strong>{p.value}/10</strong>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="Energy" stroke="#f43f5e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Focus" stroke="#00f2fe" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Motivation" stroke="#a855f7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 7 Days Columns Board */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((dStr) => {
          const dateObj = parseISO(dStr);
          const dayName = format(dateObj, 'EEEE');
          const dateFormatted = format(dateObj, 'dd/MM/yyyy');
          
          const dayTasks = tasks.filter((t) => t.dueDate === dStr);
          const completedCount = dayTasks.filter((t) => t.completed).length;
          const totalCount = dayTasks.length;
          const dayPct = Math.round((completedCount / (totalCount || 1)) * 100);

          const isAddingInline = inlineTaskInput.date === dStr;

          return (
            <div 
              key={dStr}
              className="bg-[#12141c] border border-[#1e2230] rounded-2xl p-4 flex flex-col justify-between shadow-xl space-y-4 min-h-[420px]"
            >
              <div className="text-center space-y-2 pb-3 border-b border-[#1e2230]">
                <h3 className="font-bold text-sm text-white">{dayName}</h3>
                <div className="text-[10px] text-slate-500 font-mono">{dateFormatted}</div>

                <div className="my-2 flex justify-center">
                  <ProgressRing
                    percentage={dayPct}
                    size={64}
                    strokeWidth={5}
                    color="#06b6d4"
                    showText={false}
                  >
                    <span className="text-xs font-bold text-white font-mono">{dayPct}%</span>
                  </ProgressRing>
                </div>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto max-h-60">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">TASKS</span>

                {dayTasks.map((task) => (
                  <div 
                    key={task.id}
                    className={`group flex items-start justify-between p-2.5 rounded-xl border transition-all ${
                      task.completed 
                        ? 'bg-[#151824]/50 border-cyan-500/20 opacity-70' 
                        : 'bg-[#090a0f] border-[#1e2230] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="mt-0.5 rounded border-slate-700 bg-[#1e2230] text-cyan-500 focus:ring-0 cursor-pointer"
                      />
                      <span className={`text-xs ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {task.title}
                      </span>
                    </div>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {isAddingInline ? (
                  <div className="space-y-1 pt-1">
                    <input
                      type="text"
                      placeholder="Task description..."
                      value={inlineTaskInput.title}
                      onChange={(e) => setInlineTaskInput({ date: dStr, title: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleInlineAdd(dStr);
                      }}
                      className="w-full text-xs bg-[#090a0f] border border-cyan-500 text-white rounded-lg p-2 focus:outline-none"
                      autoFocus
                    />
                    <div className="flex justify-end space-x-1">
                      <button
                        onClick={() => handleInlineAdd(dStr)}
                        className="text-[10px] bg-cyan-500 text-[#090a0f] font-bold px-2 py-1 rounded"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setInlineTaskInput({ date: dStr, title: '' })}
                    className="w-full py-1.5 rounded-lg border border-dashed border-[#1e2230] hover:border-cyan-500/50 text-[11px] text-slate-400 hover:text-cyan-400 flex items-center justify-center space-x-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add task</span>
                  </button>
                )}
              </div>

              <div className="pt-3 border-t border-[#1e2230] space-y-2 text-[10px] font-mono">
                <button
                  onClick={() => handleCopyYesterdayList(dStr)}
                  className="w-full text-left text-slate-500 hover:text-slate-300 flex items-center space-x-1 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy yesterday's list</span>
                </button>

                <div className="pt-2 border-t border-[#1e2230]/50 space-y-0.5">
                  <span className="text-slate-500 uppercase">MINDSET</span>
                  <div className="flex justify-between text-slate-400">
                    <span>Completed</span>
                    <span className="text-cyan-400 font-bold">{completedCount}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Not completed</span>
                    <span className="text-slate-500">{totalCount - completedCount}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
