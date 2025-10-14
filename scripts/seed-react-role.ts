import { PrismaClient, QuestionDifficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function seedReactRole() {
  console.log('🌱 Seeding React.js Developer role and questions...');

  try {
    // 1. Create or update the React.js Developer role
    await prisma.interviewRole.upsert({
      where: { id: 'react-developer' },
      update: {
        title: 'React.js Developer',
        description: 'Technical interview for React.js developers with a mix of theoretical questions and hands-on coding challenges. Tests knowledge of React fundamentals, hooks, state management, and practical problem-solving skills.',
        duration: '45-60 min',
        difficulty: 'Intermediate',
        topics: [
          'React Fundamentals',
          'Hooks (useState, useEffect, useRef)',
          'State Management',
          'Component Design',
          'Event Handling',
          'API Integration',
          'Performance Optimization'
        ],
        isActive: true,
      },
      create: {
        id: 'react-developer',
        title: 'React.js Developer',
        description: 'Technical interview for React.js developers with a mix of theoretical questions and hands-on coding challenges. Tests knowledge of React fundamentals, hooks, state management, and practical problem-solving skills.',
        duration: '45-60 min',
        difficulty: 'Intermediate',
        topics: [
          'React Fundamentals',
          'Hooks (useState, useEffect, useRef)',
          'State Management',
          'Component Design',
          'Event Handling',
          'API Integration',
          'Performance Optimization'
        ],
        isActive: true,
      },
    });

    console.log('✅ React.js Developer role created/updated');

    // 2. Create React.js interview questions (mix of conversational and coding)
    const questions = [
      // Q1: Conversational - React Hooks Theory
      {
        id: 'react-q1-hooks-theory',
        roleId: 'react-developer',
        question: 'Can you explain the difference between useState and useRef hooks in React? When would you use one over the other?',
        answer: `useState is used for state that triggers component re-renders when updated. When you call the setter function from useState, React re-renders the component with the new state value. It's used for data that affects what the user sees on the screen.

useRef, on the other hand, creates a mutable reference that persists across renders without causing re-renders. The .current property can be updated without triggering a re-render. It's commonly used for:
1. Accessing DOM elements directly
2. Storing mutable values that don't need to trigger updates
3. Keeping track of previous values
4. Managing timers or intervals

Example: Use useState for form inputs that display on screen, use useRef to focus an input element or store a timer ID.`,
        correctCode: undefined,
        requiresCoding: false,
        codeLanguage: undefined,
        category: 'React Fundamentals',
        difficulty: QuestionDifficulty.EASY,
        order: 1,
        expectedTopics: [
          'useState',
          'useRef',
          're-rendering behavior',
          'DOM manipulation',
          'mutable references',
          'use cases'
        ],
        timeEstimate: 3,
        evaluationCriteria: undefined,
        isActive: true,
      },

      // Q2: Coding Challenge - Counter Component
      {
        id: 'react-q2-counter-coding',
        roleId: 'react-developer',
        question: `Great! Now let's move to a hands-on coding challenge.

Build a Counter component with the following features:
• Display a count starting at 0
• Button to increment the count by 1
• Button to decrement the count by 1
• Button to reset the count back to 0

Make sure your component is functional and uses React hooks.`,
        answer: undefined,
        correctCode: `import React, { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', textAlign: 'center' }}>
      <h1>Counter App</h1>
      <h2 style={{ fontSize: '48px', margin: '20px 0' }}>Count: {count}</h2>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          onClick={() => setCount(count + 1)}
          style={{ padding: '10px 20px', fontSize: '16px' }}
        >
          Increment
        </button>
        <button 
          onClick={() => setCount(count - 1)}
          style={{ padding: '10px 20px', fontSize: '16px' }}
        >
          Decrement
        </button>
        <button 
          onClick={() => setCount(0)}
          style={{ padding: '10px 20px', fontSize: '16px' }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}`,
        requiresCoding: true,
        codeLanguage: 'javascript',
        category: 'Coding Challenge',
        difficulty: QuestionDifficulty.EASY,
        order: 2,
        expectedTopics: [
          'useState hook',
          'event handlers',
          'functional component',
          'JSX syntax',
          'state updates'
        ],
        timeEstimate: 5,
        evaluationCriteria: {
          mustHave: [
            'useState hook implementation',
            'Three working buttons (increment, decrement, reset)',
            'Proper event handlers',
            'Display current count value',
            'Functional component structure'
          ],
          shouldHave: [
            'Clean code structure',
            'Semantic HTML elements',
            'Clear button labels',
            'Proper state initialization'
          ],
          bonus: [
            'TypeScript types',
            'Accessibility attributes (aria-labels)',
            'Styled components or CSS modules',
            'Prevent count from going below 0',
            'Add max/min limits'
          ]
        },
        isActive: true,
      },

      // Q3: Conversational - useEffect Theory
      {
        id: 'react-q3-useeffect-theory',
        roleId: 'react-developer',
        question: 'Excellent work on the counter! Now, can you explain what useEffect does and when would you use it with an empty dependency array versus no dependency array at all?',
        answer: `useEffect is a React hook that lets you perform side effects in functional components. Side effects include data fetching, subscriptions, manually changing the DOM, timers, etc.

The dependency array controls when the effect runs:

1. **With empty dependency array []**: The effect runs only ONCE after the initial render, similar to componentDidMount in class components. This is useful for:
   - Initial data fetching
   - Setting up subscriptions
   - One-time setup operations

2. **Without dependency array**: The effect runs after EVERY render (initial + all updates). This is usually NOT desired because:
   - Can cause performance issues
   - May lead to infinite loops if the effect updates state
   - Generally not a common use case

Example:
\`\`\`javascript
// Runs once on mount
useEffect(() => {
  fetchUserData();
}, []);

// Runs on every render (usually avoid this)
useEffect(() => {
  console.log('Component rendered');
});
\`\`\`

Without cleanup, these resources would continue running even after the component unmounts, causing memory leaks and potential bugs.`,
        correctCode: undefined,
        requiresCoding: false,
        codeLanguage: undefined,
        category: 'React Fundamentals',
        difficulty: QuestionDifficulty.MEDIUM,
        order: 3,
        expectedTopics: [
          'useEffect',
          'dependency array',
          'component lifecycle',
          'side effects',
          'performance implications',
          'best practices'
        ],
        timeEstimate: 3,
        evaluationCriteria: undefined,
        isActive: true,
      },

      // Q4: Coding Challenge - Todo List
      {
        id: 'react-q4-todo-list',
        roleId: 'react-developer',
        question: `Perfect! Let's tackle a more complex coding challenge.

Build a Todo List component with these features:
• Input field to add new todos
• Display a list of all todos
• Checkbox next to each todo to mark it as complete (with strike-through styling)
• Delete button for each todo
• Display counters showing total todos and completed todos

Focus on proper state management and user experience.`,
        answer: undefined,
        correctCode: `import React, { useState } from 'react';

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([
        ...todos,
        { id: Date.now(), text: input, completed: false }
      ]);
      setInput('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h1>Todo List</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new todo..."
          style={{ padding: '10px', width: '70%', fontSize: '16px' }}
        />
        <button 
          onClick={addTodo}
          style={{ padding: '10px 20px', marginLeft: '10px', fontSize: '16px' }}
        >
          Add
        </button>
      </div>

      <p style={{ color: '#666', marginBottom: '10px' }}>
        Total: {todos.length} | Completed: {completedCount}
      </p>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map((todo) => (
          <li
            key={todo.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px',
              borderBottom: '1px solid #ddd',
              gap: '10px'
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span
              style={{
                flex: 1,
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? '#888' : '#000'
              }}
            >
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              style={{ padding: '5px 10px', fontSize: '14px' }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {todos.length === 0 && (
        <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>
          No todos yet. Add one above!
        </p>
      )}
    </div>
  );
}`,
        requiresCoding: true,
        codeLanguage: 'javascript',
        category: 'Coding Challenge',
        difficulty: QuestionDifficulty.MEDIUM,
        order: 4,
        expectedTopics: [
          'useState for arrays',
          'array methods (map, filter)',
          'conditional rendering',
          'event handlers',
          'immutable state updates',
          'unique keys in lists',
          'controlled inputs'
        ],
        timeEstimate: 15,
        evaluationCriteria: {
          mustHave: [
            'Add new todos functionality',
            'Display list of todos',
            'Toggle completion with checkbox',
            'Delete todos',
            'Show total and completed counts',
            'Proper state management',
            'Unique keys for list items'
          ],
          shouldHave: [
            'Input validation (trim empty strings)',
            'Clear input after adding',
            'Strike-through styling for completed todos',
            'Enter key support for adding todos',
            'Good UI/UX design'
          ],
          bonus: [
            'Empty state message',
            'localStorage persistence',
            'Edit todo functionality',
            'Filter todos (all/active/completed)',
            'Animations for add/delete',
            'TypeScript types',
            'Custom hooks extraction'
          ]
        },
        isActive: true,
      },

      // Q5: Conversational - Component Lifecycle
      {
        id: 'react-q5-cleanup-theory',
        roleId: 'react-developer',
        question: 'Great job on the todo list! One more theoretical question: Why is it important to return a cleanup function from useEffect? Can you give an example of when you would need this?',
        answer: `Returning a cleanup function from useEffect is crucial for preventing memory leaks and unwanted side effects when a component unmounts or before the effect runs again.

**Why it's important:**
1. **Memory leaks prevention**: Clean up subscriptions, timers, event listeners
2. **Avoid stale closures**: Prevent callbacks from referencing old state/props
3. **Resource management**: Close connections, cancel API requests, clean up resources

**Common use cases:**

1. **Event Listeners:**
\`\`\`javascript
useEffect(() => {
  const handleResize = () => console.log(window.innerWidth);
  window.addEventListener('resize', handleResize);
  
  return () => window.removeEventListener('resize', handleResize);
}, []);
\`\`\`

2. **Timers:**
\`\`\`javascript
useEffect(() => {
  const timer = setInterval(() => setCount(c => c + 1), 1000);
  
  return () => clearInterval(timer);
}, []);
\`\`\`

3. **Subscriptions/WebSockets:**
\`\`\`javascript
useEffect(() => {
  const subscription = dataSource.subscribe();
  
  return () => subscription.unsubscribe();
}, []);
\`\`\`

Without cleanup, these resources would continue running even after the component unmounts, causing memory leaks and potential bugs.`,
        correctCode: undefined,
        requiresCoding: false,
        codeLanguage: undefined,
        category: 'React Fundamentals',
        difficulty: QuestionDifficulty.MEDIUM,
        order: 5,
        expectedTopics: [
          'useEffect cleanup',
          'memory leaks',
          'component unmounting',
          'event listeners',
          'timers',
          'subscriptions',
          'best practices'
        ],
        timeEstimate: 3,
        evaluationCriteria: undefined,
        isActive: true,
      },
    ];

    // Insert all questions
    for (const question of questions) {
      await prisma.interviewQuestion.upsert({
        where: { id: question.id },
        update: question,
        create: question,
      });
      console.log(`✅ Created/Updated question: ${question.id}`);
    }

    console.log('\n🎉 React.js Developer role and questions seeded successfully!');
    console.log(`📊 Total questions: ${questions.length}`);
    console.log(`   - Conversational: ${questions.filter(q => !q.requiresCoding).length}`);
    console.log(`   - Coding challenges: ${questions.filter(q => q.requiresCoding).length}`);
    
  } catch (error) {
    console.error('❌ Error seeding React role:', error);
    throw error;
  }
}

// Run the seed
seedReactRole()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
