import React, { useState, useEffect, useRef } from 'react';
import { LiveKitRoom, useVoiceAssistant, RoomAudioRenderer, useRoomContext } from '@livekit/components-react';
import '@livekit/components-styles';

const VOICE_OPTIONS = [
  { value: 'default', label: 'Default Voice', flag: '🎙️' },
  { value: 'en-male', label: 'British Male', flag: '🇬🇧' },
  { value: 'en-female', label: 'American Female', flag: '🇺🇸' },
];

// Todo List Component
function TodoList({ todos, onComplete, onDelete }) {
  if (todos.length === 0) {
    return (
      <div style={{
        padding: '1.5rem',
        textAlign: 'center',
        color: '#666',
        fontSize: '0.85rem',
      }}>
        No todos yet. Try saying "add todo buy milk"
      </div>
    );
  }

  return (
    <div
      className="todo-scroll"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingRight: '4px',
        width: '100%',
        minWidth: 0,
      }}>
      {todos.map((todo, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 0.75rem',
            backgroundColor: todo.completed ? 'rgba(20, 20, 20, 0.4)' : 'rgba(30, 30, 30, 0.6)',
            borderRadius: '8px',
            border: '1px solid oklch(0.806 0.139 216.34 / 0.15)',
            transition: 'all 0.2s ease',
            width: '100%',
            minWidth: 0,
            boxSizing: 'border-box',
          }}
        >
          <button
            onClick={() => onComplete(index)}
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              border: todo.completed ? 'none' : '2px solid oklch(0.806 0.139 216.34 / 0.4)',
              backgroundColor: todo.completed ? 'oklch(0.806 0.139 216.34)' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#000',
              flexShrink: 0,
              transition: 'all 0.2s ease',
              boxShadow: todo.completed ? '0 0 10px oklch(0.806 0.139 216.34 / 0.5)' : 'none',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            {todo.completed && '✓'}
          </button>

          <span style={{
            flex: 1,
            color: todo.completed ? '#666' : '#e0e0e0',
            textDecoration: todo.completed ? 'line-through' : 'none',
            fontSize: '0.85rem',
            lineHeight: '1.4',
            wordBreak: 'break-word',
            minWidth: 0,
            overflow: 'hidden',
          }}>
            {todo.task}
          </span>

          <button
            onClick={() => onDelete(index)}
            style={{
              padding: '0.25rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1.1rem',
              opacity: 0.4,
              transition: 'opacity 0.2s ease',
              flexShrink: 0,
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '0.4';
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// Premium Soundbar Wave Visualization
function SoundbarVisualizer({ state }) {
  const containerRef = useRef(null);
  const barsRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const barCount = window.innerWidth < 768 ? 21 : 31; // Odd number for symmetry
    const bars = [];

    // Clear previous bars
    container.innerHTML = '';

    // Create symmetrical soundwave pattern
    const center = Math.floor(barCount / 2);

    for (let i = 0; i < barCount; i++) {
      const bar = document.createElement('div');
      const distanceFromCenter = Math.abs(i - center);

      // Create wave-like pattern: taller in center, shorter at edges
      const baseHeight = 70 - (distanceFromCenter * 2.5); // Decreases towards edges

      bar.style.cssText = `
        width: 4px;
        background: oklch(0.806 0.139 216.34);
        border-radius: 2px;
        transition: height 0.12s ease-out, opacity 0.12s ease-out;
        height: ${baseHeight}%;
        opacity: 0.7;
        box-shadow: 0 0 8px oklch(0.806 0.139 216.34 / 0.4);
      `;

      container.appendChild(bar);
      bars.push({
        element: bar,
        index: i,
        center,
        distanceFromCenter,
        baseHeight,
        targetHeight: baseHeight,
        currentHeight: baseHeight,
      });
    }

    barsRef.current = bars;

    const animate = () => {
      const isActive = state === 'speaking' || state === 'listening';

      bars.forEach((bar) => {
        // More variation in center bars, less on edges
        const variationFactor = 1 - (bar.distanceFromCenter / bar.center) * 0.6;
        const changeChance = isActive ? 0.1 * variationFactor : 0.03;

        if (Math.random() < changeChance) {
          if (isActive) {
            // Active: dramatic movement, especially in center
            const maxVariation = 40 * variationFactor;
            bar.targetHeight = bar.baseHeight + (Math.random() - 0.5) * maxVariation;
            bar.targetHeight = Math.max(15, Math.min(95, bar.targetHeight)); // Clamp
          } else {
            // Idle: subtle breathing effect
            const maxVariation = 15 * variationFactor;
            bar.targetHeight = bar.baseHeight + (Math.random() - 0.5) * maxVariation;
            bar.targetHeight = Math.max(20, Math.min(bar.baseHeight + 10, bar.targetHeight));
          }
        }

        // Smooth interpolation
        bar.currentHeight += (bar.targetHeight - bar.currentHeight) * 0.18;
        bar.element.style.height = `${bar.currentHeight}%`;

        // Opacity varies with height for depth effect
        const opacity = isActive
          ? 0.6 + (bar.currentHeight / 100) * 0.4
          : 0.4 + (bar.currentHeight / 100) * 0.35;
        bar.element.style.opacity = opacity;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        gap: window.innerWidth < 768 ? '2px' : '3px',
        padding: '0 10px',
      }}
    />
  );
}

// Bouncing Wave Visualization
function WaveVisualizer({ state }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const phaseRef = useRef(0);
  const amplitudeRef = useRef(0);
  const targetAmplitudeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const isActive = state === 'speaking' || state === 'listening';

      // Target amplitude based on state
      targetAmplitudeRef.current = isActive ? 35 : 8;

      // Smooth amplitude transition
      amplitudeRef.current += (targetAmplitudeRef.current - amplitudeRef.current) * 0.1;

      const frequency = 0.02;
      const speed = isActive ? 0.08 : 0.03;

      phaseRef.current += speed;

      // Draw multiple wave layers
      const layers = [
        { offset: 0, opacity: 0.3, width: 2 },
        { offset: Math.PI / 2, opacity: 0.5, width: 2.5 },
        { offset: Math.PI, opacity: 0.7, width: 3 },
      ];

      layers.forEach(layer => {
        ctx.beginPath();
        ctx.strokeStyle = `oklch(0.806 0.139 216.34 / ${layer.opacity})`;
        ctx.lineWidth = layer.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let x = 0; x < rect.width; x += 2) {
          const y = rect.height / 2 +
            Math.sin(x * frequency + phaseRef.current + layer.offset) * amplitudeRef.current +
            Math.sin(x * frequency * 2.3 + phaseRef.current * 1.3) * (amplitudeRef.current / 2.5);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        touchAction: 'none',
      }}
    />
  );
}

// Voice Assistant Interface with RPC
function VoiceAssistantInterface() {
  const { state } = useVoiceAssistant();
  const [visualizationType, setVisualizationType] = useState('bars');

  // Multiple lists state with localStorage
  const [todoLists, setTodoLists] = useState(() => {
    const saved = localStorage.getItem('voiceTodoLists');
    return saved ? JSON.parse(saved) : { 'Personal': [] };
  });
  const [currentList, setCurrentList] = useState(() => {
    const saved = localStorage.getItem('voiceTodoCurrentList');
    return saved || 'Personal';
  });

  const todoListsRef = useRef(todoLists);
  const currentListRef = useRef(currentList);
  const tabContainerRef = useRef(null);
  const activeTabRef = useRef(null);
  const handlersRegisteredRef = useRef(false);
  const room = useRoomContext();

  // Keep refs in sync with state
  useEffect(() => {
    todoListsRef.current = todoLists;
  }, [todoLists]);

  useEffect(() => {
    currentListRef.current = currentList;
  }, [currentList]);

  // Scroll active tab into view when current list changes
  useEffect(() => {
    if (activeTabRef.current && tabContainerRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentList]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('voiceTodoLists', JSON.stringify(todoLists));
  }, [todoLists]);

  useEffect(() => {
    localStorage.setItem('voiceTodoCurrentList', currentList);
  }, [currentList]);

  // Get current todos
  const todos = todoLists[currentList] || [];

  useEffect(() => {
    if (!room || handlersRegisteredRef.current) return;

    // Register RPC handlers for todo operations
    room.localParticipant.registerRpcMethod('addTodo', async (data) => {
      const { task, listName } = JSON.parse(data.payload);
      const targetList = listName || currentListRef.current;
      setTodoLists(prev => ({
        ...prev,
        [targetList]: [...(prev[targetList] || []), { task, completed: false }]
      }));
      return '';
    });

    room.localParticipant.registerRpcMethod('getTodos', async () => {
      // Return current list todos
      const currentTodos = todoListsRef.current[currentListRef.current] || [];
      return JSON.stringify(currentTodos);
    });

    room.localParticipant.registerRpcMethod('completeTodo', async (data) => {
      const { index } = JSON.parse(data.payload);
      const listName = currentListRef.current;
      setTodoLists(prev => ({
        ...prev,
        [listName]: prev[listName].map((todo, i) =>
          i === index ? { ...todo, completed: !todo.completed } : todo
        )
      }));
      return '';
    });

    room.localParticipant.registerRpcMethod('deleteTodo', async (data) => {
      const { index } = JSON.parse(data.payload);
      const listName = currentListRef.current;
      setTodoLists(prev => ({
        ...prev,
        [listName]: prev[listName].filter((_, i) => i !== index)
      }));
      return '';
    });

    room.localParticipant.registerRpcMethod('clearCompleted', async () => {
      const listName = currentListRef.current;
      setTodoLists(prev => ({
        ...prev,
        [listName]: prev[listName].filter(todo => !todo.completed)
      }));
      return '';
    });

    room.localParticipant.registerRpcMethod('moveTodo', async (data) => {
      const { fromIndex, toIndex } = JSON.parse(data.payload);
      const listName = currentListRef.current;
      setTodoLists(prev => {
        const newTodos = [...prev[listName]];
        const [movedItem] = newTodos.splice(fromIndex, 1);
        newTodos.splice(toIndex, 0, movedItem);
        return {
          ...prev,
          [listName]: newTodos
        };
      });
      return '';
    });

    room.localParticipant.registerRpcMethod('createList', async (data) => {
      const { listName } = JSON.parse(data.payload);
      setTodoLists(prev => {
        if (prev[listName]) {
          return prev; // List already exists
        }
        return { ...prev, [listName]: [] };
      });
      // Switch to the newly created list
      if (!todoListsRef.current[listName]) {
        setCurrentList(listName);
      }
      return JSON.stringify({ success: true, listName });
    });

    room.localParticipant.registerRpcMethod('switchList', async (data) => {
      const { listName } = JSON.parse(data.payload);
      if (todoListsRef.current[listName]) {
        setCurrentList(listName);
        return JSON.stringify({ success: true, listName });
      }
      return JSON.stringify({ success: false, error: 'List not found' });
    });

    room.localParticipant.registerRpcMethod('getListNames', async () => {
      const listNames = Object.keys(todoListsRef.current);
      return JSON.stringify({ lists: listNames, current: currentListRef.current });
    });

    room.localParticipant.registerRpcMethod('deleteList', async (data) => {
      const { listName } = JSON.parse(data.payload);
      if (listName === 'Personal') {
        return JSON.stringify({ success: false, error: 'Cannot delete Personal list' });
      }
      setTodoLists(prev => {
        const newLists = { ...prev };
        delete newLists[listName];
        return newLists;
      });
      if (currentListRef.current === listName) {
        setCurrentList('Personal');
      }
      return JSON.stringify({ success: true });
    });

    // Mark handlers as registered
    handlersRegisteredRef.current = true;
  }, [room]);

  const handleComplete = (index) => {
    setTodoLists(prev => ({
      ...prev,
      [currentList]: prev[currentList].map((todo, i) =>
        i === index ? { ...todo, completed: !todo.completed } : todo
      )
    }));
  };

  const handleDelete = (index) => {
    setTodoLists(prev => ({
      ...prev,
      [currentList]: prev[currentList].filter((_, i) => i !== index)
    }));
  };

  const handleAddList = () => {
    const listName = prompt('Enter new list name:');
    if (listName && listName.trim()) {
      const trimmedName = listName.trim();
      if (!todoLists[trimmedName]) {
        setTodoLists(prev => ({ ...prev, [trimmedName]: [] }));
        setCurrentList(trimmedName);
      } else {
        alert('A list with this name already exists');
      }
    }
  };

  const handleDeleteList = (listName) => {
    if (listName === 'Personal') {
      alert('Cannot delete the Personal list');
      return;
    }
    if (confirm(`Are you sure you want to delete "${listName}"?`)) {
      setTodoLists(prev => {
        const newLists = { ...prev };
        delete newLists[listName];
        return newLists;
      });
      if (currentList === listName) {
        setCurrentList('Personal');
      }
    }
  };

  const scrollTabs = (direction) => {
    if (tabContainerRef.current) {
      const scrollAmount = 150;
      tabContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'clamp(1rem, 3vw, 1.5rem)',
      padding: 'clamp(0.75rem, 2vw, 1.5rem)',
      width: '100%',
      maxWidth: '100%',
      height: '100%',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      {/* Status and Visualization Column */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'clamp(1rem, 3vw, 1.5rem)',
        flexShrink: 0,
      }}>
        {/* Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
          fontWeight: '600',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: state === 'speaking' ? 'oklch(0.806 0.139 216.34)' :
                 state === 'listening' ? 'oklch(0.806 0.139 216.34)' : '#999',
        }}>
          <div style={{
            width: 'clamp(8px, 2vw, 10px)',
            height: 'clamp(8px, 2vw, 10px)',
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            boxShadow: state === 'idle' ? 'none' : '0 0 20px currentColor',
            animation: state === 'idle' ? 'none' : 'pulse 2s ease-in-out infinite',
          }} />
          {state === 'speaking' ? 'Assistant Speaking' :
           state === 'listening' ? 'Listening' : 'Ready'}
        </div>

        {/* Visualization */}
        <div style={{
          width: '100%',
          maxWidth: 'min(600px, 100%)',
          height: 'clamp(80px, 15vh, 100px)',
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: '#000',
          border: '1px solid oklch(0.806 0.139 216.34 / 0.3)',
          boxShadow: '0 0 30px oklch(0.806 0.139 216.34 / 0.1)',
          boxSizing: 'border-box',
        }}>
          {visualizationType === 'bars' ? (
            <SoundbarVisualizer state={state} />
          ) : (
            <WaveVisualizer state={state} />
          )}
        </div>

        <button
          onClick={() => setVisualizationType(prev => prev === 'bars' ? 'wave' : 'bars')}
          style={{
            padding: 'clamp(0.65rem, 2vw, 0.85rem) clamp(1.25rem, 3vw, 1.75rem)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid oklch(0.806 0.139 216.34 / 0.3)',
            borderRadius: '100px',
            color: '#e0e0e0',
            fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
            fontWeight: '600',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            minHeight: '40px',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'oklch(0.806 0.139 216.34 / 0.15)';
            e.target.style.borderColor = 'oklch(0.806 0.139 216.34 / 0.5)';
            e.target.style.color = 'oklch(0.806 0.139 216.34)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.target.style.borderColor = 'oklch(0.806 0.139 216.34 / 0.3)';
            e.target.style.color = '#e0e0e0';
          }}
        >
          {visualizationType === 'bars' ? '〰️ Wave' : '📊 Bars'}
        </button>
      </div>

      {/* Todo List Section */}
      <div style={{
        backgroundColor: 'rgba(15, 15, 15, 0.8)',
        borderRadius: '16px',
        border: '1px solid oklch(0.806 0.139 216.34 / 0.3)',
        padding: 'clamp(0.75rem, 2.5vw, 1.25rem)',
        maxWidth: 'min(600px, 100%)',
        width: '100%',
        margin: '0 auto',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 0 30px oklch(0.806 0.139 216.34 / 0.1)',
        boxSizing: 'border-box',
      }}>
        {/* Tabs Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.75rem',
          flexShrink: 0,
        }}>
          <button
            onClick={() => scrollTabs('left')}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid oklch(0.806 0.139 216.34 / 0.3)',
              backgroundColor: 'rgba(30, 30, 30, 0.6)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'oklch(0.806 0.139 216.34 / 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(30, 30, 30, 0.6)';
            }}
          >
            ‹
          </button>

          <div
            ref={tabContainerRef}
            style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              flex: 1,
              alignItems: 'center',
            }}
            className="tab-scroll"
          >
            {Object.keys(todoLists).map((listName) => (
              <div
                key={listName}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  flexShrink: 0,
                }}
              >
                <button
                  ref={listName === currentList ? activeTabRef : null}
                  onClick={() => setCurrentList(listName)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: listName === currentList
                      ? '1px solid oklch(0.806 0.139 216.34)'
                      : '1px solid oklch(0.806 0.139 216.34 / 0.3)',
                    backgroundColor: listName === currentList
                      ? 'oklch(0.806 0.139 216.34 / 0.2)'
                      : 'rgba(30, 30, 30, 0.6)',
                    color: listName === currentList ? 'oklch(0.806 0.139 216.34)' : '#ccc',
                    fontSize: '0.85rem',
                    fontWeight: listName === currentList ? '600' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    if (listName !== currentList) {
                      e.target.style.borderColor = 'oklch(0.806 0.139 216.34 / 0.5)';
                      e.target.style.color = '#fff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (listName !== currentList) {
                      e.target.style.borderColor = 'oklch(0.806 0.139 216.34 / 0.3)';
                      e.target.style.color = '#ccc';
                    }
                  }}
                >
                  {listName}
                </button>
                {listName !== 'Personal' && (
                  <button
                    onClick={() => handleDeleteList(listName)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      border: '1px solid oklch(0.806 0.139 216.34 / 0.3)',
                      backgroundColor: 'rgba(30, 30, 30, 0.6)',
                      color: '#999',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
                      e.target.style.color = '#ff4444';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'rgba(30, 30, 30, 0.6)';
                      e.target.style.color = '#999';
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => scrollTabs('right')}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid oklch(0.806 0.139 216.34 / 0.3)',
              backgroundColor: 'rgba(30, 30, 30, 0.6)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'oklch(0.806 0.139 216.34 / 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(30, 30, 30, 0.6)';
            }}
          >
            ›
          </button>

          <button
            onClick={handleAddList}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid oklch(0.806 0.139 216.34 / 0.3)',
              backgroundColor: 'rgba(30, 30, 30, 0.6)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'oklch(0.806 0.139 216.34 / 0.2)';
              e.target.style.borderColor = 'oklch(0.806 0.139 216.34)';
              e.target.style.color = 'oklch(0.806 0.139 216.34)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(30, 30, 30, 0.6)';
              e.target.style.borderColor = 'oklch(0.806 0.139 216.34 / 0.3)';
              e.target.style.color = '#fff';
            }}
          >
            +
          </button>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
          flexShrink: 0,
        }}>
          <h2 style={{
            margin: 0,
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            fontWeight: '400',
            color: '#fff',
            letterSpacing: '0.02em',
          }}>
            {currentList}
          </h2>
          <span style={{
            fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
            color: '#999',
            fontWeight: '500',
          }}>
            {todos.filter(t => !t.completed).length} / {todos.length}
          </span>
        </div>

        <TodoList
          todos={todos}
          onComplete={handleComplete}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

// Main App
// About Page Component
function AboutPage({ onBack }) {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
    }}>
      <div style={{
        maxWidth: '800px',
        width: '100%',
        textAlign: 'center',
      }}>
       
        <div
          className="animation-container"
          style={{
          backgroundColor: 'rgba(30, 30, 30, 0.6)',
          borderRadius: '16px',
          padding: 'clamp(0rem, 4vw, 3rem)',
          marginBottom: '2rem',
        }}>
          <video
            autoPlay
            muted
            playsInline
            style={{
              width: '100%',
              maxWidth: '800px',
              borderRadius: '8px',
              display: 'block',
            }}
          >
            <source src="/animation.mp4" type="video/mp4" />
          </video>
        </div>

        <button
          onClick={onBack}
          style={{
            padding: 'clamp(0.6rem, 2vw, 0.7rem) clamp(1.15rem, 3vw, 1.75rem)',
            backgroundColor: 'transparent',
            border: '1px solid oklch(0.806 0.139 216.34)',
            borderRadius: '100px',
            color: 'oklch(0.806 0.139 216.34)',
            fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minHeight: '40px',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'oklch(0.806 0.139 216.34 / 0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          Back to App
        </button>
      </div>

      <style>{`
        .animation-container {
          border: none;
        }

        @media (min-width: 768px) {
          .animation-container {
            border: 1px solid oklch(0.806 0.139 216.34 / 0.2);
          }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const [selectedVoice, setSelectedVoice] = useState('default');
  const [token, setToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const tooltipTimeoutRef = useRef(null);

  const connectToRoom = async () => {
    setIsConnecting(true);
    
    try {
      const response = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: `room-${Date.now()}`,
          participantName: 'User',
          metadata: JSON.stringify({ voice: selectedVoice }),
        }),
      });
      
      const data = await response.json();
      setToken(data.token);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect:', error);
      alert('Failed to connect. Make sure token server is running.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setToken('');
    setIsConnected(false);
  };

  // Show About page
  if (showAbout) {
    return <AboutPage onBack={() => setShowAbout(false)} />;
  }

  if (isConnected && token) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <style>{`
          * {
            box-sizing: border-box;
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }

          .todo-scroll::-webkit-scrollbar {
            width: 6px;
          }

          .todo-scroll::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 3px;
          }

          .todo-scroll::-webkit-scrollbar-thumb {
            background: oklch(0.806 0.139 216.34 / 0.4);
            border-radius: 3px;
          }

          .todo-scroll::-webkit-scrollbar-thumb:hover {
            background: oklch(0.806 0.139 216.34 / 0.6);
          }

          .tab-scroll::-webkit-scrollbar {
            display: none;
          }

          .tab-scroll {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        
        <LiveKitRoom
          token={token}
          serverUrl={import.meta.env.VITE_LIVEKIT_URL}
          connect={true}
          audio={true}
          style={{ height: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          <div style={{
            padding: 'clamp(0.75rem, 2vw, 1.25rem)',
            borderBottom: '1px solid oklch(0.806 0.139 216.34 / 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            boxSizing: 'border-box',
          }}>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: 'clamp(1.15rem, 3.5vw, 1.4rem)',
                fontWeight: '300',
                color: '#fff',
                letterSpacing: '0.02em',
              }}>
                Voice Assistant
              </h1>
              <p style={{
                margin: '0.4rem 0 0',
                fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
                color: '#999',
              }}>
                {VOICE_OPTIONS.find(v => v.value === selectedVoice)?.label}
              </p>
            </div>

            <button
              onClick={disconnect}
              style={{
                padding: 'clamp(0.6rem, 2vw, 0.7rem) clamp(1.15rem, 3vw, 1.75rem)',
                backgroundColor: 'transparent',
                border: '1px solid rgb(255, 117, 102)',
                borderRadius: '100px',
                color: 'rgb(255, 117, 102)',
                fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minHeight: '40px',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 117, 102, 0.15)';
                e.target.style.borderColor = 'rgb(255, 117, 102)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = 'rgb(255, 117, 102)';
              }}
            >
              Disconnect
            </button>
          </div>

          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto',
            width: '100%',
            boxSizing: 'border-box',
          }}>
            <VoiceAssistantInterface />
          </div>

          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
      display: 'flex',
      flexDirection: 'column',
      padding: 'clamp(1rem, 3vw, 2rem)',
    }}>
      <style>{`
        * {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }
        body {
          margin: 0;
          -webkit-font-smoothing: antialiased;
        }
      `}</style>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
        width: '100%',
        maxWidth: '450px',
        backgroundColor: 'rgba(15, 15, 15, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: 'clamp(18px, 4vw, 22px)',
        border: '1px solid oklch(0.806 0.139 216.34 / 0.3)',
        padding: 'clamp(1.75rem, 4vw, 2.75rem)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px oklch(0.806 0.139 216.34 / 0.15)',
      }}>
        <h1 style={{
          margin: '0 0 0.4rem',
          fontSize: 'clamp(1.6rem, 4.5vw, 1.9rem)',
          fontWeight: '300',
          color: '#fff',
          textAlign: 'center',
        }}>
          Voice Assistant
        </h1>

        <p style={{
          margin: '0 0 clamp(1.75rem, 4vw, 2.75rem)',
          fontSize: 'clamp(0.85rem, 2.3vw, 0.92rem)',
          color: '#999',
          textAlign: 'center',
        }}>
          Manage your todos with voice commands or just chat
        </p>

        <div style={{ marginBottom: 'clamp(1.4rem, 3.5vw, 1.9rem)' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.7rem',
            fontSize: 'clamp(0.68rem, 1.8vw, 0.73rem)',
            fontWeight: '700',
            color: '#999',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            Voice
          </label>

          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            style={{
              width: '100%',
              padding: 'clamp(0.85rem, 2.3vw, 0.95rem) clamp(0.95rem, 2.8vw, 1.15rem)',
              backgroundColor: 'rgba(30, 30, 30, 0.8)',
              border: '1px solid oklch(0.806 0.139 216.34 / 0.3)',
              borderRadius: '11px',
              color: '#fff',
              fontSize: 'clamp(0.88rem, 2.3vw, 0.96rem)',
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23ffffff' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right clamp(0.95rem, 2.8vw, 1.15rem) center',
              minHeight: '42px',
            }}
          >
            {VOICE_OPTIONS.map(voice => (
              <option key={voice.value} value={voice.value} style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>
                {voice.flag} {voice.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={connectToRoom}
          disabled={isConnecting}
          style={{
            width: '100%',
            padding: 'clamp(0.95rem, 2.8vw, 1.15rem)',
            backgroundColor: isConnecting ? 'rgba(255, 255, 255, 0.1)' : 'oklch(0.806 0.139 216.34)',
            border: 'none',
            borderRadius: '11px',
            color: isConnecting ? '#666' : '#000',
            fontSize: 'clamp(0.88rem, 2.3vw, 0.96rem)',
            fontWeight: '700',
            letterSpacing: '0.05em',
            cursor: isConnecting ? 'not-allowed' : 'pointer',
            textTransform: 'uppercase',
            minHeight: '48px',
            transition: 'all 0.2s ease',
            boxShadow: isConnecting ? 'none' : '0 0 20px oklch(0.806 0.139 216.34 / 0.3)',
          }}
          onMouseEnter={(e) => {
            if (!isConnecting) {
              e.target.style.backgroundColor = 'oklch(0.85 0.15 216.34)';
              e.target.style.boxShadow = '0 0 30px oklch(0.806 0.139 216.34 / 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isConnecting) {
              e.target.style.backgroundColor = 'oklch(0.806 0.139 216.34)';
              e.target.style.boxShadow = '0 0 20px oklch(0.806 0.139 216.34 / 0.3)';
            }
          }}
        >
          {isConnecting ? 'Connecting...' : 'Connect'}
        </button>

        {/* Powered by logo */}
        <div style={{
          marginTop: 'clamp(1.5rem, 4vw, 2rem)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          position: 'relative',
        }}>
          <span style={{
            fontSize: 'clamp(0.7rem, 1.8vw, 0.75rem)',
            color: '#666',
            fontWeight: '500',
            letterSpacing: '0.05em',
          }}>
            Powered by
          </span>
          <img
            src="/logo_rr.png"
            alt="RRSD Logo"
            style={{
              height: 'clamp(30px, 6vw, 40px)',
              opacity: 0.8,
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              transform: showTooltip ? 'scale(1.05)' : 'scale(1)',
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '1';
              e.target.style.filter = 'drop-shadow(0 0 8px oklch(0.806 0.139 216.34 / 0.4))';
              setShowTooltip(true);
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '0.8';
              e.target.style.filter = 'none';
              setShowTooltip(false);
            }}
            onClick={() => {
              // Clear any existing timeout
              if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current);
              }

              // Show tooltip
              setShowTooltip(true);

              // Hide after 3 seconds
              tooltipTimeoutRef.current = setTimeout(() => {
                setShowTooltip(false);
              }, 3000);
            }}
            onTouchStart={() => {
              // Clear any existing timeout
              if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current);
              }

              // Show tooltip
              setShowTooltip(true);

              // Hide after 3 seconds
              tooltipTimeoutRef.current = setTimeout(() => {
                setShowTooltip(false);
              }, 3000);
            }}
          />

          {/* Tooltip */}
          {showTooltip && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              marginBottom: '0.5rem',
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              color: '#fff',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
              whiteSpace: 'nowrap',
              border: '1px solid oklch(0.806 0.139 216.34 / 0.4)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
              animation: 'fadeIn 0.2s ease',
              pointerEvents: 'none',
              zIndex: 1000,
            }}>
              Robert Roksela Software Development
            </div>
          )}
        </div>

        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(5px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
        </div>
      </div>

      {/* About link */}
      <div style={{
        marginTop: 'auto',
        paddingTop: 'clamp(1rem, 2vw, 1.5rem)',
        paddingBottom: 'clamp(0.5rem, 1vw, 0.75rem)',
        textAlign: 'center',
      }}>
        <button
          onClick={() => setShowAbout(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#666',
            fontSize: 'clamp(0.7rem, 1.8vw, 0.75rem)',
            fontWeight: '500',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: '0.5rem 1rem',
          }}
        >
          credits
        </button>
      </div>
    </div>
  );
}