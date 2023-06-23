export interface IOpenAiStoryData {
  title: string;
  chapters: string[];
  characters: ICharacterList[]
}

export interface ICharacterList {
  name: string;
  info: string;
  prompt?: string;
}

export interface IStoryPrompts {
  chapterPrompts: string[];
}