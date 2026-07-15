export type DoguMood = "idle" | "happy" | "think" | "correct" | "wrong" | "excited"; 
 
export interface Question { 
  category: string; 
  question: string; 
  choices: string[]; 
  answer: number; 
  explanation: string; 
  hint: string; 
} 
