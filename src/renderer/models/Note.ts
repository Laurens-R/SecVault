export interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export type NewNote = Omit<Note, 'id' | 'createdAt' | 'updatedAt'>
