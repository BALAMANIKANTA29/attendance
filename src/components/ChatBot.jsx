import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, X, Trash2, User, Phone, Mail, BookOpen, 
  Laptop, MapPin, Users, Settings, AlertTriangle, Sparkles, CheckCircle,
  Mic, MicOff
} from 'lucide-react';

export const ChatBot = ({
  students = [],
  attendanceHistory = {},
  crtStudents = [],
  crtAttendanceHistory = {},
  classInfo = {},
  attendancePolicy = {},
  studentInfoData = [],
  currentView,
  setCurrentView
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am the AID-H Hostel Bot Assistant. Ask me anything about class members, parent contacts, semester backlogs, attendance status, room numbers, laptop status, or settings! You can also tell me to switch views.",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');

  // Voice Query (Speech-to-Text) States
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Keep a ref to the latest handleSendMessage to avoid stale closures
  const handleSendMessageRef = useRef(null);
  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  });

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(prev => {
            const combined = prev ? `${prev} ${transcript}` : transcript;
            // Trigger auto-send after a small delay
            setTimeout(() => {
              if (handleSendMessageRef.current) {
                handleSendMessageRef.current(combined);
              }
            }, 100);
            return '';
          });
        }
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Stop listening if drawer is closed
  useEffect(() => {
    if (!isOpen && isListening && recognitionRef.current) {
      recognitionRef.current.abort();
    }
  }, [isOpen, isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  // Draggable FAB Position (2D coordinates)
  const [fabPosition, setFabPosition] = useState(() => {
    try {
      const savedX = localStorage.getItem('chatbot_fab_x');
      const savedY = localStorage.getItem('chatbot_fab_y');
      const parsedX = savedX ? parseFloat(savedX) : 96;
      const parsedY = savedY ? parseFloat(savedY) : 70;
      return {
        x: isNaN(parsedX) ? 96 : parsedX,
        y: isNaN(parsedY) ? 70 : parsedY
      };
    } catch {
      return { x: 96, y: 70 };
    }
  });

  const currentFabPosition = useRef(fabPosition);
  useEffect(() => {
    currentFabPosition.current = fabPosition;
  }, [fabPosition]);

  const chatEndRef = useRef(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const fabXAtStart = useRef(0);
  const fabYAtStart = useRef(0);
  const dragThreshold = useRef(5); // pixels of movement to count as a drag

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Combine data from base students (attendance/backlog fields) and studentInfoData (rich metadata)
  const getCombinedStudent = (rollOrId) => {
    const cleanRoll = String(rollOrId).trim().toLowerCase();
    const info = studentInfoData.find(s => s.roll.toLowerCase() === cleanRoll);
    const base = students.find(s => (s.id || s.roll || '').toLowerCase() === cleanRoll);
    
    if (!info && !base) return null;
    
    return {
      roll: info?.roll || base?.id || base?.roll || '',
      name: info?.name || base?.name || '',
      team: info?.team || base?.team || '',
      cls: info?.cls || base?.cls || '',
      room: info?.room || base?.room || '',
      phone: info?.phone || base?.phone || '',
      parentName: info?.parentName || base?.parentName || '',
      p1: info?.p1 || base?.p1 || '',
      p2: info?.p2 || base?.p2 || '',
      email: info?.email || base?.email || '',
      backlogs: info?.backlogs !== undefined ? info.backlogs : base?.backlogCount !== undefined ? base.backlogCount : (base?.backlogs !== undefined ? base.backlogs : 0),
      backlogSubs: info?.backlogSubs || base?.backlogSubs || '',
      laptop: info?.laptop || base?.laptop || 'no',
      club: info?.club || base?.club || '',
      abcId: info?.abcId || base?.abcId || '',
      project: info?.project || base?.project || '',
      s11: base?.s11 || info?.s11 || '',
      s12: base?.s12 || info?.s12 || '',
      s21: base?.s21 || info?.s21 || '',
      s22: base?.s22 || info?.s22 || '',
      s31: base?.s31 || info?.s31 || '',
      status: base?.status || null
    };
  };

  // Helper to list all combined students
  const getAllCombinedStudents = () => {
    const rolls = new Set([
      ...studentInfoData.map(s => s.roll.toLowerCase()),
      ...students.map(s => (s.id || s.roll || '').toLowerCase())
    ].filter(Boolean));
    
    return Array.from(rolls).map(roll => getCombinedStudent(roll)).filter(Boolean);
  };

  // Draggable Event Handlers (2D Dragging)
  const handleTouchStart = (e) => {
    isDragging.current = false;
    dragStartX.current = e.touches[0].clientX;
    dragStartY.current = e.touches[0].clientY;
    fabXAtStart.current = (fabPosition.x / 100) * window.innerWidth;
    fabYAtStart.current = (fabPosition.y / 100) * window.innerHeight;
  };

  const handleTouchMove = (e) => {
    const clientX = e.touches[0].clientX;
    const clientY = e.touches[0].clientY;
    const deltaX = clientX - dragStartX.current;
    const deltaY = clientY - dragStartY.current;
    
    if (Math.abs(deltaX) > dragThreshold.current || Math.abs(deltaY) > dragThreshold.current) {
      isDragging.current = true;
    }
    
    if (isDragging.current) {
      if (e.cancelable) e.preventDefault();
      let newX = fabXAtStart.current + deltaX;
      let newY = fabYAtStart.current + deltaY;
      
      // Constrain inside viewport (e.g. 30px offset from all edges)
      newX = Math.max(30, Math.min(window.innerWidth - 30, newX));
      newY = Math.max(30, Math.min(window.innerHeight - 30, newY));
      
      setFabPosition({
        x: (newX / window.innerWidth) * 100,
        y: (newY / window.innerHeight) * 100
      });
    }
  };

  const handleTouchEnd = () => {
    if (isDragging.current) {
      localStorage.setItem('chatbot_fab_x', currentFabPosition.current.x.toString());
      localStorage.setItem('chatbot_fab_y', currentFabPosition.current.y.toString());
    } else {
      setIsOpen(prev => !prev);
    }
  };

  const handleMouseDown = (e) => {
    isDragging.current = false;
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    fabXAtStart.current = (fabPosition.x / 100) * window.innerWidth;
    fabYAtStart.current = (fabPosition.y / 100) * window.innerHeight;
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const deltaX = e.clientX - dragStartX.current;
    const deltaY = e.clientY - dragStartY.current;
    
    if (Math.abs(deltaX) > dragThreshold.current || Math.abs(deltaY) > dragThreshold.current) {
      isDragging.current = true;
    }
    
    if (isDragging.current) {
      let newX = fabXAtStart.current + deltaX;
      let newY = fabYAtStart.current + deltaY;
      
      newX = Math.max(30, Math.min(window.innerWidth - 30, newX));
      newY = Math.max(30, Math.min(window.innerHeight - 30, newY));
      
      setFabPosition({
        x: (newX / window.innerWidth) * 100,
        y: (newY / window.innerHeight) * 100
      });
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    if (isDragging.current) {
      localStorage.setItem('chatbot_fab_x', currentFabPosition.current.x.toString());
      localStorage.setItem('chatbot_fab_y', currentFabPosition.current.y.toString());
    } else {
      setIsOpen(prev => !prev);
    }
  };

  // Smart local NLP solver
  const solveQuery = (query) => {
    const cleanQuery = query.toLowerCase().trim();
    const allSt = getAllCombinedStudents();
    
    // --- 1. Find Navigation Intents ---
    if (/\b(go to|open|switch to|navigate to|show me)\b/i.test(cleanQuery)) {
      if (cleanQuery.includes('setting') || cleanQuery.includes('admin')) {
        setCurrentView('adminSettings');
        return { text: "Switched view to **Admin Settings**! Let me know if you need help configuring policies or managing columns." };
      }
      if (cleanQuery.includes('backlog') && !cleanQuery.includes('student') && !cleanQuery.includes('who has')) {
        setCurrentView('backlogs');
        return { text: "Switched view to **Backlogs Details**! You can view, add, or edit semester-specific backlogs there." };
      }
      if (cleanQuery.includes('subject') || cleanQuery.includes('wise') || cleanQuery.includes('sub-wise')) {
        setCurrentView('subjectWise');
        return { text: "Switched view to **Subject-Wise Backlogs Count**! You can check the backlog distribution by subject." };
      }
      if (cleanQuery.includes('member') || cleanQuery.includes('class') || cleanQuery.includes('manage student')) {
        setCurrentView('classMembers');
        return { text: "Switched view to **Manage Class Members**! You can add new student IDs or rename students here." };
      }
      if (cleanQuery.includes('parent') || cleanQuery.includes('father') || cleanQuery.includes('phone list')) {
        setCurrentView('parentDetails');
        return { text: "Switched view to **Parent Details**! You can search and edit parental contact details." };
      }
      if (cleanQuery.includes('student info') || cleanQuery.includes('abc id') || cleanQuery.includes('email list')) {
        setCurrentView('studentInfo');
        return { text: "Switched view to **Student Info & ABC IDs**! You can check room numbers, projects, and laptop allocations." };
      }
      if (cleanQuery.includes('mark') || cleanQuery.includes('attendance marking') || cleanQuery.includes('take attendance')) {
        if (cleanQuery.includes('crt')) {
          setCurrentView('crtMarking');
          return { text: "Switched view to **Mark CRT Attendance**!" };
        }
        setCurrentView('dailyMarking');
        return { text: "Switched view to **Mark Attendance**! Make sure to select absent students and click submit." };
      }
      if (cleanQuery.includes('log') || cleanQuery.includes('history')) {
        if (cleanQuery.includes('crt')) {
          setCurrentView('crtLog');
          return { text: "Switched view to **CRT Attendance Log**!" };
        }
        setCurrentView('dailyLog');
        return { text: "Switched view to **Attendance Log**! Here you can check historical reports." };
      }
    }

    // --- 2. Find Student entity from Query ---
    let targetStudent = null;
    
    // Exact roll check (e.g. 23b21a45a4 or 236q1a4525)
    const rollRegex = /\b\d{2}[a-z\d]{8}\b|\b\d{3}q[a-z\d]{6}\b/i;
    const rollMatch = cleanQuery.match(rollRegex);
    if (rollMatch) {
      const matchRoll = rollMatch[0];
      targetStudent = allSt.find(s => s.roll.toLowerCase() === matchRoll);
    }
    
    // Scoring-Based Name Matcher with Smart Disambiguation
    if (!targetStudent) {
      const stopwords = ['show', 'me', 'who', 'is', 'what', 'the', 'details', 'of', 'student', 'about', 'parent', 'contact', 'email', 'room', 'laptop', 'backlogs', 'project', 'phone', 'number', 'address', 'today', 'status'];
      const queryWords = cleanQuery.split(/\s+/).filter(w => !stopwords.includes(w) && w.length >= 2);

      const scoredStudents = allSt.map(st => {
        const nameLower = st.name.toLowerCase();
        const cleanName = nameLower.replace(/[^a-z0-9\s]/g, ' ');
        const cleanStudentName = nameLower.replace(/[^a-z0-9\s]/g, ' ');
        const nameParts = cleanName.split(/\s+/).filter(part => part.length >= 2);
        
        let score = 0;
        
        // 1. Full name match (contains clean name or raw name)
        if (cleanQuery.includes(cleanStudentName) || cleanQuery.includes(nameLower)) {
          score += 10;
        }
        
        // 2. Part matching (student name parts in query)
        nameParts.forEach(part => {
          const partRegex = new RegExp(`\\b${part}\\b`, 'i');
          if (partRegex.test(cleanQuery)) {
            score += 2;
          }
        });

        // 3. Query words matching name parts exactly
        queryWords.forEach(word => {
          if (nameParts.includes(word)) {
            score += 1;
          }
        });

        return { student: st, score };
      });

      const matched = scoredStudents.filter(item => item.score > 0).sort((a, b) => b.score - a.score);

      if (matched.length > 0) {
        const maxScore = matched[0].score;
        const topMatches = matched.filter(item => item.score === maxScore).map(item => item.student);

        if (topMatches.length === 1) {
          targetStudent = topMatches[0];
        } else {
          // If multiple top matches, check if only one student's full name is in the query
          const exactFullMatches = topMatches.filter(s => cleanQuery.includes(s.name.toLowerCase()));
          if (exactFullMatches.length === 1) {
            targetStudent = exactFullMatches[0];
          } else {
            // Ambiguity found - return a list of matched students
            const rows = topMatches.map(s => [s.roll, s.name, s.team.split(' ')[0], s.room || 'N/A']);
            return {
              text: `I found ${topMatches.length} students matching your query. Which one did you mean?`,
              table: {
                headers: ["Roll No", "Student Name", "Team", "Room"],
                rows: rows
              }
            };
          }
        }
      }
    }

    // If still no student match, check for last 4 digits of roll suffix (e.g. "45a4", "4525")
    if (!targetStudent) {
      for (const st of allSt) {
        const suffix = st.roll.slice(-4).toLowerCase();
        if (cleanQuery.includes(suffix) && suffix.length >= 3) {
          targetStudent = st;
          break;
        }
      }
    }

    // --- 3. If a Specific Student is matched, handle targeted attribute queries ---
    if (targetStudent) {
      const name = targetStudent.name;
      
      // Determine what specific attribute is being asked (Targeted Data Extraction)
      
      // 3.1. Parent Name
      if (/\b(parent(\s*name)?|father|mother|dad|mom|guardian|parentname)\b/i.test(cleanQuery) && 
          !/\b(phone|contact|number|mobile|call|p1|p2)\b/i.test(cleanQuery)) {
        return {
          text: `Parent Name for ${name}:`,
          table: {
            headers: ["Student Name", "Parent Name(s)"],
            rows: [[name, targetStudent.parentName || 'Not recorded']]
          }
        };
      }
      
      // 3.2. Parent Contacts (p1, p2)
      if (/\b(parent(\s*phone|\s*contact|\s*number|\s*mobile)|p1|p2|father(\s*phone|\s*contact|\s*number)|mother(\s*phone|\s*contact|\s*number)|dad(\s*phone|\s*contact|\s*number)|mom(\s*phone|\s*contact|\s*number))\b/i.test(cleanQuery)) {
        const contacts = [targetStudent.p1, targetStudent.p2].filter(Boolean).join(', ');
        return {
          text: `Parent Contacts for ${name}:`,
          table: {
            headers: ["Student Name", "Parent Contact Numbers"],
            rows: [[name, contacts || 'No parent contacts recorded']]
          }
        };
      }
      
      // 3.3. Student Personal Phone
      if (/\b(phone|number|mobile|contact|cell|ph)\b/i.test(cleanQuery) && 
          !/\b(parent|father|mother|dad|mom|p1|p2)\b/i.test(cleanQuery)) {
        return {
          text: `Phone Number for ${name}:`,
          table: {
            headers: ["Student Name", "Phone Number"],
            rows: [[name, targetStudent.phone || 'Not recorded']]
          }
        };
      }
      
      // 3.4. Email
      if (/\b(email|mail|gmail|address)\b/i.test(cleanQuery)) {
        return {
          text: `Email for ${name}:`,
          table: {
            headers: ["Student Name", "Email Address"],
            rows: [[name, targetStudent.email || 'Not recorded']]
          }
        };
      }
      
      // 3.5. Room Number
      if (/\b(room|hostel\s*room|bed)\b/i.test(cleanQuery)) {
        return {
          text: `Room allocation for ${name}:`,
          table: {
            headers: ["Student Name", "Room", "Class"],
            rows: [[name, targetStudent.room || 'Not recorded', targetStudent.cls || 'N/A']]
          }
        };
      }
      
      // 3.6. Team Name
      if (/\b(team|group|gang)\b/i.test(cleanQuery)) {
        return {
          text: `Team for ${name}:`,
          table: {
            headers: ["Student Name", "Allocated Team"],
            rows: [[name, targetStudent.team || 'Not assigned']]
          }
        };
      }
      
      // 3.7. Club Name
      if (/\b(club|clubs|activity)\b/i.test(cleanQuery)) {
        return {
          text: `Club assignment for ${name}:`,
          table: {
            headers: ["Student Name", "Club"],
            rows: [[name, targetStudent.club && targetStudent.club !== '--' ? targetStudent.club : 'No club assigned']]
          }
        };
      }
      
      // 3.8. ABC ID
      if (/\b(abc|abc\s*id|academic\s*bank)\b/i.test(cleanQuery)) {
        return {
          text: `ABC ID for ${name}:`,
          table: {
            headers: ["Student Name", "ABC ID"],
            rows: [[name, targetStudent.abcId || 'Not recorded']]
          }
        };
      }
      
      // 3.9. Laptop Status
      if (/\b(laptop|pc|computer|system)\b/i.test(cleanQuery)) {
        const hasLaptop = String(targetStudent.laptop).toLowerCase() === 'yes';
        return {
          text: `Laptop Status for ${name}:`,
          table: {
            headers: ["Student Name", "Has Laptop?"],
            rows: [[name, hasLaptop ? 'Yes' : 'No']]
          }
        };
      }
      
      // 3.10. Hackathon Project
      if (/\b(project|hackathon|project\s*name|topic|work)\b/i.test(cleanQuery)) {
        return {
          text: `Allocated Project for ${name}:`,
          table: {
            headers: ["Student Name", "Project Title"],
            rows: [[name, targetStudent.project || 'Not Allocated']]
          }
        };
      }

      // 3.11. Attendance Status
      if (/\b(attendance|status|today|present|absent)\b/i.test(cleanQuery) && !/\b(backlog|fail)\b/i.test(cleanQuery)) {
        const status = targetStudent.status;
        const statusText = status === 'present' ? 'Present' : status === 'absent' ? 'Absent' : 'Not marked yet';
        return {
          text: `Attendance Today for ${name}:`,
          table: {
            headers: ["Student Name", "Status Today"],
            rows: [[name, statusText]]
          }
        };
      }

      // 3.12. Semester-Specific Backlogs
      const requestedSems = getSemesterBacklogs(targetStudent, cleanQuery);
      if (requestedSems && requestedSems.length > 0) {
        const rows = requestedSems.map(sem => {
          const subjects = targetStudent[sem.key] || '';
          const subList = subjects.split(',').map(s => s.trim()).filter(Boolean);
          return [sem.label, subList.length > 0 ? subList.join(', ') : 'Clear (No backlogs)'];
        });
        return {
          text: `Backlog Subjects for ${name}:`,
          table: {
            headers: ["Semester", "Backlog Subjects"],
            rows: rows
          }
        };
      }
      
      // 3.13. Generic Backlogs (if backlog is mentioned but no semester is specified)
      if (/\b(backlog|backlogs|fail|fails|subjects)\b/i.test(cleanQuery)) {
        const total = targetStudent.backlogs;
        const subjects = targetStudent.backlogSubs || 'None';
        return {
          text: `Backlog Summary for ${name}:`,
          table: {
            headers: ["Metric", "Value"],
            rows: [
              ["Total Backlogs", total],
              ["Backlog Subjects", subjects]
            ]
          }
        };
      }

      // 3.14. Fallback: If they just ask the student name/who is/details, show complete profile card!
      return {
        text: `Here is the profile for ${name}:`,
        studentCard: targetStudent
      };
    }

    // --- 4. Semester-specific class-wide queries (e.g. "Who has backlogs in 1-1?") ---
    const semKeys = [
      { key: 's11', label: '1-1' },
      { key: 's12', label: '1-2' },
      { key: 's21', label: '2-1' },
      { key: 's22', label: '2-2' },
      { key: 's31', label: '3-1' }
    ];
    let matchedSem = null;
    for (const sk of semKeys) {
      if (cleanQuery.includes(sk.label) || 
          cleanQuery.includes(`sem ${sk.label}`) || 
          cleanQuery.includes(`semester ${sk.label}`) ||
          (sk.key === 's11' && (cleanQuery.includes('1st sem') || cleanQuery.includes('first sem') || cleanQuery.includes('semester 1'))) || 
          (sk.key === 's12' && (cleanQuery.includes('2nd sem') || cleanQuery.includes('second sem') || cleanQuery.includes('semester 2'))) ||
          (sk.key === 's21' && (cleanQuery.includes('3rd sem') || cleanQuery.includes('third sem') || cleanQuery.includes('semester 3'))) ||
          (sk.key === 's22' && (cleanQuery.includes('4th sem') || cleanQuery.includes('fourth sem') || cleanQuery.includes('semester 4'))) ||
          (sk.key === 's31' && (cleanQuery.includes('5th sem') || cleanQuery.includes('fifth sem') || cleanQuery.includes('semester 5')))
      ) {
        matchedSem = sk;
        break;
      }
    }

    if (matchedSem && /\b(backlog|backlogs|fail|fails|sub wise|subject wise|subject-wise)\b/i.test(cleanQuery)) {
      // 4.1. Subject-Wise Backlog Count for this specific Semester
      if (/\b(sub wise|subject wise|subject-wise)\b/i.test(cleanQuery)) {
        const subjectCounts = {};
        allSt.forEach(s => {
          const field = s[matchedSem.key] || '';
          if (field && field.trim() !== '') {
            field.split(',').forEach(sub => {
              const name = sub.trim().toUpperCase();
              if (name && name !== '-' && name !== '') {
                subjectCounts[name] = (subjectCounts[name] || 0) + 1;
              }
            });
          }
        });

        const sortedSubjects = Object.entries(subjectCounts)
          .map(([subject, count]) => ({ subject, count }))
          .sort((a, b) => b.count - a.count);

        if (sortedSubjects.length === 0) {
          return { text: `No subject-wise backlogs recorded for Semester ${matchedSem.label}! Everything is clear.` };
        }

        const totalInstances = sortedSubjects.reduce((acc, item) => acc + item.count, 0);
        const rows = sortedSubjects.map(item => [item.subject, item.count]);

        return {
          text: `Subject-Wise Backlog Count for Semester ${matchedSem.label} (Total instances: ${totalInstances}):`,
          table: {
            headers: ["Subject Code", "Number of Failures"],
            rows: rows
          }
        };
      }

      // 4.2. Student List with Backlogs for this specific Semester
      const failedStudents = allSt.filter(s => {
        const val = s[matchedSem.key] || '';
        return val.trim() !== '' && val !== '-';
      });
      
      if (failedStudents.length === 0) {
        return { text: `No students have backlogs in Semester ${matchedSem.label}! Everything is clear.` };
      }
      
      const rows = failedStudents.map(s => [s.roll, s.name, s[matchedSem.key]]);
      return { 
        text: `Students with backlogs in Semester ${matchedSem.label} (${failedStudents.length} students):`,
        table: {
          headers: ["Roll No", "Student Name", "Subjects"],
          rows: rows
        }
      };
    }

    // --- 5. Class-Wide Queries ---
    
    // 5.1. Laptop Missing / Laptop Status
    if (/\b(no laptop|without laptop|don't have laptop|laptops)\b/i.test(cleanQuery)) {
      if (cleanQuery.includes('how many') || cleanQuery.includes('count')) {
        const count = allSt.filter(s => s.laptop === 'no').length;
        return { text: `There are ${count} students who do not have a laptop.` };
      }
      const noLaptopSt = allSt.filter(s => s.laptop === 'no');
      const rows = noLaptopSt.map(s => [s.roll, s.name, s.team.split(' ')[0]]);
      return { 
        text: `Students without a laptop (${noLaptopSt.length}):`,
        table: {
          headers: ["Roll No", "Student Name", "Team"],
          rows: rows
        }
      };
    }

    // 5.2. Absentees Today
    if (/\b(absent|absentees|not present|not here)\b/i.test(cleanQuery)) {
      const absents = allSt.filter(s => s.status === 'absent');
      if (absents.length === 0) {
        return { text: "No students are marked absent today (or attendance hasn't been submitted yet)." };
      }
      const rows = absents.map(s => [s.roll, s.name, s.team.split(' ')[0]]);
      return { 
        text: `Absentees today (${absents.length} students):`,
        table: {
          headers: ["Roll No", "Student Name", "Team"],
          rows: rows
        }
      };
    }

    // 5.3. Present Today
    if (/\b(present|attendees|here)\b/i.test(cleanQuery) && !/\b(absent)\b/i.test(cleanQuery)) {
      const presents = allSt.filter(s => s.status === 'present');
      if (presents.length === 0) {
        return { text: "No students are marked present today (or attendance has not been submitted yet)." };
      }
      return { text: `Currently, ${presents.length} students are marked present out of ${allSt.length} total.` };
    }

    // 5.4. Low Attendance
    if (/\b(low attendance|warning|below 75|under 75|attendance warning)\b/i.test(cleanQuery)) {
      const dates = Object.keys(attendanceHistory);
      if (dates.length === 0) {
        return { text: "No historical logs available to compute cumulative attendance percentages. Please mark attendance for a few days first!" };
      }

      const totalDays = dates.length;
      const studentAbsents = {};
      
      dates.forEach(date => {
        const records = attendanceHistory[date] || [];
        records.forEach(report => {
          const abs = report.absentees || [];
          abs.forEach(roll => {
            studentAbsents[roll] = (studentAbsents[roll] || 0) + 1;
          });
        });
      });

      const warningList = [];
      allSt.forEach(s => {
        const absCount = studentAbsents[s.roll] || 0;
        const presentCount = totalDays - absCount;
        const pct = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 100;
        if (pct < 75) {
          warningList.push({ name: s.name, roll: s.roll, pct, absCount });
        }
      });

      if (warningList.length === 0) {
        return { text: `All students have good attendance (>=75%) across the ${totalDays} logged days!` };
      }

      const rows = warningList.map(w => [w.roll, w.name, `${w.pct}%`, `${w.absCount} / ${totalDays} days`]);
      return { 
        text: `Students with low attendance (<75% warning) based on ${totalDays} logs:`,
        table: {
          headers: ["Roll No", "Student Name", "Attendance Rate", "Absences / Total"],
          rows: rows
        }
      };
    }

    // 5.5. General Backlogs Query
    if (/\b(who has backlog|list backlogs|backlog list|failed students)\b/i.test(cleanQuery) || 
        cleanQuery === 'backlogs' || cleanQuery === 'backlog') {
      const backlogSt = allSt.filter(s => s.backlogs > 0);
      if (backlogSt.length === 0) {
        return { text: "Fantastic! All students are backlog-free." };
      }
      
      const sortedBacklogs = [...backlogSt].sort((a, b) => b.backlogs - a.backlogs);
      const rows = sortedBacklogs.map(s => [s.roll, s.name, s.backlogs, s.backlogSubs || 'N/A']);
      return { 
        text: `Students with active backlogs (${backlogSt.length} students):`,
        table: {
          headers: ["Roll No", "Student Name", "Backlogs Count", "Subjects"],
          rows: rows
        }
      };
    }

    // 5.6. Backlog Wise Count (Breakdown/Distribution)
    if (/\b(backlog wise count|backlog breakdown|backlog distribution|backlog stats|backlog count)\b/i.test(cleanQuery)) {
      const breakdown = {};
      let totalCount = 0;
      allSt.forEach(s => {
        const bc = s.backlogs || 0;
        if (bc > 0) {
          breakdown[bc] = (breakdown[bc] || 0) + 1;
          totalCount += bc;
        }
      });
      
      const rows = Object.entries(breakdown)
        .map(([bc, qty]) => [`${bc} backlog(s)`, `${qty} student(s)`])
        .sort((a, b) => parseInt(b[0]) - parseInt(a[0]));
        
      return { 
        text: `Backlog Wise Count Summary:\n- Total backlog subjects: ${totalCount}\n- Students with backlogs: ${allSt.filter(s => s.backlogs > 0).length}`,
        table: {
          headers: ["Backlog Count", "Quantity of Students"],
          rows: rows
        }
      };
    }

    // 5.6.5. Subject-Wise Backlog Count (Sub-Wise Count)
    if (/\b(sub wise count|subject wise count|subject wise backlog|sub wise backlog|subject wise backlog count|subject-wise)\b/i.test(cleanQuery)) {
      const subjectCounts = {};
      const semKeys = ['s11', 's12', 's21', 's22', 's31'];
      
      allSt.forEach(s => {
        semKeys.forEach(sem => {
          const field = s[sem] || '';
          if (field && field.trim() !== '') {
            field.split(',').forEach(sub => {
              const name = sub.trim().toUpperCase();
              if (name && name !== '-' && name !== '') {
                subjectCounts[name] = (subjectCounts[name] || 0) + 1;
              }
            });
          }
        });
      });
      
      const sortedSubjects = Object.entries(subjectCounts)
        .map(([subject, count]) => ({ subject, count }))
        .sort((a, b) => b.count - a.count);
        
      if (sortedSubjects.length === 0) {
        return { text: "No subject-wise backlogs recorded! All students are clear." };
      }
      
      const totalInstances = sortedSubjects.reduce((acc, item) => acc + item.count, 0);
      const rows = sortedSubjects.map(item => [item.subject, item.count]);
      
      return {
        text: `Subject-Wise Backlog Count (Total instances: ${totalInstances}):`,
        table: {
          headers: ["Subject Code", "Number of Failures"],
          rows: rows
        }
      };
    }

    // 5.6.8. Total Backlogs Summary
    if (/\b(total backlogs summary|backlogs summary|backlog summary|overall backlog summary|backlog report)\b/i.test(cleanQuery)) {
      const backlogStudents = allSt.filter(s => s.backlogs > 0);
      const totalStudents = allSt.length;
      const totalBacklogInstances = backlogStudents.reduce((acc, s) => acc + (s.backlogs || 0), 0);
      
      // Calculate most common subject
      const subjectCounts = {};
      const semKeys = ['s11', 's12', 's21', 's22', 's31'];
      allSt.forEach(s => {
        semKeys.forEach(sem => {
          const field = s[sem] || '';
          if (field && field.trim() !== '') {
            field.split(',').forEach(sub => {
              const name = sub.trim().toUpperCase();
              if (name && name !== '-' && name !== '') {
                subjectCounts[name] = (subjectCounts[name] || 0) + 1;
              }
            });
          }
        });
      });
      const sortedSubjects = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1]);
      const mostCommonSub = sortedSubjects.length > 0 ? `${sortedSubjects[0][0]} (${sortedSubjects[0][1]} failures)` : 'None';

      const maxBacklogs = backlogStudents.length > 0 ? Math.max(...backlogStudents.map(s => s.backlogs)) : 0;
      const maxBacklogStudent = maxBacklogs > 0 ? backlogStudents.find(s => s.backlogs === maxBacklogs) : null;
      const maxBacklogText = maxBacklogStudent ? `${maxBacklogStudent.name} (${maxBacklogs} backlogs)` : 'N/A';

      const avgBacklogs = backlogStudents.length > 0 ? (totalBacklogInstances / backlogStudents.length).toFixed(1) : '0';

      return {
        text: "Class Backlog Summary Report:",
        table: {
          headers: ["Metric", "Value"],
          rows: [
            ["Total Enrolled Students", totalStudents],
            ["Students with Backlogs", `${backlogStudents.length} (${Math.round((backlogStudents.length/totalStudents)*100)}%)`],
            ["Total Backlog Instances", totalBacklogInstances],
            ["Average Backlogs (affected students)", avgBacklogs],
            ["Most Common Backlog Subject", mostCommonSub],
            ["Highest Backlog Count (Student)", maxBacklogText]
          ]
        }
      };
    }

    // 5.7. Class Size / Total Students
    if (/\b(how many students|total students|class size|student count)\b/i.test(cleanQuery)) {
      return { text: `There are a total of ${allSt.length} students enrolled in this class/hostel portal.` };
    }

    // 5.8. Team List Query
    if (/\b(team-\d+|team \d+)\b/i.test(cleanQuery)) {
      const match = cleanQuery.match(/team-?\s*(\d+)/i);
      const teamNum = match ? match[1] : '';
      const teamSt = allSt.filter(s => s.team.toLowerCase().includes(`team-${teamNum}`) || s.team.toLowerCase().includes(`team ${teamNum}`));
      
      if (teamSt.length === 0) {
        return { text: `No students found in Team ${teamNum}.` };
      }
      
      const rows = teamSt.map(s => [s.roll, s.name, s.room]);
      return { 
        text: `Members of Team ${teamNum} (${teamSt.length} students):`,
        table: {
          headers: ["Roll No", "Student Name", "Room"],
          rows: rows
        }
      };
    }

    // 5.9. Club Query
    if (/\b(gcc|ncc|nss|robotics|khub|k-hub|coding club)\b/i.test(cleanQuery)) {
      const match = cleanQuery.match(/\b(gcc|ncc|nss|robotics|khub|k-hub)\b/i);
      const clubName = match ? match[0].toUpperCase() : '';
      const clubSt = allSt.filter(s => s.club.toUpperCase().includes(clubName));
      
      if (clubSt.length === 0) {
        return { text: `No students registered under the ${clubName} club.` };
      }
      
      const rows = clubSt.map(s => [s.roll, s.name, s.team.split(' ')[0]]);
      return { 
        text: `Students in ${clubName} (${clubSt.length} students):`,
        table: {
          headers: ["Roll No", "Student Name", "Team"],
          rows: rows
        }
      };
    }

    // 5.10. Class Info / Stats general
    if (cleanQuery.includes('class') && (cleanQuery.includes('info') || cleanQuery.includes('detail') || cleanQuery.includes('stats'))) {
      const absentCount = allSt.filter(s => s.status === 'absent').length;
      const backlogCount = allSt.filter(s => s.backlogs > 0).length;
      const noLaptopCount = allSt.filter(s => s.laptop === 'no').length;
      return {
        text: `Class Information Summary (${classInfo.name || 'K12AIDHA'}):`,
        table: {
          headers: ["Setting / Metric", "Value"],
          rows: [
            ["Class Name", classInfo.name || 'K12AIDHA'],
            ["Current Semester", classInfo.semester || 'Fall'],
            ["Total Enrolled Students", allSt.length],
            ["Marked Absent Today", absentCount],
            ["Students with Backlogs", backlogCount],
            ["Students without Laptops", noLaptopCount],
            ["Min Attendance Required", `${attendancePolicy.minimumAttendance || 75}%`]
          ]
        }
      };
    }

    // --- 6. Final Fallback: Suggest actions ---
    return {
      text: "I didn't quite catch that. Here are some examples of what you can ask me:\n\n" +
            "**Specific Attribute Queries** (returns only the exact detail):\n" +
            '- "What is M.PRASAD\'s parent contact?"\n' +
            '- "Show parent name of K.RAMANA REDDY"\n' +
            '- "What is Teja\'s email?"\n' +
            '- "Show Akhil\'s laptop status"\n' +
            '- "What backlogs does Prasad have in 1-1 semester?"\n\n' +
            "**Full Profile Queries**:\n" +
            '- "Who is Prasad?" or "Show details of student Hemanth"\n\n' +
            "**Class-Wide Queries**:\n" +
            '- "Who is absent today?"\n' +
            '- "Who does not have a laptop?"\n' +
            '- "List students with backlogs in 1-2"\n' +
            '- "Who has low attendance?"\n\n' +
            "**App Navigation**:\n" +
            '- "Go to settings" or "Open backlogs view"'
    };
  };

  const handleSendMessage = (textToSend = inputText) => {
    const text = textToSend.trim();
    if (!text) return;

    // Add user message
    const userMsg = { sender: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Simulate bot thinking & reply
    setTimeout(() => {
      const response = solveQuery(text);
      // Clean all stars/asterisks from output text for clean presentation
      const cleanText = response.text ? response.text.replace(/\*/g, '') : '';
      
      let cleanTable = null;
      if (response.table) {
        cleanTable = {
          headers: response.table.headers.map(h => String(h).replace(/\*/g, '')),
          rows: response.table.rows.map(row => row.map(cell => String(cell).replace(/\*/g, '')))
        };
      }

      const botMsg = { 
        sender: 'bot', 
        text: cleanText, 
        studentCard: response.studentCard, 
        table: cleanTable,
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botMsg]);
    }, 400);
  };

  const getSemesterBacklogs = (student, query) => {
    const q = query.toLowerCase();
    let semesters = [];
    
    if (q.includes("1-1") || q.includes("first sem") || q.includes("1st sem") || q.includes("sem 1") || q.includes("semester 1")) {
      if (!q.includes("1-2")) {
        semesters.push({ key: 's11', label: '1-1' });
      }
    }
    if (q.includes("1-2") || q.includes("second sem") || q.includes("2nd sem") || q.includes("sem 2") || q.includes("semester 2")) {
      semesters.push({ key: 's12', label: '1-2' });
    }
    if (q.includes("2-1") || q.includes("third sem") || q.includes("3rd sem") || q.includes("sem 3") || q.includes("semester 3")) {
      semesters.push({ key: 's21', label: '2-1' });
    }
    if (q.includes("2-2") || q.includes("fourth sem") || q.includes("4th sem") || q.includes("sem 4") || q.includes("semester 4")) {
      semesters.push({ key: 's22', label: '2-2' });
    }
    if (q.includes("3-1") || q.includes("fifth sem") || q.includes("5th sem") || q.includes("sem 5") || q.includes("semester 5")) {
      semesters.push({ key: 's31', label: '3-1' });
    }
    
    if (q.includes("1st year") || q.includes("first year")) {
      semesters.push({ key: 's11', label: '1-1' });
      semesters.push({ key: 's12', label: '1-2' });
    }
    if (q.includes("2nd year") || q.includes("second year")) {
      semesters.push({ key: 's21', label: '2-1' });
      semesters.push({ key: 's22', label: '2-2' });
    }
    
    return semesters;
  };

  return (
    <>
      <div 
        style={{ 
          left: `${fabPosition.x}%`, 
          top: `${fabPosition.y}%`
        }}
        className="fixed z-50 select-none touch-none -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing print:hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        <div className="transition-transform duration-200 hover:scale-110 active:scale-95 group">
          <svg viewBox="5 -30 390 390" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 select-none pointer-events-none drop-shadow-md">
            {/* Left Ear */}
            <rect x="35" y="90" width="15" height="70" rx="8" fill="#4B3FF2"/>

            {/* Right Ear */}
            <rect x="350" y="90" width="15" height="70" rx="8" fill="#4B3FF2"/>

            {/* Outer Head */}
            <rect x="60" y="60" width="270" height="180" rx="60" fill="#4B3FF2"/>

            {/* Inner Face */}
            <rect x="85" y="95" width="220" height="90" rx="35" fill="white"/>

            {/* Chat Bubble Tail */}
            <polygon points="150,240 180,240 165,270" fill="#4B3FF2"/>

            {/* Left Eye */}
            <g transform="translate(125,135)">
              <circle r="16" fill="#4B3FF2"/>
              <circle cx="-4" cy="-4" r="5" fill="white"/>
              <circle cx="4" cy="6" r="3" fill="white"/>
            </g>

            {/* Right Eye */}
            <g transform="translate(265,135)">
              <circle r="16" fill="#4B3FF2"/>
              <circle cx="-4" cy="-4" r="5" fill="white"/>
              <circle cx="4" cy="6" r="3" fill="white"/>
            </g>

            {/* Mouth */}
            <path d="M180 145 Q195 165 210 145 Z" fill="#4B3FF2"/>
          </svg>
        </div>
      </div>

      {/* Side Chat Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm print:hidden animate-in fade-in duration-200">
          
          {/* Backdrop Click Closes Drawer */}
          <div className="flex-1" onClick={() => setIsOpen(false)}></div>

          {/* Chat Panel */}
          <div className="w-full max-w-[430px] bg-white border-l border-gray-250 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300 text-gray-800" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            
            {/* Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 p-1 flex items-center justify-center shadow-inner">
                  <svg viewBox="5 -30 390 390" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                    {/* Left Ear */}
                    <rect x="35" y="90" width="15" height="70" rx="8" fill="#4B3FF2"/>

                    {/* Right Ear */}
                    <rect x="350" y="90" width="15" height="70" rx="8" fill="#4B3FF2"/>

                    {/* Outer Head */}
                    <rect x="60" y="60" width="270" height="180" rx="60" fill="#4B3FF2"/>

                    {/* Inner Face */}
                    <rect x="85" y="95" width="220" height="90" rx="35" fill="white"/>

                    {/* Chat Bubble Tail */}
                    <polygon points="150,240 180,240 165,270" fill="#4B3FF2"/>

                    {/* Left Eye */}
                    <g transform="translate(125,135)">
                      <circle r="16" fill="#4B3FF2"/>
                      <circle cx="-4" cy="-4" r="5" fill="white"/>
                      <circle cx="4" cy="6" r="3" fill="white"/>
                    </g>

                    {/* Right Eye */}
                    <g transform="translate(265,135)">
                      <circle r="16" fill="#4B3FF2"/>
                      <circle cx="-4" cy="-4" r="5" fill="white"/>
                      <circle cx="4" cy="6" r="3" fill="white"/>
                    </g>

                    {/* Mouth */}
                    <path d="M180 145 Q195 165 210 145 Z" fill="#4B3FF2"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm flex items-center">
                    Hostel Bot Assistant
                    <Sparkles className="w-3.5 h-3.5 ml-1 text-indigo-600" />
                  </h3>
                  <div className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    <span className="text-[10px] text-gray-500 font-semibold">Active · Client-Side AI</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-150 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body & Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              {messages.map((msg, index) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div 
                    key={index}
                    className={`flex ${isBot ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-200`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[85%] ${isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                      {isBot && (
                        <div className="w-6 h-6 rounded-full bg-slate-950 border border-slate-800 shrink-0 mt-0.5 flex items-center justify-center p-0.5 shadow-inner">
                          <svg viewBox="5 -30 390 390" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                            {/* Left Ear */}
                            <rect x="35" y="90" width="15" height="70" rx="8" fill="#4B3FF2"/>

                            {/* Right Ear */}
                            <rect x="350" y="90" width="15" height="70" rx="8" fill="#4B3FF2"/>

                            {/* Outer Head */}
                            <rect x="60" y="60" width="270" height="180" rx="60" fill="#4B3FF2"/>

                            {/* Inner Face */}
                            <rect x="85" y="95" width="220" height="90" rx="35" fill="white"/>

                            {/* Chat Bubble Tail */}
                            <polygon points="150,240 180,240 165,270" fill="#4B3FF2"/>

                            {/* Left Eye */}
                            <g transform="translate(125,135)">
                              <circle r="16" fill="#4B3FF2"/>
                              <circle cx="-4" cy="-4" r="5" fill="white"/>
                              <circle cx="4" cy="6" r="3" fill="white"/>
                            </g>

                            {/* Right Eye */}
                            <g transform="translate(265,135)">
                              <circle r="16" fill="#4B3FF2"/>
                              <circle cx="-4" cy="-4" r="5" fill="white"/>
                              <circle cx="4" cy="6" r="3" fill="white"/>
                            </g>

                            {/* Mouth */}
                            <path d="M180 145 Q195 165 210 145 Z" fill="#4B3FF2"/>
                          </svg>
                        </div>
                      )}
                      
                      <div className="space-y-1.5">
                        <div className={`rounded-2xl p-3 text-sm leading-relaxed shadow-sm border ${
                          isBot 
                            ? 'bg-white text-gray-800 border-gray-200' 
                            : 'bg-indigo-600 text-white border-indigo-600 font-medium'
                        }`}>
                          <div className="whitespace-pre-line">{msg.text}</div>

                          {/* Render Table if present */}
                          {msg.table && (
                            <div className="mt-3 overflow-x-auto w-full border border-gray-200 rounded-xl shadow-sm">
                              <table className="min-w-full divide-y divide-gray-200 text-xs text-left">
                                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-extrabold">
                                  <tr>
                                    {msg.table.headers.map((header, hIdx) => (
                                      <th key={hIdx} className="px-3 py-2 border-b border-gray-200 whitespace-nowrap">
                                        {header}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                  {msg.table.rows.map((row, rIdx) => (
                                    <tr key={rIdx} className="hover:bg-gray-50 transition-colors">
                                      {row.map((cell, cIdx) => (
                                        <td key={cIdx} className="px-3 py-2 text-gray-700 whitespace-pre-wrap">
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* Student Card Fallback */}
                          {msg.studentCard && (
                            <div className="mt-3 bg-gray-50 border border-gray-250 rounded-xl p-3 space-y-2 text-gray-700 shadow-sm">
                              <div className="flex justify-between items-start border-b border-gray-200 pb-1.5">
                                <div>
                                  <h4 className="font-extrabold text-gray-900 text-sm">{msg.studentCard.name}</h4>
                                  <p className="text-xs font-mono text-indigo-600">{msg.studentCard.roll}</p>
                                </div>
                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-150">
                                  Team {msg.studentCard.team.split(' ')[0]}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                  <span>Room: {msg.studentCard.room} ({msg.studentCard.cls})</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Laptop className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                  <span>Laptop: {String(msg.studentCard.laptop).toUpperCase()}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                  <span>Club: {msg.studentCard.club || 'None'}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <BookOpen className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                  <span>Backlogs: <strong>{msg.studentCard.backlogs}</strong></span>
                                </div>
                              </div>
                              {msg.studentCard.project && (
                                <div className="border-t border-gray-200 pt-1.5 text-xs">
                                  <span className="font-semibold text-gray-950 block">Project:</span>
                                  <span className="italic">{msg.studentCard.project}</span>
                                </div>
                              )}
                              <div className="border-t border-gray-200 pt-1.5 space-y-1 text-xs">
                                <div className="flex items-center justify-between">
                                  <span>Email: <a href={`mailto:${msg.studentCard.email}`} className="text-indigo-600 hover:underline">{msg.studentCard.email || 'N/A'}</a></span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>Phone: {msg.studentCard.phone || 'N/A'}</span>
                                </div>
                                <div className="bg-white p-2 rounded-lg border border-gray-200 text-xs mt-1 space-y-0.5 shadow-inner">
                                  <span className="text-gray-500 font-semibold block">Parents Info:</span>
                                  <span className="text-gray-800 font-bold block">{msg.studentCard.parentName || 'N/A'}</span>
                                  <span className="block text-[10px] text-indigo-600 font-mono font-bold">Contacts: {[msg.studentCard.p1, msg.studentCard.p2].filter(Boolean).join(' / ') || 'N/A'}</span>
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  setCurrentView('studentInfo');
                                  setIsOpen(false);
                                }}
                                className="w-full mt-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-semibold rounded-lg text-xs transition-colors"
                              >
                                View in Student Management Portal
                              </button>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 block px-1 mt-0.5">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef}></div>
            </div>

            {/* Quick Suggestions */}
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex flex-wrap gap-1.5 select-none shrink-0">
              <button 
                onClick={() => handleSendMessage("Who is absent today?")}
                className="text-xs font-semibold bg-white hover:bg-gray-150 text-gray-700 px-2.5 py-1.5 rounded-full border border-gray-300 shadow-sm transition-colors"
              >
                Absentees Today
              </button>
              <button 
                onClick={() => handleSendMessage("Who has low attendance?")}
                className="text-xs font-semibold bg-white hover:bg-gray-150 text-gray-700 px-2.5 py-1.5 rounded-full border border-gray-300 shadow-sm transition-colors"
              >
                Low Attendance
              </button>
              <button 
                onClick={() => handleSendMessage("Who has backlogs?")}
                className="text-xs font-semibold bg-white hover:bg-gray-150 text-gray-700 px-2.5 py-1.5 rounded-full border border-gray-300 shadow-sm transition-colors"
              >
                Backlogs List
              </button>
              <button 
                onClick={() => handleSendMessage("Who has backlogs in 1-1?")}
                className="text-xs font-semibold bg-white hover:bg-gray-150 text-gray-700 px-2.5 py-1.5 rounded-full border border-gray-300 shadow-sm transition-colors"
              >
                Sem 1-1 Backlogs
              </button>
              <button 
                onClick={() => handleSendMessage("Who has no laptop?")}
                className="text-xs font-semibold bg-white hover:bg-gray-150 text-gray-700 px-2.5 py-1.5 rounded-full border border-gray-300 shadow-sm transition-colors"
              >
                Laptops Missing
              </button>
              <button 
                onClick={() => handleSendMessage("Go to Settings")}
                className="text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1.5 rounded-full border border-indigo-200 shadow-sm transition-colors"
              >
                Go to Settings
              </button>
            </div>
            {/* Input Footer */}
            <div className="p-4 border-t border-gray-250 bg-white shrink-0">
              <div className="flex items-center space-x-2 bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 focus-within:bg-white transition-all shadow-inner">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !isListening && handleSendMessage()}
                  placeholder={isListening ? "Listening... Speak now!" : "Ask a question..."}
                  disabled={isListening}
                  className="flex-1 bg-transparent border-none outline-none text-gray-800 text-sm placeholder-gray-400 font-sans"
                />
                
                {speechSupported && (
                  <button 
                    onClick={toggleListening}
                    type="button"
                    className={`p-1.5 rounded-lg transition-all ${
                      isListening 
                        ? 'bg-red-50 text-red-600 animate-pulse border border-red-200' 
                        : 'text-gray-400 hover:bg-gray-150 hover:text-gray-700'
                    }`}
                    title={isListening ? "Stop listening" : "Ask with voice"}
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </button>
                )}

                <button 
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isListening}
                  className="p-1.5 rounded-lg text-indigo-600 hover:bg-gray-150 disabled:text-gray-300 transition-colors"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </div>
              <div className="flex justify-between items-center mt-2.5 px-1">
                <span className="text-[11px] text-gray-500 italic">E.g., "Prasad email" or "Prasad 1-1 backlogs"</span>
                <button 
                  onClick={() => setMessages([
                    {
                      sender: 'bot',
                      text: "Chat cleared! Ask me anything about students, backlogs, parent contacts, daily logs, room numbers, laptop status, or switch views.",
                      timestamp: new Date()
                    }
                  ])}
                  className="text-[11px] font-bold text-gray-400 hover:text-red-500 flex items-center transition-colors"
                  title="Clear Conversation"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear Chat
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
