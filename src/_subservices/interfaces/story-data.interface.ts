export interface IOpenAiStoryData {
  title: string;
  chapters: string[];
  characters: ICharacterList[]
}

export interface ICharacterList {
  name: string;
  description: string;
  prompt?: string;
}

export interface IStoryPrompts {
  chapterPrompts: string[];
}