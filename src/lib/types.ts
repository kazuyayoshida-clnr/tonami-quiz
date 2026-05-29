export type DoguMood = "idle" | "happy" | "think" | "correct" | "wrong" | "excited";

export interface Question {
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
  hint: string;
}

export interface Message {
  id: string;
  role: "dogu" | "user";
  content: string;
  mood: DoguMood;
}
