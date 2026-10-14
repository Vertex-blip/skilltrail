export const STORAGE_KEY = 'skilltrail:v1';

export const programs = [
  {
    id: 'frontend', tag: 'BUILD', duration: '6 weeks', title: 'Frontend foundations',
    description: 'Go from a blank page to a responsive site you can explain and share.',
    tone: 'coral', icon: '⌘',
    weeks: [
      ['Set the stage', ['Define one small site to build', 'Learn semantic HTML', 'Sketch the page structure']],
      ['Shape the page', ['Learn CSS selectors and layout', 'Build a responsive navigation', 'Check the page on a phone']],
      ['Make it interactive', ['Learn JavaScript variables and events', 'Build one useful interaction', 'Handle invalid input']],
      ['Work with data', ['Store a preference in localStorage', 'Render a list from data', 'Add empty and error states']],
      ['Polish the experience', ['Check keyboard navigation', 'Improve contrast and labels', 'Ask someone to try the site']],
      ['Ship and reflect', ['Publish the site', 'Write a clear README', 'List the next three improvements']]
    ]
  },
  {
    id: 'design', tag: 'CREATE', duration: '6 weeks', title: 'Digital design practice',
    description: 'Develop a repeatable design process through weekly hands-on exercises.',
    tone: 'lavender', icon: '✳',
    weeks: [
      ['Observe with intent', ['Collect five useful interfaces', 'Annotate what makes each one clear', 'Choose a design problem']],
      ['Find the structure', ['Map one user journey', 'Sketch three layout ideas', 'Pick a direction and explain why']],
      ['Build a visual system', ['Choose a type scale', 'Create a small color palette', 'Define spacing and components']],
      ['Design key screens', ['Design the main screen', 'Design an empty state', 'Design one narrow-screen view']],
      ['Test with people', ['Prepare three tasks', 'Run two short usability sessions', 'Record what confused people']],
      ['Refine and share', ['Fix the biggest friction point', 'Write a short case study', 'Share the final screens']]
    ]
  },
  {
    id: 'writing', tag: 'WRITE', duration: '6 weeks', title: 'A writing habit',
    description: 'Turn ideas into a small collection of finished, readable pieces.',
    tone: 'mint', icon: '✎',
    weeks: [
      ['Find your voice', ['List ten topics you care about', 'Choose a reader for your work', 'Write one 300-word draft']],
      ['Make a routine', ['Choose two weekly writing slots', 'Draft two short pieces', 'Track where you get stuck']],
      ['Learn to revise', ['Rewrite one introduction', 'Cut unnecessary words', 'Read a piece aloud']],
      ['Write with evidence', ['Find two reliable sources', 'Check every factual claim', 'Link the sources clearly']],
      ['Get feedback', ['Share a draft with one reader', 'Ask what was unclear', 'Revise the central point']],
      ['Publish a collection', ['Finish three pieces', 'Choose titles and summaries', 'Reflect on what to write next']]
    ]
  }
];

export function makeTrack({ title, outcome, weeks, programId }, id = crypto.randomUUID()) {
  const program = programs.find(item => item.id === programId);
  const weekData = program
    ? program.weeks
    : Array.from({ length: Math.min(12, Math.max(1, Number(weeks) || 4)) }, (_, index) => [
      `Week ${index + 1}`, index === 0
        ? ['Define a concrete result for this week', 'Schedule one focused practice session']
        : ['Add a small milestone', 'Practice and record what you learned']
    ]);
  return {
    id,
    title: (program?.title || title || 'Untitled path').trim().slice(0, 80),
    outcome: (program?.description || outcome || '').trim().slice(0, 200),
    createdAt: new Date().toISOString(),
    weeks: weekData.map(([name, items], weekIndex) => ({
      id: `${id}-w${weekIndex}`,
      title: name,
      tasks: items.map((text, taskIndex) => ({ id: `${id}-w${weekIndex}-t${taskIndex}`, text, done: false }))
    }))
  };
}

export function progress(track) {
  const tasks = track.weeks.flatMap(week => week.tasks);
  const done = tasks.filter(task => task.done).length;
  return { done, total: tasks.length, percent: tasks.length ? Math.round(done / tasks.length * 100) : 0 };
}

export function updateTask(track, weekId, taskId, done) {
  return {
    ...track,
    weeks: track.weeks.map(week => week.id !== weekId ? week : {
      ...week,
      tasks: week.tasks.map(task => task.id === taskId ? { ...task, done } : task)
    })
  };
}

export function addTask(track, weekId, text, id = crypto.randomUUID()) {
  const clean = String(text).trim().slice(0, 160);
  if (!clean) return track;
  return {
    ...track,
    weeks: track.weeks.map(week => week.id !== weekId ? week : {
      ...week, tasks: [...week.tasks, { id, text: clean, done: false }]
    })
  };
}

export function removeTask(track, weekId, taskId) {
  return {
    ...track,
    weeks: track.weeks.map(week => week.id !== weekId ? week : {
      ...week, tasks: week.tasks.filter(task => task.id !== taskId)
    })
  };
}

export function validTrack(value) {
  return !!value && typeof value.id === 'string' && typeof value.title === 'string'
    && Array.isArray(value.weeks) && value.weeks.length <= 12
    && value.weeks.every(week => typeof week.id === 'string' && typeof week.title === 'string'
      && Array.isArray(week.tasks) && week.tasks.length <= 100
      && week.tasks.every(task => typeof task.id === 'string' && typeof task.text === 'string' && typeof task.done === 'boolean'));
}
