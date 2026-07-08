export const CS_FIELDS = [
  {
    id: 'frontend',
    name: 'Frontend Development',
    frameworks: ['React', 'Vue', 'Next.js', 'Angular', 'Svelte', 'Nuxt.js', 'SolidJS', 'HTML/CSS (Vanilla)']
  },
  {
    id: 'backend',
    name: 'Backend Development',
    frameworks: ['Node.js/Express', 'Django', 'FastAPI', 'Spring Boot', 'NestJS', 'ASP.NET Core', 'Laravel', 'Go (Gin/Fiber)', 'Ruby on Rails']
  },
  {
    id: 'fullstack',
    name: 'Fullstack Development',
    frameworks: ['MERN Stack', 'T3 Stack', 'Next.js Fullstack', 'Django + React', 'Laravel + Vue', 'Ruby on Rails']
  },
  {
    id: 'mobile',
    name: 'Mobile Development',
    frameworks: ['Flutter', 'React Native', 'Swift (iOS Native)', 'Kotlin (Android Native)', 'Ionic']
  },
  {
    id: 'ml',
    name: 'Machine Learning / AI',
    frameworks: ['PyTorch', 'TensorFlow', 'Scikit-learn', 'Hugging Face', 'Keras', 'JAX', 'LangChain']
  },
  {
    id: 'datascience',
    name: 'Data Science & Analytics',
    frameworks: ['Pandas/NumPy', 'Apache Spark', 'Tableau/PowerBI', 'R (tidyverse)', 'Jupyter']
  },
  {
    id: 'cybersecurity',
    name: 'Cyber Security',
    frameworks: ['Wireshark', 'Metasploit', 'Nmap', 'Burp Suite', 'Splunk']
  },
  {
    id: 'devops',
    name: 'DevOps & Cloud',
    frameworks: ['Docker/Kubernetes', 'AWS', 'Google Cloud (GCP)', 'Microsoft Azure', 'Terraform', 'GitHub Actions']
  },
  {
    id: 'designer',
    name: 'UI/UX Design',
    frameworks: ['Figma', 'Adobe Creative Cloud', 'Sketch', 'Framer']
  },
  {
    id: 'game',
    name: 'Game Development',
    frameworks: ['Unity (C#)', 'Unreal Engine (C++)', 'Godot', 'Phaser', 'WebGL/Three.js']
  },
  {
    id: 'embedded',
    name: 'Embedded Systems & IoT',
    frameworks: ['Arduino', 'Raspberry Pi', 'ESP32 (C/C++)', 'ROS (Robot OS)', 'FreeRTOS']
  },
  {
    id: 'other',
    name: 'Other Field',
    frameworks: ['Vanilla C++', 'Vanilla Java', 'Vanilla Python', 'Vanilla Rust', 'Vanilla Go', 'Other Framework']
  }
];

export const MASTER_SKILLS = [
  // Core/General CS
  'Object-Oriented Programming (OOP)',
  'Functional Programming (FP)',
  'Data Structures & Algorithms',
  'System Design',
  'Git & Version Control',
  'Software Testing (Unit/Integration)',
  'Agile/Scrum Methodologies',
  'Clean Architecture',
  'Technical Writing',
  'Design Patterns',
  'SQL Queries',
  'NoSQL Databases',
  'RESTful APIs',
  'GraphQL',
  'WebSockets',
  'CI/CD Pipelines',
  'Docker Containerization',
  'Authentication & Authorization',
  'Cryptography',
  'Linux Administration',
  
  // Frontend Specific
  'HTML5 & CSS3',
  'TypeScript',
  'JavaScript (ES6+)',
  'Responsive Web Design',
  'CSS Grid & Flexbox',
  'TailwindCSS',
  'State Management (Redux/Zustand)',
  'Client-Side Routing',
  'Server-Side Rendering (SSR)',
  'Static Site Generation (SSG)',
  'Web Accessibility (a11y)',
  'DOM Manipulation',
  'Web Performance Optimization',
  'CSS-in-JS',
  'SEO Best Practices',
  
  // Backend Specific
  'Database Schema Design',
  'Query Optimization',
  'JWT Authentication',
  'OAuth 2.0',
  'Redis Caching',
  'Message Brokers (RabbitMQ/Kafka)',
  'ORM / ODM (Prisma/Mongoose)',
  'Microservices',
  'Serverless Functions',
  'API Gateway Integration',
  'Rate Limiting & Throttling',
  'Data Serialization (JSON/Protobuf)',
  'File Storage Systems (S3)',
  
  // Mobile Specific
  'Mobile App Lifecycle',
  'Push Notifications',
  'Local DB Storage (SQLite/Room)',
  'Offline Synchronization',
  'Location & GPS Services',
  'Mobile UI Design Guidelines',
  'Bluetooth / BLE Integration',
  
  // ML / AI / Data Science
  'Deep Learning',
  'Natural Language Processing (NLP)',
  'Computer Vision',
  'Neural Networks',
  'Large Language Models (LLMs)',
  'Prompt Engineering',
  'RAG (Retrieval-Augmented Generation)',
  'Vector Databases (Chroma/Pinecone)',
  'Data Preprocessing & Cleaning',
  'Feature Engineering',
  'Statistical Analysis',
  'Data Visualization',
  'Model Training & Evaluation',
  'ETL Pipelines',
  
  // Cyber Security
  'Penetration Testing',
  'Vulnerability Assessment',
  'Network Traffic Analysis',
  'Identity & Access Management (IAM)',
  'Firewalls & Network Security',
  'OWASP Top 10 Security',
  'Reverse Engineering',
  
  // UI/UX Design
  'User Research & Interviews',
  'Wireframing',
  'High-Fidelity Prototyping',
  'Usability Testing',
  'Visual Hierarchy',
  'Typography & Grid Systems',
  'Design Systems',
  'User Journey Mapping',
  
  // Game & Embedded
  '3D Math & Physics',
  'Game Loop Optimization',
  'Shaders & Graphics Pipelines',
  'Multiplayer Networking',
  'Pathfinding & Game AI',
  'Hardware-Software Interfacing',
  'Real-Time Operating Systems (RTOS)',
  'SPI/I2C/UART Protocols',
  'Low-Power Optimization'
].sort();

