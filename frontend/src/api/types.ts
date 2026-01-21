export type EmailRow = {
  id: number;
  sender: string;
  subject: string;
  body: string;

  summary: string | null;
  category: string | null;

  extracted?: any | null;

  createdAt: string;
  updatedAt: string;
};
