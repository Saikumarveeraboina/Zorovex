// Placeholder AI service — can be extended with OpenAI, Gemini, etc.

export const parseResumeWithAI = async (resumeText) => {
  // Basic keyword extraction — replace with actual AI API call
  const skills = [];
  const commonTechSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'MongoDB',
    'MySQL', 'PostgreSQL', 'TypeScript', 'HTML', 'CSS', 'Express',
    'Next.js', 'Docker', 'Kubernetes', 'AWS', 'Git', 'REST API',
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch',
    'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin'
  ];

  for (const skill of commonTechSkills) {
    if (resumeText.toLowerCase().includes(skill.toLowerCase())) {
      skills.push(skill);
    }
  }

  return {
    skills,
    message: 'AI parsing completed (basic mode)',
  };
};