export function getSuggestedSkills(roles, frameworks) {
  const suggestions = new Set();

  // Normalize inputs (string CSV or arrays)
  const roleList = Array.isArray(roles)
    ? roles
    : (roles ? roles.split(',').map(r => r.trim()).filter(Boolean) : []);
    
  const fwList = Array.isArray(frameworks)
    ? frameworks
    : (frameworks ? frameworks.split(',').map(f => f.trim()).filter(Boolean) : []);

  // Add role-based defaults first
  roleList.forEach(role => {
    const r = role.toLowerCase();
    if (r === 'frontend' || r === 'fullstack') {
      suggestions.add('Responsive Web Design');
      suggestions.add('Git & Version Control');
      suggestions.add('State Management (Redux/Zustand)');
      suggestions.add('RESTful APIs');
      suggestions.add('TypeScript');
    }
    if (r === 'backend' || r === 'fullstack') {
      suggestions.add('Database Schema Design');
      suggestions.add('RESTful APIs');
      suggestions.add('Authentication & Authorization');
      suggestions.add('Git & Version Control');
      suggestions.add('SQL Queries');
    }
    if (r === 'ml') {
      suggestions.add('Deep Learning');
      suggestions.add('Data Preprocessing & Cleaning');
      suggestions.add('Model Training & Evaluation');
      suggestions.add('Data Structures & Algorithms');
    }
    if (r === 'datascience') {
      suggestions.add('Data Visualization');
      suggestions.add('Statistical Analysis');
      suggestions.add('SQL Queries');
      suggestions.add('ETL Pipelines');
    }
    if (r === 'mobile') {
      suggestions.add('Mobile App Lifecycle');
      suggestions.add('Push Notifications');
      suggestions.add('Local DB Storage (SQLite/Room)');
      suggestions.add('Git & Version Control');
    }
    if (r === 'cybersecurity') {
      suggestions.add('Penetration Testing');
      suggestions.add('Network Traffic Analysis');
      suggestions.add('Cryptography');
      suggestions.add('Linux Administration');
    }
    if (r === 'devops') {
      suggestions.add('CI/CD Pipelines');
      suggestions.add('Docker Containerization');
      suggestions.add('Linux Administration');
      suggestions.add('Git & Version Control');
    }
    if (r === 'designer') {
      suggestions.add('Wireframing');
      suggestions.add('High-Fidelity Prototyping');
      suggestions.add('Design Systems');
      suggestions.add('Usability Testing');
    }
    if (r === 'game') {
      suggestions.add('3D Math & Physics');
      suggestions.add('Game Loop Optimization');
      suggestions.add('Design Patterns');
    }
    if (r === 'embedded') {
      suggestions.add('Hardware-Software Interfacing');
      suggestions.add('SPI/I2C/UART Protocols');
      suggestions.add('Low-Power Optimization');
    }
  });

  // Framework-specific overrides
  fwList.forEach(framework => {
    const fw = framework.toLowerCase();
    if (fw.includes('react') || fw.includes('next.js') || fw.includes('t3')) {
      suggestions.add('TypeScript');
      suggestions.add('State Management (Redux/Zustand)');
      suggestions.add('TailwindCSS');
      suggestions.add('Server-Side Rendering (SSR)');
    }
    if (fw.includes('vue') || fw.includes('nuxt')) {
      suggestions.add('JavaScript (ES6+)');
      suggestions.add('TailwindCSS');
      suggestions.add('Server-Side Rendering (SSR)');
    }
    if (fw.includes('node') || fw.includes('nestjs') || fw.includes('express')) {
      suggestions.add('ORM / ODM (Prisma/Mongoose)');
      suggestions.add('JWT Authentication');
      suggestions.add('RESTful APIs');
    }
    if (fw.includes('django') || fw.includes('laravel')) {
      suggestions.add('Database Schema Design');
      suggestions.add('RESTful APIs');
      suggestions.add('Authentication & Authorization');
    }
    if (fw.includes('pytorch') || fw.includes('tensorflow') || fw.includes('keras')) {
      suggestions.add('Neural Networks');
      suggestions.add('Model Training & Evaluation');
    }
    if (fw.includes('langchain') || fw.includes('hugging face')) {
      suggestions.add('Large Language Models (LLMs)');
      suggestions.add('Vector Databases (Chroma/Pinecone)');
      suggestions.add('RAG (Retrieval-Augmented Generation)');
    }
    if (fw.includes('docker') || fw.includes('kubernetes')) {
      suggestions.add('Docker Containerization');
      suggestions.add('CI/CD Pipelines');
    }
    if (fw.includes('figma')) {
      suggestions.add('Design Systems');
      suggestions.add('Wireframing');
    }
  });

  // Fallback if suggestions is empty
  if (suggestions.size === 0) {
    return ['Data Structures & Algorithms', 'Git & Version Control', 'Software Testing (Unit/Integration)', 'System Design', 'Object-Oriented Programming (OOP)'];
  }

  return Array.from(suggestions).slice(0, 8);
}
